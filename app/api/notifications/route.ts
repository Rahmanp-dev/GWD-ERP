import { auth } from "@/auth";
import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// GET: Fetch notifications for current user
export async function GET(req: Request) {
    try {
        const session = await auth();
        if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { default: dbConnect } = await import("@/lib/db");
        await dbConnect();
        const { default: Notification } = await import("@/lib/models/Notification");

        const { searchParams } = new URL(req.url);
        const unreadOnly = searchParams.get('unreadOnly') === 'true';

        let query: any = { userId: session.user?.id };
        if (unreadOnly) query.isRead = false;

        const notifications = await Notification.find(query)
            .sort({ createdAt: -1 })
            .limit(50);

        return NextResponse.json(notifications);
    } catch (e: any) {
        console.error("Notifications GET Error:", e);
        return NextResponse.json({ error: "Server Error" }, { status: 500 });
    }
}

// PUT: Mark notification(s) as read
export async function PUT(req: Request) {
    try {
        const session = await auth();
        if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { default: dbConnect } = await import("@/lib/db");
        await dbConnect();
        const { default: Notification } = await import("@/lib/models/Notification");

        const body = await req.json();
        const { notificationId, markAllRead } = body;

        if (markAllRead) {
            await Notification.updateMany(
                { userId: session.user?.id, isRead: false },
                { isRead: true }
            );
        } else if (notificationId) {
            await Notification.findByIdAndUpdate(notificationId, { isRead: true });
        }

        return NextResponse.json({ success: true });
    } catch (e: any) {
        console.error("Notifications PUT Error:", e);
        return NextResponse.json({ error: "Server Error" }, { status: 500 });
    }
}
