import dbConnect from '@/lib/db';
import Lead from '@/lib/models/Lead';
import User from '@/lib/models/User';
import { TrendingUp, DollarSign, Target, Activity, Users, AlertTriangle } from 'lucide-react';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

async function getSalesStats() {
    await dbConnect();

    // 1. Pipeline Metrics
    const pipelineStats = await Lead.aggregate([
        { $match: { status: { $nin: ['Closed Won', 'Closed Lost'] } } },
        {
            $group: {
                _id: null,
                totalValue: { $sum: "$value" },
                count: { $sum: 1 },
                avgProbability: { $avg: "$probability" }
            }
        }
    ]);

    const wonStats = await Lead.aggregate([
        { $match: { status: 'Closed Won' } },
        {
            $group: {
                _id: null,
                totalValue: { $sum: "$value" },
                count: { $sum: 1 }
            }
        }
    ]);

    const lostStats = await Lead.aggregate([
        { $match: { status: 'Closed Lost' } },
        { $count: "count" }
    ]);

    // 2. Win Rate Calculation
    const wonCount = wonStats[0]?.count || 0;
    const lostCount = lostStats[0]?.count || 0;
    const totalClosed = wonCount + lostCount;
    const winRate = totalClosed > 0 ? Math.round((wonCount / totalClosed) * 100) : 0;

    // 3. Salesperson Performance (Leaderboard)
    const leaderboard = await Lead.aggregate([
        { $match: { status: 'Closed Won' } },
        {
            $group: {
                _id: "$assignedTo",
                revenue: { $sum: "$value" },
                deals: { $sum: 1 }
            }
        },
        { $sort: { revenue: -1 } },
        { $limit: 5 },
        {
            $lookup: {
                from: "users",
                localField: "_id",
                foreignField: "_id",
                as: "user"
            }
        },
        { $unwind: "$user" },
        {
            $project: {
                name: "$user.name",
                email: "$user.email",
                revenue: 1,
                deals: 1
            }
        }
    ]);

    // 4. Deals at Risk (High Value + High Risk Score)
    const riskyDeals = await Lead.find({
        status: { $nin: ['Closed Won', 'Closed Lost'] },
        riskScore: { $gt: 50 },
        value: { $gt: 10000 } // High value threshold
    })
        .sort({ value: -1 })
        .limit(5)
        .populate('assignedTo', 'name')
        .lean();

    return {
        pipelineValue: pipelineStats[0]?.totalValue || 0,
        dealCount: pipelineStats[0]?.count || 0,
        weightedForecast: Math.round((pipelineStats[0]?.totalValue || 0) * ((pipelineStats[0]?.avgProbability || 30) / 100)),
        revenueClosed: wonStats[0]?.totalValue || 0,
        winRate,
        leaderboard,
        riskyDeals: JSON.parse(JSON.stringify(riskyDeals))
    };
}

