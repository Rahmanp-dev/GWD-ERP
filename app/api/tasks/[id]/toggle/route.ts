import { auth } from "@/auth";
import { NextResponse } from "next/server";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const session = await auth();
        if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { id } = await params;
        const { default: dbConnect } = await import("@/lib/db");
        await dbConnect();
        const { default: Task } = await import("@/lib/models/Task");

        const body = await req.json();
        const newStatus = body.status;

        if (!newStatus) return NextResponse.json({ error: "Status required" }, { status: 400 });

        const task = await Task.findByIdAndUpdate(id, {
            status: newStatus,
            completedAt: newStatus === 'Done' ? new Date() : null
        }, { new: true });

        if (!task) return NextResponse.json({ error: "Task not found" }, { status: 404 });

        return NextResponse.json(task);
    } catch (e: any) {
        console.error("Task Toggle Error:", e);
        return NextResponse.json({ error: e.message || "Server Error" }, { status: 500 });
    }
}
