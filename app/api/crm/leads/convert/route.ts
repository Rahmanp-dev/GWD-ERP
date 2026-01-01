import { auth } from "@/auth";
import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

/**
 * Convert a Closed Won deal into a new Project
 * POST /api/crm/leads/convert
 * Body: { dealId: string }
 */
export async function POST(req: Request) {
    try {
        const session = await auth();
        if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { default: dbConnect } = await import("@/lib/db");
        await dbConnect();
        const { default: Lead } = await import("@/lib/models/Lead");
        const { default: Project } = await import("@/lib/models/Project");

        const body = await req.json();
        const { dealId } = body;

        if (!dealId) {
            return NextResponse.json({ error: "Deal ID is required" }, { status: 400 });
        }

        // Fetch the deal
        const deal = await Lead.findById(dealId);
        if (!deal) {
            return NextResponse.json({ error: "Deal not found" }, { status: 404 });
        }

        // Optionally validate that deal is Closed Won
        if (deal.status !== 'Closed Won') {
            return NextResponse.json({ error: "Only 'Closed Won' deals can be converted to projects" }, { status: 400 });
        }

        // Check if already linked to a project
        const existingProject = await Project.findOne({ linkedDealId: dealId });
        if (existingProject) {
            return NextResponse.json({
                error: "Deal already converted",
                projectId: existingProject._id
            }, { status: 409 });
        }

        // Create the project from the deal
        const project = await Project.create({
            title: deal.title,
            description: `Project created from deal: ${deal.title}`,
            client: deal.accountName,
            clientContact: deal.contactPerson,
            manager: session.user?.id,
            linkedDealId: deal._id,
            budget: {
                estimated: deal.value || 0,
                actual: 0,
                currency: 'USD'
            },
            status: 'Planning',
            health: 'Green'
        });

        // Optionally update the deal with a reference
        // await Lead.findByIdAndUpdate(dealId, { convertedProjectId: project._id });

        return NextResponse.json({
            success: true,
            project: {
                _id: project._id,
                title: project.title
            }
        }, { status: 201 });

    } catch (e: any) {
        console.error("Deal Conversion Error:", e);
        return NextResponse.json({ error: "Server Error" }, { status: 500 });
    }
}
