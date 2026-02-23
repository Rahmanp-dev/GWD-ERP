"use server";

import dbConnect from "@/lib/db";
import ContentModule from "@/lib/models/ContentModule";
import ContentRequest from "@/lib/models/ContentRequest";
import ContentItem from "@/lib/models/ContentItem";
import User from "@/lib/models/User";
import { revalidatePath } from "next/cache";

export async function createContentModule(data: any) {
    await dbConnect();
    const module = await ContentModule.create(data);
    revalidatePath('/content');
    return { success: true, module: JSON.parse(JSON.stringify(module)) };
}

export async function getActiveModules() {
    await dbConnect();
    const modules = await ContentModule.find({ status: { $ne: 'Archived' } })
        .populate('associatedHeadId', 'name')
        .sort({ createdAt: -1 })
        .lean();
    return JSON.parse(JSON.stringify(modules));
}

export async function submitContentRequest(data: any) {
    await dbConnect();
    const request = await ContentRequest.create(data);
    revalidatePath('/content');
    revalidatePath('/requests/content');
    return { success: true, request: JSON.parse(JSON.stringify(request)) };
}

export async function getPendingRequests() {
    await dbConnect();
    const requests = await ContentRequest.find({ status: 'Pending' })
        .populate('requestedById', 'name email')
        .sort({ urgency: -1, createdAt: 1 })
        .lean();
    return JSON.parse(JSON.stringify(requests));
}

export async function convertRequestToIdea(requestId: string, ideaData: any) {
    await dbConnect();

    // Create the ContentItem
    const item = await ContentItem.create({
        ...ideaData,
        status: 'draft'
    });

    // Mark Request as Accepted and linked
    await ContentRequest.findByIdAndUpdate(requestId, {
        status: 'Accepted',
        convertedToIdeaId: item._id
    });

    revalidatePath('/content');
    return { success: true, idea: JSON.parse(JSON.stringify(item)) };
}

export async function rejectContentRequest(requestId: string) {
    await dbConnect();
    await ContentRequest.findByIdAndUpdate(requestId, { status: 'Rejected' });
    revalidatePath('/content');
    return { success: true };
}

export async function assignEditor(ideaId: string, editorId: string) {
    await dbConnect();
    const item = await ContentItem.findByIdAndUpdate(
        ideaId,
        { assignedEditorId: editorId, status: 'editing', updatedAt: new Date() },
        { new: true }
    );
    revalidatePath('/content');
    return { success: true, item: JSON.parse(JSON.stringify(item)) };
}

export async function updateIdeaStatus(ideaId: string, status: string) {
    await dbConnect();
    const item = await ContentItem.findByIdAndUpdate(
        ideaId,
        { status, updatedAt: new Date() },
        { new: true }
    );
    revalidatePath('/content');
    return { success: true, item: JSON.parse(JSON.stringify(item)) };
}

// Fetches ideas linked to a specific module OR all ideas if no moduleId provided
// If userId and role=Editor are provided, filter only to their assigned items
export async function getIdeas(moduleId?: string, userId?: string, role?: string) {
    await dbConnect();

    let filter: any = {};
    if (moduleId) {
        filter.moduleId = moduleId;
    }

    // Hard filter for editors to only see their own tasks
    if (role === 'Editor' && userId) {
        filter.assignedEditorId = userId;
    }
    const ideas = await ContentItem.find(filter)
        .populate({ path: 'assignedEditorId', select: 'name', strictPopulate: false })
        .populate({ path: 'assignedStrategistId', select: 'name', strictPopulate: false })
        .populate({ path: 'moduleId', select: 'name category', strictPopulate: false })
        .populate({ path: 'comments.userId', select: 'name image', strictPopulate: false })
        .sort({ updatedAt: -1 })
        .lean();
    return JSON.parse(JSON.stringify(ideas));
}

export async function getProductionUsers() {
    await dbConnect();
    // Fetch users who might be editors or strategists
    const users = await User.find({
        role: { $in: ['Production Lead', 'Content Strategist', 'Editor', 'User', 'Admin'] }
    }).select('name role').lean();
    return JSON.parse(JSON.stringify(users));
}

