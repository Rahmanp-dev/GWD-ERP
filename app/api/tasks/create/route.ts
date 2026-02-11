import { auth } from "@/auth";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        const session = await auth();
        if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { default: dbConnect } = await import("@/lib/db");
        await dbConnect();
        const { default: Task } = await import("@/lib/models/Task");

        const body = await req.json();

        if (!body.title) {
            return NextResponse.json({ error: "Title is required" }, { status: 400 });
        }

        // Auto-approve if Executive
        const isExec = ['CEO', 'CFO', 'CMO', 'Admin'].includes(session.user?.role || '');
        const status = isExec ? 'To Do' : 'Requested';

        const task = await Task.create({
            title: body.title,
            assignee: body.assignee || session.user?.id,
            requester: session.user?.id,
            linkedKPI: body.kpiId || null,
            status,
            priority: body.priority || 'Medium',
            dueDate: body.dueDate ? new Date(body.dueDate) : new Date()
        });

        return NextResponse.json(task, { status: 201 });
    } catch (e: any) {
        console.error("Task Create Error:", e);
        return NextResponse.json({ error: e.message || "Server Error" }, { status: 500 });
    }
}
