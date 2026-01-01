import { auth } from "@/auth";
import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(req: Request) {
    try {
        const session = await auth();
        if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { default: dbConnect } = await import("@/lib/db");
        await dbConnect();
        const { default: Lead } = await import("@/lib/models/Lead");
        // Import User model to register schema before populate
        await import("@/lib/models/User");

        const { searchParams } = new URL(req.url);
        const ownerId = searchParams.get('ownerId');
        const status = searchParams.get('status');
        const priority = searchParams.get('priority');

        let query: any = {};
        if (ownerId) query.assignedTo = ownerId;
        if (status) query.status = status;
        if (priority) query.priority = priority;

        // Fetch leads sorted by order for Kanban, and populate assignedTo for UI
        const leads = await Lead.find(query).sort({ order: 1 }).populate('assignedTo', 'name image email');
        return NextResponse.json(leads);
    } catch (e: any) {
        console.error("Leads GET Error:", e);
        return NextResponse.json({ error: "Server Error" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const session = await auth();
        if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { default: dbConnect } = await import("@/lib/db");
        await dbConnect();
        const { default: Lead } = await import("@/lib/models/Lead");

        const body = await req.json();

        if (!body.title) {
            return NextResponse.json({ error: "Title is required" }, { status: 400 });
        }

        const maxOrderLead = await Lead.findOne({ status: body.status || 'Lead' }).sort({ order: -1 });
        const newOrder = (maxOrderLead?.order || 0) + 1;

        const lead = await Lead.create({
            ...body,
            order: newOrder,
            assignedTo: body.assignedTo || session.user?.id,
        });

        return NextResponse.json(lead, { status: 201 });
    } catch (e: any) {
        console.error("Leads POST Error:", e);
        return NextResponse.json({ error: "Server Error" }, { status: 500 });
    }
}

export async function PUT(req: Request) {
    try {
        const session = await auth();
        if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { default: dbConnect } = await import("@/lib/db");
        await dbConnect();
        const { default: Lead } = await import("@/lib/models/Lead");

        const body = await req.json();
        const { id, ...updateData } = body;

        if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

        // Get current lead state for automation comparison
        const oldLead = await Lead.findById(id);
        const oldStatus = oldLead?.status;

        // Update the lead
        const lead = await Lead.findByIdAndUpdate(id, {
            ...updateData,
            updatedAt: new Date()
        }, { new: true });

        // Trigger automations if status changed
        if (lead && oldStatus && updateData.status && oldStatus !== updateData.status) {
            try {
                const { triggerDealAutomation } = await import("@/lib/automation-engine");
                await triggerDealAutomation(
                    lead._id.toString(),
                    lead.title,
                    oldStatus,
                    updateData.status,
                    lead.value,
                    lead.assignedTo?.toString()
                );
            } catch (automationError) {
                console.error("Automation trigger failed:", automationError);
                // Don't fail the request if automation fails
            }
        }

        return NextResponse.json(lead);
    } catch (e: any) {
        console.error("Leads PUT Error:", e);
        return NextResponse.json({ error: "Server Error" }, { status: 500 });
    }
}
