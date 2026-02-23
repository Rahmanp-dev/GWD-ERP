"use server";

import dbConnect from "@/lib/db";
import ContentItem from "@/lib/models/ContentItem";
import ApprovalPolicy from "@/lib/models/ApprovalPolicy";
import User from "@/lib/models/User";
import { revalidatePath } from "next/cache";

// Helper to get or create policy
async function getPolicyForVertical(vertical: string) {
    let policy = await ApprovalPolicy.findOne({ vertical });
    if (!policy) {
        // Defaults based on plan
        const isPremium = ['Founder', 'Sponsor', 'Title-sponsor'].includes(vertical);
        policy = await ApprovalPolicy.create({
            vertical,
            require_ceo_signoff: isPremium,
            auto_escalate: isPremium,
            allow_strategist_publish: !isPremium
        });
    }
    return policy;
}

export async function requestReview(contentId: string, requesterId: string) {
    await dbConnect();

    // In a real app we would verify requesterId and permissions
    const content = await ContentItem.findById(contentId);
    if (!content) throw new Error("Content not found");
    if (content.status !== 'draft' && content.status !== 'changes_requested') {
        throw new Error("Can only request review from draft state");
    }

    content.status = 'in_review_l1';
    await content.save();

    // Trigger notification to L1 approvers ideally...
    revalidatePath('/content');
    revalidatePath(`/content/${contentId}`);
    return { success: true, status: content.status };
}

export async function approveContent(
    contentId: string,
    userId: string,
    role: string,
    level: 'level_1' | 'level_2',
    decision: 'approved' | 'changes',
    note?: string
) {
    await dbConnect();

    const content = await ContentItem.findById(contentId);
    if (!content) throw new Error("Content not found");

    const policy = await getPolicyForVertical(content.vertical);

    // Append to audit trail
    content.approvals.push({
        level,
        approverId: userId,
        role,
        decision,
        note,
        timestamp: new Date()
    });

    if (decision === 'changes') {
        content.status = 'draft'; // Revert back to draft or explicit changes_requested
        await content.save();
        revalidatePath('/content');
        return { success: true, status: content.status };
    }

    // Handle Approval logic
    if (level === 'level_1') {
        if (content.status !== 'in_review_l1') throw new Error("Content not in L1 review");

        // Is CEO signoff bypassed via delegation?
        const isDelegated =
            (policy.delegated_userId && policy.delegated_userId.toString() === userId) ||
            (content.delegated_to_userId && content.delegated_to_userId.toString() === userId);

        if ((!policy.require_ceo_signoff || isDelegated) && !policy.auto_escalate) {
            // Can publish straight away?
            if (policy.allow_strategist_publish) {
                content.status = 'scheduled'; // or published
            } else {
                content.status = 'approved_l1'; // Needs publisher
            }
        } else {
            // Escalate to L2
            content.status = 'in_review_l2';
        }
    } else if (level === 'level_2') {
        if (content.status !== 'in_review_l2') throw new Error("Content not in L2 review");
        content.status = 'scheduled'; // final approval yields scheduled
    }

    await content.save();
    revalidatePath('/content');
    return { success: true, status: content.status };
}

export async function delegateApproval(vertical: string, targetUserId: string) {
    await dbConnect();
    // Verify target user is eligible (e.g. Content Strategist)
    let policy = await getPolicyForVertical(vertical);
    policy.delegated_userId = targetUserId;
    await policy.save();
    revalidatePath('/admin/approval-policies');
    return { success: true };
}

export async function getContentQueue(role: string, userId: string) {
    await dbConnect();

    let query = {};

    if (role === 'Content Strategist' || role === 'Production Lead') {
        query = {
            $or: [
                { status: 'draft' }, // Items they are working on
                { status: 'in_review_l1' } // Items awaiting their L1 signoff
            ]
        };
    } else if (role === 'CEO') {
        query = { status: 'in_review_l2' }; // Items waiting CEO signoff
    } else if (role === 'Admin') {
        query = {}; // All
    }

    const items = await ContentItem.find(query)
        .sort({ createdAt: -1 })
        .populate('delegated_to_userId', 'name')
        .populate('approvals.approverId', 'name image')
        .lean();

    return items;
}

export async function getAllContent() {
    await dbConnect();
    return ContentItem.find()
        .sort({ createdAt: -1 })
        .populate('approvals.approverId', 'name image')
        .lean();
}

export async function createContent(data: any) {
    await dbConnect();
    const item = await ContentItem.create(data);
    revalidatePath('/content');
    return { success: true, item: JSON.parse(JSON.stringify(item)) };
}

export async function approveProductionAsset(contentId: string, assetId: string, userId: string, decision: 'approved' | 'changes', note?: string) {
    await dbConnect();
    const content = await ContentItem.findById(contentId);
    if (!content) throw new Error("Content not found");

    content.production_approvals.push({
        assetId,
        approverId: userId,
        decision,
        note,
        timestamp: new Date()
    });

    await content.save();
    revalidatePath('/content');
    return { success: true };
}
