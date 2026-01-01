import { auth } from "@/auth";
import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

/**
 * Manager Analytics API
 * Returns team-wide sales statistics grouped by salesperson
 */
export async function GET(req: Request) {
    try {
        const session = await auth();
        if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        // Only managers/admins can view team stats
        const allowedRoles = ['CEO', 'Admin', 'admin', 'Sales Manager'];
        if (!allowedRoles.includes(session.user?.role || '')) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const { default: dbConnect } = await import("@/lib/db");
        await dbConnect();
        const { default: Lead } = await import("@/lib/models/Lead");
        const { default: User } = await import("@/lib/models/User");

        // Get all salespeople
        const salesRoles = ['Salesperson', 'Sales Manager'];
        const salespeople = await User.find({ role: { $in: salesRoles } }).select('_id name email image role');

        // Aggregate deals by salesperson
        const dealStats = await Lead.aggregate([
            {
                $group: {
                    _id: "$assignedTo",
                    totalDeals: { $sum: 1 },
                    totalValue: { $sum: "$value" },
                    wonDeals: {
                        $sum: { $cond: [{ $eq: ["$status", "Closed Won"] }, 1, 0] }
                    },
                    wonValue: {
                        $sum: { $cond: [{ $eq: ["$status", "Closed Won"] }, "$value", 0] }
                    },
                    pendingDeals: {
                        $sum: {
                            $cond: [
                                { $nin: ["$status", ["Closed Won", "Closed Lost"]] },
                                1,
                                0
                            ]
                        }
                    },
                    pendingValue: {
                        $sum: {
                            $cond: [
                                { $nin: ["$status", ["Closed Won", "Closed Lost"]] },
                                "$value",
                                0
                            ]
                        }
                    }
                }
            }
        ]);

        // Merge salesperson info with their stats
        const salespersonStats = salespeople.map((person: any) => {
            const stats = dealStats.find((s: any) => s._id?.toString() === person._id.toString()) || {
                totalDeals: 0,
                totalValue: 0,
                wonDeals: 0,
                wonValue: 0,
                pendingDeals: 0,
                pendingValue: 0
            };
            return {
                _id: person._id,
                name: person.name,
                email: person.email,
                image: person.image,
                ...stats
            };
        });

        // Calculate team totals
        const teamTotals = {
            totalDeals: salespersonStats.reduce((acc, p) => acc + p.totalDeals, 0),
            totalPipeline: salespersonStats.reduce((acc, p) => acc + p.pendingValue, 0),
            totalRevenue: salespersonStats.reduce((acc, p) => acc + p.wonValue, 0),
            wonDeals: salespersonStats.reduce((acc, p) => acc + p.wonDeals, 0)
        };

        return NextResponse.json({
            salespersonStats,
            teamTotals
        });

    } catch (e: any) {
        console.error("Manager Analytics Error:", e);
        return NextResponse.json({ error: "Server Error" }, { status: 500 });
    }
}
