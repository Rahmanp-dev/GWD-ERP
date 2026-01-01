import { auth } from "@/auth";
import { NextResponse } from "next/server";
import { type NextRequest } from "next/server";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(req: NextRequest) {
    try {
        const session = await auth();
        if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { default: dbConnect } = await import("@/lib/db");
        await dbConnect();
        const { default: Lead } = await import("@/lib/models/Lead");

        const { searchParams } = new URL(req.url);
        const ownerId = searchParams.get('ownerId'); // Optional filter for specific salesperson

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

        // 5. Recent Deals (Top 5)
        const recentDeals = await Lead.find(query)
            .sort({ updatedAt: -1 })
            .limit(5)
            .populate('assignedTo', 'name');

        return NextResponse.json({
            pipelineStats,
            totalRevenue,
            totalPipelineValue,
            leadsCount,
            recentDeals
        });

    } catch (e: any) {
        console.error("Analytics API Error:", e);
        return NextResponse.json({ error: "Server Error" }, { status: 500 });
    }
}
