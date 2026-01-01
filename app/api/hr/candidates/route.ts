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
        const { default: Candidate } = await import("@/lib/models/Candidate");

        const candidates = await Candidate.find({}).sort({ order: 1 });
        return NextResponse.json(candidates);
    } catch (e: any) {
        console.error("HR Candidates GET Error:", e);
        return NextResponse.json([]);
    }
}

export async function POST(req: Request) {
    try {
        const session = await auth();
        if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { default: dbConnect } = await import("@/lib/db");
        await dbConnect();
        const { default: Candidate } = await import("@/lib/models/Candidate");

        const body = await req.json();

        if (!body.name || !body.email) {
            return NextResponse.json({ error: "Name and Email are required" }, { status: 400 });
        }

        const maxOrderCandidate = await Candidate.findOne({ status: body.status || 'Applied' }).sort({ order: -1 });
        const newOrder = (maxOrderCandidate?.order || 0) + 1;

        const candidate = await Candidate.create({
            ...body,
            order: newOrder,
        });

        return NextResponse.json(candidate, { status: 201 });
    } catch (e: any) {
        console.error("HR Candidates POST Error:", e);
        return NextResponse.json({ error: "Server Error" }, { status: 500 });
    }
}

export async function PUT(req: Request) {
    try {
        const session = await auth();
        if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { default: dbConnect } = await import("@/lib/db");
        await dbConnect();
        const { default: Candidate } = await import("@/lib/models/Candidate");

        const body = await req.json();
        const { id, ...updateData } = body;

        const candidate = await Candidate.findByIdAndUpdate(id, updateData, { new: true });
        return NextResponse.json(candidate);
    } catch (e: any) {
        console.error("HR Candidates PUT Error:", e);
        return NextResponse.json({ error: "Server Error" }, { status: 500 });
    }
}