export default async function SalesDashboardPage() {
    const stats = await getSalesStats();

    // Mock Target for Demo (In real app, fetch from Target model)
    const REVENUE_TARGET = 1000000;
    const revenueProgress = Math.min(100, Math.round((stats.revenueClosed / REVENUE_TARGET) * 100));

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Sales Control Tower</h1>
                    <p className="text-gray-500">Real-time revenue intelligence and pipeline governance.</p>
                </div>
                <div className="flex items-center space-x-3">
                    <a href="/kpi" className="px-4 py-2 bg-purple-600 text-white text-sm font-medium rounded-lg hover:bg-purple-700 transition shadow-sm">
                        Exec KPIs
                    </a>
                    <div className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                        Period: This Quarter
                    </div>
                </div>
            </div>

            {/* Main KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex justify-between items-center mb-4">
                        <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                            <Target className="w-6 h-6" />
                        </div>
                        <span className="text-xs font-medium text-gray-500 uppercase">Pipeline</span>
                    </div>
                    <div className="text-3xl font-bold text-gray-900">${stats.pipelineValue.toLocaleString()}</div>
                    <p className="text-sm text-gray-500 mt-1">{stats.dealCount} active deals</p>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex justify-between items-center mb-4">
                        <div className="p-2 bg-green-50 rounded-lg text-green-600">
                            <DollarSign className="w-6 h-6" />
                        </div>
                        <span className="text-xs font-medium text-gray-500 uppercase">Revenue Closed</span>
                    </div>
                    <div className="text-3xl font-bold text-gray-900">${stats.revenueClosed.toLocaleString()}</div>
                    <div className="w-full bg-gray-200 rounded-full h-1.5 mt-3">
                        <div className="bg-green-500 h-1.5 rounded-full" style={{ width: `${revenueProgress}%` }}></div>
                    </div>
                    <p className="text-xs text-gray-400 mt-1">{revenueProgress}% of ${REVENUE_TARGET.toLocaleString()} Target</p>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex justify-between items-center mb-4">
                        <div className="p-2 bg-purple-50 rounded-lg text-purple-600">
                            <TrendingUp className="w-6 h-6" />
                        </div>
                        <span className="text-xs font-medium text-gray-500 uppercase">Win Rate</span>
                    </div>
                    <div className="text-3xl font-bold text-gray-900">{stats.winRate}%</div>
                    <p className="text-sm text-gray-500 mt-1">vs 45% Industry Avg</p>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex justify-between items-center mb-4">
                        <div className="p-2 bg-orange-50 rounded-lg text-orange-600">
                            <Activity className="w-6 h-6" />
                        </div>
                        <span className="text-xs font-medium text-gray-500 uppercase">Weighted Forecast</span>
                    </div>
                    <div className="text-3xl font-bold text-gray-900">${stats.weightedForecast.toLocaleString()}</div>
                    <p className="text-sm text-gray-500 mt-1">Expected Revenue</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Sales Leaderboard */}
                <div className="bg-white border rounded-xl shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                        <h2 className="font-bold text-gray-900 flex items-center">
                            <Users className="w-5 h-5 mr-2 text-blue-500" /> Top Performers
                        </h2>
                        <Link href="/sales/performance" className="text-sm text-blue-600 hover:text-blue-800">View All</Link>
                    </div>
                    <div className="divide-y divide-gray-100">
                        {stats.leaderboard.map((rep: any, idx: number) => (
                            <div key={idx} className="p-4 flex items-center justify-between hover:bg-gray-50">
                                <div className="flex items-center space-x-3">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${idx === 0 ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-600'
                                        }`}>
                                        {idx + 1}
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-900">{rep.name}</p>
                                        <p className="text-xs text-gray-500">{rep.deals} deals closed</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm font-bold text-green-700">${rep.revenue.toLocaleString()}</p>
                                </div>
                            </div>
                        ))}
                        {stats.leaderboard.length === 0 && (
                            <div className="p-8 text-center text-gray-500 text-sm">No closed deals yet this period.</div>
                        )}
                    </div>
                </div>

                {/* High Risk Deals */}
                <div className="bg-white border rounded-xl shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                        <h2 className="font-bold text-gray-900 flex items-center">
                            <AlertTriangle className="w-5 h-5 mr-2 text-red-500" /> Deals at Risk
                        </h2>
                        <Link href="/sales/pipeline?filter=risk" className="text-sm text-red-600 hover:text-red-800">View All</Link>
                    </div>
                    <div className="divide-y divide-gray-100">
                        {stats.riskyDeals.map((deal: any) => (
                            <div key={deal._id} className="p-4 hover:bg-red-50 transition-colors cursor-pointer group">
                                <div className="flex justify-between items-start mb-1">
                                    <h3 className="text-sm font-medium text-gray-900 group-hover:text-red-700">{deal.title}</h3>
                                    <span className="px-2 py-0.5 rounded text-xs font-bold bg-red-100 text-red-800">
                                        Risk: {deal.riskScore}/100
                                    </span>
                                </div>
                                <div className="flex justify-between items-center text-xs text-gray-500">
                                    <span>{deal.accountName}</span>
                                    <span>${deal.value.toLocaleString()}</span>
                                </div>
                                <div className="mt-2 text-xs text-red-600">
                                    ⚠️ {deal.riskFactors?.[0] || "Stalled / No Activity"}
                                </div>
                            </div>
                        ))}
                        {stats.riskyDeals.length === 0 && (
                            <div className="p-8 text-center text-gray-500 text-sm">No high-risk deals detected. Great job!</div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
