"use server";

import dbConnect from "@/lib/db";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

// --- CRM & Automation Actions ---

export async function getFocusLeads() {
    await dbConnect();
    const session = await auth();
    if (!session) return { stale: [], today: [] };

    const { default: Lead } = await import("@/lib/models/Lead");

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    // Stale Leads: No activity for 7 days and not Closed
    const staleLeads = await Lead.find({
        status: { $nin: ['Closed Won', 'Closed Lost'] },
        $or: [
            { 'activityStats.lastActivityDays': { $gt: 7 } },
            { updatedAt: { $lt: sevenDaysAgo } }
        ]
    }).sort({ value: -1 }).limit(5).lean();

    // Today's Follow-ups
    const todayLeads = await Lead.find({
        status: { $nin: ['Closed Won', 'Closed Lost'] },
        nextFollowUp: { $gte: todayStart, $lte: todayEnd }
    }).sort({ priority: 1 }).lean();

    return {
        stale: staleLeads.map((l: any) => ({ ...l, _id: l._id.toString() })),
        today: todayLeads.map((l: any) => ({ ...l, _id: l._id.toString() }))
    };
}

export async function updateLeadStage(leadId: string, newStage: string) {
    await dbConnect();
    const session = await auth();
    if (!session) throw new Error("Unauthorized");

    const { default: Lead } = await import("@/lib/models/Lead");
    const { default: Task } = await import("@/lib/models/Task");

    const lead = await Lead.findById(leadId);
    if (!lead) throw new Error("Lead not found");

    const oldStage = lead.status;
    let updates: any = { status: newStage };
    let taskToCreate = null;

    // --- Automation Logic ---

    if (newStage === 'Proposal' && oldStage !== 'Proposal') {
        // Auto-update probability
        if (!lead.automationFlags?.manualOverride) {
            updates.probability = 60;
        }
        // Trigger Task: Prepare Proposal
        taskToCreate = {
            title: `Prepare Proposal for ${lead.title}`,
            description: "Generated automatically by CRM. Please attach proposal PDF.",
            priority: "High",
            dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000) // Tomorrow
        };
    }

    if (newStage === 'Negotiation') {
        if (!lead.automationFlags?.manualOverride) {
            updates.probability = 80;
        }
        taskToCreate = {
            title: `Draft Contract for ${lead.accountName || lead.title}`,
            description: "Deal reached Negotiation stage. Legal review required.",
            priority: "High",
            dueDate: new Date(Date.now() + 48 * 60 * 60 * 1000)
        };
    }

    if (newStage === 'Closed Won') {
        updates.probability = 100;
        updates.closedDate = new Date();
        updates.value = lead.value; // Lock value?

        // TODO: Trigger Finance Invoice creation here if needed
        taskToCreate = {
            title: `Onboard Client: ${lead.accountName}`,
            description: "Deal Won! Handover to Operations.",
            priority: "Critical",
            dueDate: new Date()
        };
    }

    if (newStage === 'Closed Lost') {
        updates.probability = 0;
        updates.closedDate = new Date();
        // UI should prompt for lossReason, but we handle stage change here
    }

    // Apply Updates
    await Lead.findByIdAndUpdate(leadId, updates);

    // Create Task if triggered
    if (taskToCreate) {
        await Task.create({
            ...taskToCreate,
            assignee: lead.assignedTo || session.user?.id,
            requester: session.user?.id,
            status: "To Do",
            project: null // Could link to a CRM project if exists
        });
    }

    revalidatePath('/crm/pipeline');
    revalidatePath('/crm/dashboard');
}

export async function logActivity(leadId: string, type: 'Call' | 'Email' | 'Meeting', notes: string) {
    await dbConnect();
    const session = await auth();
    const { default: Lead } = await import("@/lib/models/Lead");

    await Lead.findByIdAndUpdate(leadId, {
        $push: {
            notes: {
                content: `[${type}] ${notes}`,
                author: session?.user?.id,
                createdAt: new Date()
            }
        },
        $inc: {
            [`activityStats.${type.toLowerCase()}s`]: 1 // calls, emails, meetings
        },
        updatedAt: new Date()
    });

    revalidatePath('/crm/pipeline');
}
