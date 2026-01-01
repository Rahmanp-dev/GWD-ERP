import { auth } from "@/auth";
import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

/**
 * GET: Fetch commissions (with filters)
 * POST: Calculate and create commission for a deal
 * PUT: Update commission status (approve/pay)
 */

export async function GET(req: Request) {
    try {
        const session = await auth();
        if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { default: dbConnect } = await import("@/lib/db");
        await dbConnect();
        const { default: Commission } = await import("@/lib/models/Commission");

        const { searchParams } = new URL(req.url);
        const userId = searchParams.get('userId');
        const status = searchParams.get('status');

        let query: any = {};

        // Salespeople can only see their own commissions
        const allowedRoles = ['CEO', 'Admin', 'admin', 'CFO', 'Sales Manager'];
        if (!allowedRoles.includes(session.user?.role || '')) {
            query.userId = session.user?.id;
        } else if (userId) {
            query.userId = userId;
        }

        if (status) query.status = status;

        const commissions = await Commission.find(query)
            .sort({ createdAt: -1 })
            .populate('userId', 'name email')
            .populate('dealId', 'title accountName');

        // Calculate totals
        const totals = await Commission.aggregate([
            { $match: query },
            {
                $group: {
                    _id: null,
                    totalPending: { $sum: { $cond: [{ $eq: ["$status", "Pending"] }, "$commissionAmount", 0] } },
                    totalApproved: { $sum: { $cond: [{ $eq: ["$status", "Approved"] }, "$commissionAmount", 0] } },
                    totalPaid: { $sum: { $cond: [{ $eq: ["$status", "Paid"] }, "$commissionAmount", 0] } }
                }
            }
        ]);

        return NextResponse.json({
            commissions,
            totals: totals[0] || { totalPending: 0, totalApproved: 0, totalPaid: 0 }
        });

    } catch (e: any) {
        console.error("Commissions GET Error:", e);
        return NextResponse.json({ error: "Server Error" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const session = await auth();
        if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { default: dbConnect } = await import("@/lib/db");
        await dbConnect();
        const { default: Commission } = await import("@/lib/models/Commission");
        const { default: CommissionRate } = await import("@/lib/models/CommissionRate");
        const { default: Lead } = await import("@/lib/models/Lead");

        const body = await req.json();
        const { dealId } = body;

        if (!dealId) {
            return NextResponse.json({ error: "Deal ID is required" }, { status: 400 });
        }

        // Get the deal
        const deal = await Lead.findById(dealId);
        if (!deal) {
            return NextResponse.json({ error: "Deal not found" }, { status: 404 });
        }

        if (deal.status !== 'Closed Won') {
            return NextResponse.json({ error: "Deal must be Closed Won to calculate commission" }, { status: 400 });
        }

        // Check if commission already exists
        const existingCommission = await Commission.findOne({ dealId });
        if (existingCommission) {
            return NextResponse.json({ error: "Commission already calculated for this deal", commission: existingCommission }, { status: 409 });
        }

        // Find applicable commission rate
        const rates = await CommissionRate.find({ isActive: true }).sort({ priority: -1 });

        let applicableRate = 0.05; // Default 5%

        for (const rate of rates) {
            let matches = true;

            if (rate.conditions?.minDealValue && deal.value < rate.conditions.minDealValue) matches = false;
            if (rate.conditions?.maxDealValue && deal.value > rate.conditions.maxDealValue) matches = false;
            if (rate.conditions?.forUserId && deal.assignedTo?.toString() !== rate.conditions.forUserId.toString()) matches = false;
            if (rate.conditions?.dealSource && deal.source !== rate.conditions.dealSource) matches = false;

            if (matches) {
                applicableRate = rate.rate;
                break;
            }
        }

        const commissionAmount = deal.value * applicableRate;

        const commission = await Commission.create({
            userId: deal.assignedTo,
            dealId: deal._id,
            dealTitle: deal.title,
            dealValue: deal.value,
            commissionRate: applicableRate,
            commissionAmount,
            status: 'Pending'
        });

        return NextResponse.json(commission, { status: 201 });

    } catch (e: any) {
        console.error("Commissions POST Error:", e);
        return NextResponse.json({ error: "Server Error" }, { status: 500 });
    }
}

export async function PUT(req: Request) {
    try {
        const session = await auth();
        if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        // Only managers/CFO/CEO can approve
        const allowedRoles = ['CEO', 'Admin', 'admin', 'CFO', 'Sales Manager'];
        if (!allowedRoles.includes(session.user?.role || '')) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const { default: dbConnect } = await import("@/lib/db");
        await dbConnect();
        const { default: Commission } = await import("@/lib/models/Commission");

        const body = await req.json();
        const { id, status, paymentReference, notes } = body;

        if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

        const updateData: any = { status, updatedAt: new Date() };

        if (status === 'Approved') {
            updateData.approvedBy = session.user?.id;
            updateData.approvedAt = new Date();
        }

        if (status === 'Paid') {
            updateData.paymentDate = new Date();
            if (paymentReference) updateData.paymentReference = paymentReference;
        }

        if (notes) updateData.notes = notes;

        const commission = await Commission.findByIdAndUpdate(id, updateData, { new: true });

        return NextResponse.json(commission);

    } catch (e: any) {
        console.error("Commissions PUT Error:", e);
        return NextResponse.json({ error: "Server Error" }, { status: 500 });
    }
}
