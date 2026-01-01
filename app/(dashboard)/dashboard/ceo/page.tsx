"use client";

import { useState, useEffect, useCallback } from "react";
import { useAutoRefresh } from "@/lib/hooks/useAutoRefresh";
import {
    TrendingUp,
    DollarSign,
    AlertTriangle,
    CheckCircle,
    Users,
    Briefcase,
    ArrowUpRight,
    AlertCircle,
    RefreshCw
} from "lucide-react";

export default function CEODashboard() {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

    const fetchDashboardData = useCallback(async () => {
        try {
            const [salesRes, projectsRes, commissionsRes] = await Promise.all([
                fetch("/api/crm/analytics/dashboard"),
                fetch("/api/projects"),
                fetch("/api/finance/commissions")
            ]);

            const sales = await salesRes.json();
            const projects = await projectsRes.json();
            const commissions = await commissionsRes.json();

            setData({ sales, projects, commissions });
            setLastUpdated(new Date());
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    }, []);

    // Auto-refresh every 30 seconds
    const { manualRefresh } = useAutoRefresh(fetchDashboardData, { interval: 30000 });

    useEffect(() => {
        fetchDashboardData();
    }, [fetchDashboardData]);

    const formatCurrency = (val: number) =>
        new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val || 0);

    if (loading) return <div className="p-8 text-center text-gray-500">Loading Command Center...</div>;

    const projectsAtRisk = data?.projects?.filter((p: any) => p.health === 'Red')?.length || 0;
    const pendingApprovals = (data?.commissions?.totals?.totalPending > 0) ? 1 : 0;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">CEO Command Center</h1>
                    <p className="text-sm text-gray-500">Strategic oversight • Where should I intervene?</p>
                </div>
                <div className="text-sm text-gray-500">
                    {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </div>
            </div>

            {/* KPI Cards - Row 1 */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-gradient-to-br from-blue-600 to-blue-700 p-6 rounded-xl text-white shadow-lg">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="text-sm opacity-80">Total Revenue (Closed)</div>
                            <div className="text-3xl font-bold">{formatCurrency(data?.sales?.totalRevenue)}</div>
                        </div>
                        <DollarSign className="w-12 h-12 opacity-50" />
                    </div>
                </div>

                <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 p-6 rounded-xl text-white shadow-lg">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="text-sm opacity-80">Pipeline Value</div>
                            <div className="text-3xl font-bold">{formatCurrency(data?.sales?.totalPipelineValue)}</div>
                        </div>
                        <TrendingUp className="w-12 h-12 opacity-50" />
                    </div>
                </div>

                <div className="bg-gradient-to-br from-orange-500 to-orange-600 p-6 rounded-xl text-white shadow-lg">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="text-sm opacity-80">Active Projects</div>
                            <div className="text-3xl font-bold">{data?.projects?.length || 0}</div>
                        </div>
                        <Briefcase className="w-12 h-12 opacity-50" />
                    </div>
                </div>

                <div className={`p-6 rounded-xl text-white shadow-lg ${projectsAtRisk > 0 ? 'bg-gradient-to-br from-red-500 to-red-600' : 'bg-gradient-to-br from-gray-500 to-gray-600'}`}>
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="text-sm opacity-80">Projects at Risk</div>
                            <div className="text-3xl font-bold">{projectsAtRisk}</div>
                        </div>
                        <AlertTriangle className="w-12 h-12 opacity-50" />
                    </div>
                </div>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Top Deals */}
                <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold text-gray-800">Top Deals in Pipeline</h3>
                        <a href="/crm/pipeline" className="text-sm text-blue-600 hover:underline flex items-center">
                            View All <ArrowUpRight className="w-4 h-4 ml-1" />
                        </a>
                    </div>
                    <div className="space-y-3">
                        {data?.sales?.recentDeals?.slice(0, 5).map((deal: any, i: number) => (
                            <div key={deal._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                <div className="flex items-center">
                                    <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium">{i + 1}</span>
                                    <div className="ml-3">
                                        <div className="font-medium text-gray-900">{deal.title}</div>
                                        <div className="text-xs text-gray-500">{deal.accountName || 'No Account'}</div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="font-semibold text-gray-900">{formatCurrency(deal.value)}</div>
                                    <span className={`text-xs px-2 py-1 rounded ${deal.status === 'Closed Won' ? 'bg-green-100 text-green-700' :
                                        deal.status === 'Negotiation' ? 'bg-purple-100 text-purple-700' :
                                            'bg-blue-100 text-blue-700'
                                        }`}>{deal.status}</span>
                                </div>
                            </div>
                        )) || <div className="text-gray-500 text-center py-4">No deals found</div>}
                    </div>
                </div>

                {/* Escalations / Approvals */}
                <div className="bg-white rounded-xl shadow-sm border p-6">
                    <h3 className="font-semibold text-gray-800 mb-4">Pending Approvals</h3>
                    <div className="space-y-3">
                        {data?.commissions?.totals?.totalPending > 0 && (
                            <a href="/finance/commissions" className="block p-4 bg-yellow-50 border border-yellow-200 rounded-lg hover:bg-yellow-100 transition">
                                <div className="flex items-center">
                                    <AlertCircle className="w-5 h-5 text-yellow-600 mr-3" />
                                    <div>
                                        <div className="font-medium text-gray-900">Commission Approvals</div>
                                        <div className="text-sm text-gray-600">{formatCurrency(data.commissions.totals.totalPending)} pending</div>
                                    </div>
                                </div>
                            </a>
                        )}
                        {!pendingApprovals && (
                            <div className="flex items-center p-4 bg-green-50 border border-green-200 rounded-lg">
                                <CheckCircle className="w-5 h-5 text-green-600 mr-3" />
                                <span className="text-green-800">All approvals completed</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Department Health */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
                <h3 className="font-semibold text-gray-800 mb-4">Department Scorecards</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="p-4 rounded-lg bg-green-50 border border-green-200">
                        <div className="flex items-center justify-between">
                            <span className="font-medium text-gray-700">Sales</span>
                            <span className="w-3 h-3 rounded-full bg-green-500"></span>
                        </div>
                        <div className="text-sm text-gray-600 mt-1">{data?.sales?.activeLeadsCount || 0} active leads</div>
                    </div>
                    <div className={`p-4 rounded-lg ${projectsAtRisk > 0 ? 'bg-red-50 border border-red-200' : 'bg-green-50 border border-green-200'}`}>
                        <div className="flex items-center justify-between">
                            <span className="font-medium text-gray-700">Projects</span>
                            <span className={`w-3 h-3 rounded-full ${projectsAtRisk > 0 ? 'bg-red-500' : 'bg-green-500'}`}></span>
                        </div>
                        <div className="text-sm text-gray-600 mt-1">{data?.projects?.length || 0} active</div>
                    </div>
                    <div className="p-4 rounded-lg bg-green-50 border border-green-200">
                        <div className="flex items-center justify-between">
                            <span className="font-medium text-gray-700">Finance</span>
                            <span className="w-3 h-3 rounded-full bg-green-500"></span>
                        </div>
                        <div className="text-sm text-gray-600 mt-1">Healthy</div>
                    </div>
                    <div className="p-4 rounded-lg bg-green-50 border border-green-200">
                        <div className="flex items-center justify-between">
                            <span className="font-medium text-gray-700">HR</span>
                            <span className="w-3 h-3 rounded-full bg-green-500"></span>
                        </div>
                        <div className="text-sm text-gray-600 mt-1">Stable</div>
                    </div>
                </div>
            </div>
        </div>
    );
}
