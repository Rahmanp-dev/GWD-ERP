import { auth } from "@/auth";
import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
    try {
        const session = await auth();
        if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { default: dbConnect } = await import("@/lib/db");
        await dbConnect();
        const { default: Task } = await import("@/lib/models/Task");
        await import("@/lib/models/User");
        await import("@/lib/models/KPI");

        const tasks = await Task.find({
            assignee: session.user?.id,
            status: { $ne: 'Archived' }
        })
            .populate('requester', 'name role image')
            .populate('linkedKPI', 'title')
            .sort({ dueDate: 1, createdAt: -1 })
            .lean();

        // Serialize for client
        const serialized = JSON.parse(JSON.stringify(tasks));
        return NextResponse.json(serialized);
    } catch (e: any) {
        console.error("My Tasks GET Error:", e);
        return NextResponse.json([]);
    }
}

// Postpone a task (move due date to tomorrow)
export async function PUT(req: Request) {
    try {
        const session = await auth();
        if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { default: dbConnect } = await import("@/lib/db");
        await dbConnect();
        const { default: Task } = await import("@/lib/models/Task");

        const body = await req.json();
        const { taskId, action } = body;

        if (!taskId) return NextResponse.json({ error: "Task ID required" }, { status: 400 });

        if (action === 'postpone') {
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            tomorrow.setHours(9, 0, 0, 0);

            await Task.findByIdAndUpdate(taskId, { dueDate: tomorrow });
            return NextResponse.json({ message: "Task postponed to tomorrow" });
        }

        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    } catch (e: any) {
        console.error("My Tasks PUT Error:", e);
        return NextResponse.json({ error: "Server Error" }, { status: 500 });
    }
}
