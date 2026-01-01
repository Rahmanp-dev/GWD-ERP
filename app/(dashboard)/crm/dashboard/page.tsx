"use client";

import { useEffect, useState } from "react";
import {
    BarChart3,
    TrendingUp,
    Users,
    DollarSign,
    Briefcase,
    AlertCircle
} from "lucide-react";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
);

export default function SalesDashboard() {
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const res = await fetch("/api/crm/analytics/dashboard");
            const data = await res.json();
            setStats(data);
        } catch (error) {
            console.error("Failed to fetch dashboard stats", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="p-8 text-center text-gray-500">Loading Dashboard...</div>;

    // Prepare Chart Data
    const stages = ["Lead", "Qualified", "Proposal", "Negotiation", "Closed Won", "Closed Lost"];
    const chartData = {
        labels: stages,
        datasets: [
            {
                label: 'Direct Value ($)',
                data: stages.map(stage => {
                    const s = stats?.pipelineStats?.find((i: any) => i._id === stage);
                    return s ? s.totalValue : 0;
                }),
                backgroundColor: 'rgba(59, 130, 246, 0.6)',
                borderRadius: 4,
            },
        ],
    };

    const options = {
        responsive: true,
        plugins: {
            legend: {
                position: 'top' as const,
            },
            title: {
                display: false,
            },
        },
    };

    return (
        <div className="p-6 space-y-6">
            <h1 className="text-2xl font-bold text-gray-900">Sales Overview</h1>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 flex items-center justify-between">
                    <div>
                        <div className="text-sm font-medium text-gray-500">Total Pipeline Value</div>
                        <div className="text-2xl font-bold text-red-600">
                            {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(stats?.totalPipelineValue || 0)}
                        </div>
                    </div>
                    <div className="p-3 bg-blue-50 rounded-full">
                        <DollarSign className="w-6 h-6 text-blue-500" />
                    </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 flex items-center justify-between">
                    <div>
                        <div className="text-sm font-medium text-gray-500">Revenue (Won)</div>
                        <div className="text-2xl font-bold text-green-600">
                            {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(stats?.totalRevenue || 0)}
                        </div>
                    </div>
                    <div className="p-3 bg-green-50 rounded-full">
                        <TrendingUp className="w-6 h-6 text-green-500" />
                    </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 flex items-center justify-between">
                    <div>
                        <div className="text-sm font-medium text-gray-500">Active Leads</div>
                        <div className="text-2xl font-bold text-gray-900">{stats?.leadsCount || 0}</div>
                    </div>
                    <div className="p-3 bg-indigo-50 rounded-full">
                        <Users className="w-6 h-6 text-indigo-500" />
                    </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 flex items-center justify-between">
                    <div>
                        <div className="text-sm font-medium text-gray-500">Avg Deal Size</div>
                        <div className="text-2xl font-bold text-gray-900">
                            {/* Simple calc for demo */}
                            {stats?.pipelineStats ?
                                new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })
                                    .format((stats.totalPipelineValue + stats.totalRevenue) / (stats.leadsCount + (stats.pipelineStats.find((s: any) => s._id === 'Closed Won')?.count || 1)) || 0)
                                : "$0"
                            }
                        </div>
                    </div>
                    <div className="p-3 bg-orange-50 rounded-full">
                        <BarChart3 className="w-6 h-6 text-orange-500" />
                    </div>
                </div>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-96">

                {/* Chart */}
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 lg:col-span-2">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Pipeline Value by Stage</h3>
                    <div className="h-full max-h-[300px] flex items-center justify-center">
                        <Bar options={options} data={chartData} />
                    </div>
                </div>

                {/* Recent Deals List */}
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 flex flex-col">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent Activity</h3>
                    <div className="flex-1 overflow-y-auto space-y-4 pr-2">
                        {stats?.recentDeals?.map((deal: any) => (
                            <div key={deal._id} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-md transition-colors border-b border-gray-50 last:border-0">
                                <div className="flex items-center space-x-3">
                                    <div className="p-2 bg-gray-100 rounded-full">
                                        <Briefcase className="w-4 h-4 text-gray-500" />
                                    </div>
                                    <div>
                                        <div className="text-sm font-medium text-gray-900">{deal.title}</div>
                                        <div className="text-xs text-gray-500">{deal.accountName} • {deal.assignedTo?.name || "Unassigned"}</div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-sm font-semibold text-gray-900">
                                        {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(deal.value)}
                                    </div>
                                    <div className={`text-xs px-2 py-0.5 rounded-full inline-block mt-1
                                        ${deal.status === 'Closed Won' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}
                                    `}>
                                        {deal.status}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
