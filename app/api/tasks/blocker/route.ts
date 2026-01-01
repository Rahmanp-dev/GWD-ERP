import { auth } from "@/auth";
import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

/**
 * Add blocker to a task
 * POST /api/tasks/blocker
 * Body: { taskId, description }
 */
export async function POST(req: Request) {
    try {
        const session = await auth();
        if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { default: dbConnect } = await import("@/lib/db");
        await dbConnect();
        const { default: Task } = await import("@/lib/models/Task");

        const body = await req.json();
        const { taskId, description } = body;

        if (!taskId || !description) {
            return NextResponse.json({ error: "Task ID and description are required" }, { status: 400 });
        }

        const task = await Task.findByIdAndUpdate(
            taskId,
            {
                $push: {
                    blockers: {
                        description,
                        isResolved: false,
                        reportedBy: session.user?.id,
                        reportedAt: new Date()
                    }
                },
                status: 'Blocked',
                updatedAt: new Date()
            },
            { new: true }
        );

        if (!task) {
            return NextResponse.json({ error: "Task not found" }, { status: 404 });
        }

        return NextResponse.json(task);
    } catch (e: any) {
        console.error("Blocker Error:", e);
        return NextResponse.json({ error: "Server Error" }, { status: 500 });
    }
}

/**
 * Resolve a blocker
 * PUT /api/tasks/blocker
 * Body: { taskId, blockerIndex }
 */
export async function PUT(req: Request) {
    try {
        const session = await auth();
        if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { default: dbConnect } = await import("@/lib/db");
        await dbConnect();
        const { default: Task } = await import("@/lib/models/Task");

        const body = await req.json();
        const { taskId, blockerIndex } = body;

        if (!taskId || blockerIndex === undefined) {
            return NextResponse.json({ error: "Task ID and blocker index are required" }, { status: 400 });
        }

        const task = await Task.findById(taskId);
        if (!task) {
            return NextResponse.json({ error: "Task not found" }, { status: 404 });
        }

        if (task.blockers[blockerIndex]) {
            task.blockers[blockerIndex].isResolved = true;
            task.blockers[blockerIndex].resolvedAt = new Date();
        }

        // If all blockers resolved, consider unblocking
        const hasOpenBlockers = task.blockers.some((b: any) => !b.isResolved);
        if (!hasOpenBlockers && task.status === 'Blocked') {
            task.status = 'In Progress';
        }

        await task.save();

        return NextResponse.json(task);
    } catch (e: any) {
        console.error("Resolve Blocker Error:", e);
        return NextResponse.json({ error: "Server Error" }, { status: 500 });
    }
}
