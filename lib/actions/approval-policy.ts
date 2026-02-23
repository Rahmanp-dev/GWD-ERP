"use server";

import dbConnect from "@/lib/db";
import ApprovalPolicy from "@/lib/models/ApprovalPolicy";
import User from "@/lib/models/User";
import { revalidatePath } from "next/cache";

export async function getAllApprovalPolicies() {
    await dbConnect();

    // Auto-seed policies if collection is empty
    const count = await ApprovalPolicy.countDocuments();
    if (count === 0) {
        const defaultVerticals = [
            { vertical: 'Founder', require_ceo_signoff: true, auto_escalate: true, allow_strategist_publish: false },
            { vertical: 'Social', require_ceo_signoff: false, auto_escalate: false, allow_strategist_publish: true },
            { vertical: 'Events', require_ceo_signoff: false, auto_escalate: false, allow_strategist_publish: true },
            { vertical: 'Sponsor', require_ceo_signoff: true, auto_escalate: true, allow_strategist_publish: false },
            { vertical: 'Title-sponsor', require_ceo_signoff: true, auto_escalate: true, allow_strategist_publish: false },
            { vertical: 'Academy', require_ceo_signoff: false, auto_escalate: false, allow_strategist_publish: true }
        ];
        await ApprovalPolicy.insertMany(defaultVerticals);
    }

    return ApprovalPolicy.find()
        .populate('delegated_userId', 'name email')
        .sort({ vertical: 1 })
        .lean();
}

export async function updateApprovalPolicy(policyId: string, data: any) {
    await dbConnect();
    await ApprovalPolicy.findByIdAndUpdate(policyId, data, { new: true });
    revalidatePath('/admin/approval-policies');
    return { success: true };
}

export async function getEligibleDelegates() {
    await dbConnect();
    return User.find({ role: 'Content Strategist' }).select('name email').lean();
}
