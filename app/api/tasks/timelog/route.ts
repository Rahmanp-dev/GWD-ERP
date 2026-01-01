import { auth } from "@/auth";
import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

/**
 * Log time to a task
 * POST /api/tasks/timelog
 * Body: { taskId, hours, description }
 */
export async function POST(req: Request) {
    try {
        const session = await auth();
        if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { default: dbConnect } = await import("@/lib/db");
        await dbConnect();
        const { default: Task } = await import("@/lib/models/Task");

        const body = await req.json();
        const { taskId, hours, description } = body;

        if (!taskId || !hours) {
            return NextResponse.json({ error: "Task ID and hours are required" }, { status: 400 });
        }

        const task = await Task.findByIdAndUpdate(
            taskId,
            {
                $push: {
                    timeLogs: {
                        hours,
                        description,
                        loggedBy: session.user?.id,
                        loggedAt: new Date()
                    }
                },
                updatedAt: new Date()
            },
            { new: true }
        );

        if (!task) {
            return NextResponse.json({ error: "Task not found" }, { status: 404 });
        }

        return NextResponse.json(task);
    } catch (e: any) {
        console.error("Time Log Error:", e);
        return NextResponse.json({ error: "Server Error" }, { status: 500 });
    }
}
