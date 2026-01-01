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
        const { default: Project } = await import("@/lib/models/Project");

        // Fetch projects
        const projects = await Project.find({}).sort({ createdAt: -1 });
        return NextResponse.json(projects);
    } catch (e: any) {
        console.error("Projects GET Error:", e);
        return NextResponse.json([]);
    }
}

export async function POST(req: Request) {
    try {
        const session = await auth();
        if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { default: dbConnect } = await import("@/lib/db");
        await dbConnect();
        const { default: Project } = await import("@/lib/models/Project");

        const body = await req.json();

        if (!body.title) return NextResponse.json({ error: "Title required" }, { status: 400 });

        const project = await Project.create({
            ...body,
            manager: session.user?.id,
        });

        return NextResponse.json(project, { status: 201 });
    } catch (e: any) {
        console.error("Projects POST Error:", e);
        return NextResponse.json({ error: "Server Error" }, { status: 500 });
    }
}
