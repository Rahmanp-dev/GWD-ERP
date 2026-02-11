import { auth } from "@/auth";
import { NextResponse } from "next/server";

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const session = await auth();
        if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        // Only CEO, CFO, CMO can delete tasks
        const allowedRoles = ['CEO', 'CFO', 'CMO', 'Admin'];
        if (!allowedRoles.includes(session.user?.role || '')) {
            return NextResponse.json({ error: "Only executives can delete tasks" }, { status: 403 });
        }

        const { id } = await params;
        const { default: dbConnect } = await import("@/lib/db");
        await dbConnect();
        const { default: Task } = await import("@/lib/models/Task");

        const task = await Task.findByIdAndDelete(id);
        if (!task) return NextResponse.json({ error: "Task not found" }, { status: 404 });

        return NextResponse.json({ message: "Task deleted" });
    } catch (e: any) {
        console.error("Task Delete Error:", e);
        return NextResponse.json({ error: e.message || "Server Error" }, { status: 500 });
    }
}
