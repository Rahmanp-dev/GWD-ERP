import { auth } from "@/auth";
import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

/**
 * Deal Override API - Allows managers to reassign deals or override status
 * PUT /api/crm/leads/override
 */
export async function PUT(req: Request) {
    try {
        const session = await auth();
        if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        // Only managers can override
        const allowedRoles = ['CEO', 'Admin', 'admin', 'Sales Manager'];
        if (!allowedRoles.includes(session.user?.role || '')) {
            return NextResponse.json({ error: "Forbidden - Manager access required" }, { status: 403 });
        }

        const { default: dbConnect } = await import("@/lib/db");
        await dbConnect();
        const { default: Lead } = await import("@/lib/models/Lead");
        const { logStatusChange, logAudit } = await import("@/lib/audit-logger");

        const body = await req.json();
        const { dealId, action, newOwnerId, newStatus, reason } = body;

        if (!dealId) {
            return NextResponse.json({ error: "Deal ID required" }, { status: 400 });
        }

        const deal = await Lead.findById(dealId);
        if (!deal) {
            return NextResponse.json({ error: "Deal not found" }, { status: 404 });
        }

        const updates: any = { updatedAt: new Date() };
        let auditDescription = "";

        // Handle reassignment
        if (action === 'reassign' && newOwnerId) {
            const oldOwner = deal.assignedTo;
            updates.assignedTo = newOwnerId;
            auditDescription = `Deal reassigned from ${oldOwner} to ${newOwnerId}. Reason: ${reason || 'Not specified'}`;

            await logAudit({
                userId: session.user?.id,
                userName: session.user?.name,
                userEmail: session.user?.email,
                userRole: session.user?.role,
                action: 'ASSIGN',
                entityType: 'Lead',
                entityId: dealId,
                entityName: deal.title,
                changes: [{ field: 'assignedTo', oldValue: oldOwner?.toString(), newValue: newOwnerId }],
                description: auditDescription
            });
        }

        // Handle status override
        if (action === 'status_override' && newStatus) {
            const oldStatus = deal.status;
            updates.status = newStatus;

            if (newStatus === 'Closed Won' || newStatus === 'Closed Lost') {
                updates.closedDate = new Date();
            }

            await logStatusChange(
                { id: session.user?.id, name: session.user?.name, email: session.user?.email, role: session.user?.role },
                'Lead',
                dealId,
                deal.title,
                oldStatus,
                newStatus
            );
        }

        // Handle lock/unlock (prevent salesperson from editing)
        if (action === 'lock') {
            updates.isLocked = true;
            updates.lockedBy = session.user?.id;
            updates.lockedAt = new Date();
            auditDescription = `Deal locked by manager. Reason: ${reason || 'Not specified'}`;
        }

        if (action === 'unlock') {
            updates.isLocked = false;
            updates.lockedBy = null;
            updates.lockedAt = null;
            auditDescription = `Deal unlocked by manager.`;
        }

        const updatedDeal = await Lead.findByIdAndUpdate(dealId, updates, { new: true });

        return NextResponse.json({
            success: true,
            deal: updatedDeal
        });

    } catch (e: any) {
        console.error("Deal Override Error:", e);
        return NextResponse.json({ error: "Server Error" }, { status: 500 });
    }
}
