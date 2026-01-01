import { auth } from "@/auth";
import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

/**
 * Audit Logs API
 * GET: Fetch audit logs with filters (admin only)
 */

export async function GET(req: Request) {
    try {
        const session = await auth();
        if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        // Only admins can view audit logs
        const allowedRoles = ['CEO', 'Admin', 'admin'];
        if (!allowedRoles.includes(session.user?.role || '')) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const { default: dbConnect } = await import("@/lib/db");
        await dbConnect();
        const { default: AuditLog } = await import("@/lib/models/AuditLog");

        const { searchParams } = new URL(req.url);
        const userId = searchParams.get('userId');
        const action = searchParams.get('action');
        const entityType = searchParams.get('entityType');
        const startDate = searchParams.get('startDate');
        const endDate = searchParams.get('endDate');
        const limit = parseInt(searchParams.get('limit') || '100');
        const page = parseInt(searchParams.get('page') || '1');

        let query: any = {};

        if (userId) query.userId = userId;
        if (action) query.action = action;
        if (entityType) query.entityType = entityType;

        if (startDate || endDate) {
            query.timestamp = {};
            if (startDate) query.timestamp.$gte = new Date(startDate);
            if (endDate) query.timestamp.$lte = new Date(endDate);
        }

        const skip = (page - 1) * limit;

        const [logs, total] = await Promise.all([
            AuditLog.find(query)
                .sort({ timestamp: -1 })
                .skip(skip)
                .limit(limit)
                .populate('userId', 'name email'),
            AuditLog.countDocuments(query)
        ]);

        return NextResponse.json({
            logs,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            }
        });

    } catch (e: any) {
        console.error("Audit Logs GET Error:", e);
        return NextResponse.json({ error: "Server Error" }, { status: 500 });
    }
}
