import dbConnect from '@/lib/db';
import User from '@/lib/models/User';
import Lead from '@/lib/models/Lead';
import { Award, Phone, Mail, Clock, TrendingUp, AlertTriangle } from 'lucide-react';

export const dynamic = 'force-dynamic';

async function getSalesPerfStats() {
    await dbConnect();

    // Fetch Salespeople
    const salespeople = await User.find({ role: { $in: ['Salesperson', 'Sales Manager', 'salesperson'] } }).lean();

    const stats: any[] = [];

    for (const person of salespeople) {
        // Aggregations for each person
        // 1. Leads Assigned
        const totalLeads = await Lead.countDocuments({ assignedTo: person._id });

        // 2. Won Deals & Revenue
        const wonLeads = await Lead.find({ assignedTo: person._id, status: 'Closed Won' }).lean();
        const wonCount = wonLeads.length;
        const revenue = wonLeads.reduce((acc, curr) => acc + (curr.value || 0), 0);

        // 3. Conversion Rate
        const closedCount = await Lead.countDocuments({ assignedTo: person._id, status: { $in: ['Closed Won', 'Closed Lost'] } });
        const conversionRate = closedCount > 0 ? Math.round((wonCount / closedCount) * 100) : 0;

        // 4. Activity (Mocked partially as activityLog isn't fully populated in demo data)
        const avgResponseTime = Math.floor(Math.random() * 4) + 1; // Mock 1-5 hours

        // 5. Stalled Deals
        // Mock stalled logic (e.g. created > 30 days ago and not closed)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const stalledCount = await Lead.countDocuments({
            assignedTo: person._id,
            status: { $nin: ['Closed Won', 'Closed Lost'] },
            createdAt: { $lt: thirtyDaysAgo }
        });

        stats.push({
            user: person,
            totalLeads,
            wonCount,
            revenue,
            conversionRate,
            stalledCount,
            avgResponseTime
        });
    }

    return stats.sort((a, b) => b.revenue - a.revenue);
}

export default async function SalesPerformancePage() {
    const stats = await getSalesPerfStats();

    return (
        <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg border shadow-sm">
                <h1 className="text-2xl font-bold text-gray-900">Sales Team Performance</h1>
                <p className="text-gray-500">Scorecards, activity metrics, and execution quality.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {stats.map((stat: any, index: number) => (
                    <div key={stat.user._id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden group hover:border-blue-300 transition-colors">
                        <div className="p-6 border-b border-gray-50 bg-gray-50 flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                                <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xl">
                                    {stat.user.name?.charAt(0) || 'U'}
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg text-gray-900">{stat.user.name}</h3>
                                    <div className="flex items-center text-xs text-gray-500">
                                        {index === 0 && <span className="flex items-center text-yellow-600 font-bold mr-2"><Award className="w-3 h-3 mr-1" /> Top Gun</span>}
                                        <span>{stat.user.email}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="text-sm text-gray-500">Revenue</div>
                                <div className="text-xl font-bold text-green-700">${stat.revenue.toLocaleString()}</div>
                            </div>
                        </div>

                        <div className="p-6 space-y-4">
                            {/* Key Ratios */}
                            <div className="grid grid-cols-3 gap-2 text-center">
                                <div className="p-2 bg-gray-50 rounded-lg">
                                    <div className="text-xs text-gray-500 uppercase">Leads</div>
                                    <div className="font-bold text-gray-900">{stat.totalLeads}</div>
                                </div>
                                <div className="p-2 bg-gray-50 rounded-lg">
                                    <div className="text-xs text-gray-500 uppercase">Wins</div>
                                    <div className="font-bold text-blue-600">{stat.wonCount}</div>
                                </div>
                                <div className="p-2 bg-gray-50 rounded-lg">
                                    <div className="text-xs text-gray-500 uppercase">Conv. %</div>
                                    <div className="font-bold text-purple-600">{stat.conversionRate}%</div>
                                </div>
                            </div>

                            {/* Execution Quality */}
                            <div className="space-y-3 pt-2">
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-gray-600 flex items-center"><Clock className="w-4 h-4 mr-2 text-gray-400" /> Avg Response</span>
                                    <span className="font-medium text-gray-900">{stat.avgResponseTime}h</span>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-gray-600 flex items-center"><AlertTriangle className="w-4 h-4 mr-2 text-orange-400" /> Stalled Deals</span>
                                    <span className={`font-medium ${stat.stalledCount > 5 ? 'text-red-600' : 'text-gray-900'}`}>{stat.stalledCount}</span>
                                </div>
                            </div>

                            {/* Activity Bar (Mock) */}
                            <div className="pt-2">
                                <div className="flex justify-between text-xs text-gray-500 mb-1">
                                    <span>Activity Score</span>
                                    <span className="font-bold text-green-600">High</span>
                                </div>
                                <div className="w-full bg-gray-100 rounded-full h-2">
                                    <div className="bg-green-500 h-2 rounded-full" style={{ width: '85%' }}></div>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
                {stats.length === 0 && (
                    <div className="col-span-full py-12 text-center text-gray-500 bg-white border border-dashed rounded-lg">
                        No salespeople found in the system.
                    </div>
                )}
            </div>
        </div>
    );
}
