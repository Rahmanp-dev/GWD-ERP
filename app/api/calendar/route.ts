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
        const { default: Event } = await import("@/lib/models/Event");
        await import("@/lib/models/User");

        const { searchParams } = new URL(req.url);
        const start = searchParams.get('start');
        const end = searchParams.get('end');
        const type = searchParams.get('type');

        const userId = session.user?.id;

        let query: any = {
            $or: [
                { createdBy: userId },
                { participants: userId }
            ]
        };

        // Date range filter
        if (start && end) {
            query.startDate = {
                $gte: new Date(start),
                $lte: new Date(end)
            };
        }

        if (type) query.type = type;

        const events = await Event.find(query)
            .populate('createdBy', 'name image')
            .populate('participants', 'name image')
            .sort({ startDate: 1 });

        return NextResponse.json(events);
    } catch (e: any) {
        console.error("Events GET Error:", e);
        return NextResponse.json({ error: "Server Error" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const session = await auth();
        if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { default: dbConnect } = await import("@/lib/db");
        await dbConnect();
        const { default: Event } = await import("@/lib/models/Event");

        const body = await req.json();
        const { title, description, type, startDate, endDate, allDay, location, color, participants, reminders } = body;

        if (!title || !startDate) {
            return NextResponse.json({ error: "Title and start date are required" }, { status: 400 });
        }

        const event = await Event.create({
            title,
            description,
            type: type || 'other',
            startDate,
            endDate: endDate || startDate,
            allDay: allDay || false,
            location,
            color: color || '#3b82f6',
            participants,
            reminders,
            createdBy: session.user?.id
        });

        return NextResponse.json(event, { status: 201 });
    } catch (e: any) {
        console.error("Events POST Error:", e);
        return NextResponse.json({ error: e.message || "Server Error" }, { status: 500 });
    }
}

export async function PUT(req: Request) {
    try {
        const session = await auth();
        if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { default: dbConnect } = await import("@/lib/db");
        await dbConnect();
        const { default: Event } = await import("@/lib/models/Event");

        const body = await req.json();
        const { id, ...updateData } = body;

        if (!id) {
            return NextResponse.json({ error: "Event ID required" }, { status: 400 });
        }

        const event = await Event.findByIdAndUpdate(id, updateData, { new: true });
        return NextResponse.json(event);
    } catch (e: any) {
        console.error("Events PUT Error:", e);
        return NextResponse.json({ error: "Server Error" }, { status: 500 });
    }
}

export async function DELETE(req: Request) {
    try {
        const session = await auth();
        if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { default: dbConnect } = await import("@/lib/db");
        await dbConnect();
        const { default: Event } = await import("@/lib/models/Event");

        const { searchParams } = new URL(req.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: "Event ID required" }, { status: 400 });
        }

        await Event.findByIdAndDelete(id);
        return NextResponse.json({ success: true });
    } catch (e: any) {
        console.error("Events DELETE Error:", e);
        return NextResponse.json({ error: "Server Error" }, { status: 500 });
    }
}
