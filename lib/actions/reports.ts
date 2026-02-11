"use server";

import dbConnect from "@/lib/db";
import { auth } from "@/auth";
import Lead from "@/lib/models/Lead";
import Commission from "@/lib/models/Commission";

export async function getSalesAnalytics(ownerId?: string) {
    await dbConnect();
    const session = await auth();
    if (!session) throw new Error("Unauthorized");

    const query: any = {};
    if (ownerId) query.assignedTo = ownerId;

    // 1. Pipeline Value & Counts by Stage
    const pipelineStats = await Lead.aggregate([
        { $match: query },
        {
            $group: {
                _id: "$status",
                totalValue: { $sum: "$value" },
                count: { $sum: 1 }
            }
        }
    ]);

    // 2. Total Revenue (Closed Won)
    const wonStats = pipelineStats.find((s: any) => s._id === "Closed Won");
    const totalRevenue = wonStats ? wonStats.totalValue : 0;

    // 3. Total Pipeline Value (Excluding Closed/Lost)
    const totalPipelineValue = pipelineStats
        .filter((s: any) => s._id !== "Closed Won" && s._id !== "Closed Lost")
        .reduce((acc: number, curr: any) => acc + curr.totalValue, 0);

    // 4. Quick counts
    const leadsCount = pipelineStats
        .filter((s: any) => s._id === "Lead" || s._id === "Qualified")
        .reduce((acc: number, curr: any) => acc + curr.count, 0);

    return {
        pipelineStats,
        totalRevenue,
        totalPipelineValue,
        leadsCount
    };
}

export async function getCommissionAnalytics(userId?: string, status?: string) {
    await dbConnect();
    const session = await auth();
    if (!session) throw new Error("Unauthorized");

    let query: any = {};

    // Salespeople can only see their own commissions
    const allowedRoles = ['CEO', 'Admin', 'admin', 'CFO', 'Sales Manager'];
    const userRole = session.user?.role || '';

    // Case insensitive check just in case
    const isManager = allowedRoles.some(r => r.toLowerCase() === userRole.toLowerCase());

    if (!isManager) {
        query.userId = session.user?.id;
    } else if (userId) {
        query.userId = userId;
    }

    if (status) query.status = status;

    const commissions = await Commission.find(query)
        .sort({ createdAt: -1 })
        .populate('userId', 'name email')
        .populate('dealId', 'title accountName')
        .lean();

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

    return {
        commissions: commissions.map((c: any) => ({
            ...c,
            _id: c._id.toString(),
            userId: c.userId ? { ...c.userId, _id: c.userId._id?.toString() } : null,
            dealId: c.dealId ? { ...c.dealId, _id: c.dealId._id?.toString() } : null,
            createdAt: c.createdAt.toISOString(),
            updatedAt: c.updatedAt?.toISOString()
        })),
        totals: totals[0] || { totalPending: 0, totalApproved: 0, totalPaid: 0 }
    };
}
