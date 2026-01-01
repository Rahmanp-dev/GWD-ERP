import { auth } from "@/auth";
import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(req: Request) {
    try {
        const session = await auth();
        if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { searchParams } = new URL(req.url);
        const projectId = searchParams.get('projectId');

        if (!projectId) return NextResponse.json({ error: "Project ID required" }, { status: 400 });

        const { default: dbConnect } = await import("@/lib/db");
        await dbConnect();
        const { default: Task } = await import("@/lib/models/Task");

        const tasks = await Task.find({ project: projectId }).sort({ order: 1 });
        return NextResponse.json(tasks);
    } catch (e: any) {
        console.error("Tasks GET Error:", e);
        return NextResponse.json([]);
    }
}

export async function POST(req: Request) {
    try {
        const session = await auth();
        if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { default: dbConnect } = await import("@/lib/db");
        await dbConnect();
        const { default: Task } = await import("@/lib/models/Task");

        const body = await req.json();

        if (!body.project || !body.title) return NextResponse.json({ error: "Project and Title required" }, { status: 400 });

        // Validate project exists (optional but helpful)
        const mongoose = await import("mongoose");
        if (!mongoose.default.Types.ObjectId.isValid(body.project)) {
            return NextResponse.json({ error: "Invalid project ID" }, { status: 400 });
        }

        // Get max order
        const maxOrderTask = await Task.findOne({ project: body.project, status: body.status || 'To Do' }).sort({ order: -1 });
        const newOrder = (maxOrderTask?.order || 0) + 1;

        // Remove empty fields that should be ObjectId
        const taskData = { ...body, order: newOrder };
        if (!taskData.assignee || taskData.assignee === '') {
            delete taskData.assignee;
        }

        const task = await Task.create(taskData);

        return NextResponse.json(task, { status: 201 });
    } catch (e: any) {
        console.error("Tasks POST Error:", e);
        return NextResponse.json({ error: e.message || "Server Error" }, { status: 500 });
    }
}

export async function PUT(req: Request) {
    try {
        const session = await auth();
        if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { default: dbConnect } = await import("@/lib/db");
        await dbConnect();
        const { default: Task } = await import("@/lib/models/Task");

        const body = await req.json();
        const { id, ...updateData } = body;

        if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

        const task = await Task.findByIdAndUpdate(id, updateData, { new: true });
        return NextResponse.json(task);
    } catch (e: any) {
        console.error("Tasks PUT Error:", e);
        return NextResponse.json({ error: "Server Error" }, { status: 500 });
    }
}
