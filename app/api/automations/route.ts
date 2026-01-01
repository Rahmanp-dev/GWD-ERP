import { auth } from "@/auth";
import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// GET: Fetch all automations
export async function GET(req: Request) {
    try {
        const session = await auth();
        if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        // Only admins/managers can view automations
        const allowedRoles = ['CEO', 'Admin', 'admin', 'Sales Manager'];
        if (!allowedRoles.includes(session.user?.role || '')) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const { default: dbConnect } = await import("@/lib/db");
        await dbConnect();
        const { default: Automation } = await import("@/lib/models/Automation");

        const automations = await Automation.find({}).sort({ createdAt: -1 });
        return NextResponse.json(automations);
    } catch (e: any) {
        console.error("Automations GET Error:", e);
        return NextResponse.json({ error: "Server Error" }, { status: 500 });
    }
}

// POST: Create new automation
export async function POST(req: Request) {
    try {
        const session = await auth();
        if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const allowedRoles = ['CEO', 'Admin', 'admin', 'Sales Manager'];
        if (!allowedRoles.includes(session.user?.role || '')) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const { default: dbConnect } = await import("@/lib/db");
        await dbConnect();
        const { default: Automation } = await import("@/lib/models/Automation");

        const body = await req.json();

        if (!body.name || !body.trigger?.type) {
            return NextResponse.json({ error: "Name and trigger type required" }, { status: 400 });
        }

        const automation = await Automation.create({
            ...body,
            createdBy: session.user?.id
        });

        return NextResponse.json(automation, { status: 201 });
    } catch (e: any) {
        console.error("Automations POST Error:", e);
        return NextResponse.json({ error: "Server Error" }, { status: 500 });
    }
}

// PUT: Update automation
export async function PUT(req: Request) {
    try {
        const session = await auth();
        if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const allowedRoles = ['CEO', 'Admin', 'admin', 'Sales Manager'];
        if (!allowedRoles.includes(session.user?.role || '')) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const { default: dbConnect } = await import("@/lib/db");
        await dbConnect();
        const { default: Automation } = await import("@/lib/models/Automation");

        const body = await req.json();
        const { id, ...updateData } = body;

        if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

        const automation = await Automation.findByIdAndUpdate(
            id,
            { ...updateData, updatedAt: new Date() },
            { new: true }
        );

        return NextResponse.json(automation);
    } catch (e: any) {
        console.error("Automations PUT Error:", e);
        return NextResponse.json({ error: "Server Error" }, { status: 500 });
    }
}