export async function updateIdeaDetails(ideaId: string, details: any) {
    await dbConnect();
    const item = await ContentItem.findByIdAndUpdate(
        ideaId,
        { ...details, updatedAt: new Date() },
        { new: true }
    );
    revalidatePath('/content');
    return { success: true, item: JSON.parse(JSON.stringify(item)) };
}

export async function addIdeaComment(ideaId: string, userId: string, text: string, type: string = 'general') {
    await dbConnect();
    const item = await ContentItem.findByIdAndUpdate(
        ideaId,
        {
            $push: { comments: { userId, text, type } },
            updatedAt: new Date()
        },
        { new: true }
    );
    revalidatePath('/content');
    return { success: true, comment: JSON.parse(JSON.stringify(item.comments.slice(-1)[0])) };
}

export async function addAssetVersion(ideaId: string, userId: string, assetUrl: string) {
    await dbConnect();

    // First get the current item to calculate the next version number
    const currentItem = await ContentItem.findById(ideaId);
    if (!currentItem) throw new Error("Item not found");

    const nextVersion = (currentItem.versions?.length || 0) + 1;

    // Check if there was an active feedback comment pending, we might want to automatically resolve it, 
    // but for now let's just push the version array

    const item = await ContentItem.findByIdAndUpdate(
        ideaId,
        {
            $push: { versions: { versionNumber: nextVersion, assetUrl, submittedById: userId, status: 'pending' } },
            // Auto-move back to review whenever a new version drops
            status: 'review',
            updatedAt: new Date()
        },
        { new: true }
    );

    revalidatePath('/content');
    return { success: true, version: JSON.parse(JSON.stringify(item.versions.slice(-1)[0])) };
}

export async function submitVersionFeedback(ideaId: string, versionId: string, feedback: string, decision: 'approved' | 'rejected') {
    await dbConnect();

    const item = await ContentItem.findOneAndUpdate(
        { _id: ideaId, 'versions._id': versionId },
        {
            $set: {
                'versions.$.feedback': feedback,
                'versions.$.status': decision
            },
            status: decision === 'approved' ? 'approved_l1' : 'revision',
            updatedAt: new Date()
        },
        { new: true }
    );

    revalidatePath('/content');
    return { success: true, item: JSON.parse(JSON.stringify(item)) };
}

// Archive a content item (soft-delete). Any role can archive.
export async function archiveContentItem(ideaId: string) {
    await dbConnect();
    const item = await ContentItem.findByIdAndUpdate(
        ideaId,
        { status: 'archived', updatedAt: new Date() },
        { new: true }
    );
    revalidatePath('/content');
    return { success: true, item: JSON.parse(JSON.stringify(item)) };
}

// Restore an archived content item back to draft
export async function restoreContentItem(ideaId: string) {
    await dbConnect();
    const item = await ContentItem.findByIdAndUpdate(
        ideaId,
        { status: 'draft', updatedAt: new Date() },
        { new: true }
    );
    revalidatePath('/content');
    return { success: true, item: JSON.parse(JSON.stringify(item)) };
}

// Permanently delete a content item (CEO only — checked client-side)
export async function deleteContentItem(ideaId: string) {
    await dbConnect();
    await ContentItem.findByIdAndDelete(ideaId);
    revalidatePath('/content');
    return { success: true };
}

// Archive a module (sets status to Archived, hides from default views)
export async function archiveContentModule(moduleId: string) {
    await dbConnect();
    const module = await ContentModule.findByIdAndUpdate(
        moduleId,
        { status: 'Archived', updatedAt: new Date() },
        { new: true }
    );
    revalidatePath('/content');
    return { success: true, module: JSON.parse(JSON.stringify(module)) };
}

// Restore an archived module
export async function restoreContentModule(moduleId: string) {
    await dbConnect();
    const module = await ContentModule.findByIdAndUpdate(
        moduleId,
        { status: 'Active', updatedAt: new Date() },
        { new: true }
    );
    revalidatePath('/content');
    return { success: true, module: JSON.parse(JSON.stringify(module)) };
}

// Permanently delete a module and all its items (CEO only)
export async function deleteContentModule(moduleId: string) {
    await dbConnect();
    await ContentItem.deleteMany({ moduleId });
    await ContentModule.findByIdAndDelete(moduleId);
    revalidatePath('/content');
    return { success: true };
}
