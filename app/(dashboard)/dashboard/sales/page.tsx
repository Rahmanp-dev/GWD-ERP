"use client";

import { useState, useEffect } from "react";
import {
    Users,
    TrendingUp,
    AlertTriangle,
    Target,
    ArrowRight,
    Award,
    Clock
} from "lucide-react";

export default function SalesManagerDashboard() {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [managerRes, leadsRes] = await Promise.all([
                fetch("/api/crm/analytics/manager"),
                fetch("/api/crm/leads")
            ]);

            const manager = await managerRes.json();
            const leads = await leadsRes.json();

            setData({ manager, leads });
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (val: number) =>
        new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val || 0);

    if (loading) return <div className="p-8 text-center text-gray-500">Loading team data...</div>;

    const teamStats = data?.manager?.salespersonStats || [];
    const teamTotals = data?.manager?.teamTotals || {};
    const stuckDeals = data?.leads?.filter((d: any) => {
        const daysSinceUpdate = Math.floor((Date.now() - new Date(d.updatedAt).getTime()) / (1000 * 60 * 60 * 24));
        return !['Closed Won', 'Closed Lost'].includes(d.status) && daysSinceUpdate > 14;
    }) || [];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Sales Manager Dashboard</h1>
                <p className="text-sm text-gray-500">Team execution & coaching • Who needs help?</p>
            </div>

            {/* Team KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white p-5 rounded-xl shadow-sm border">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="text-sm text-gray-500">Team Pipeline</div>
                            <div className="text-2xl font-bold text-blue-600">{formatCurrency(teamTotals.totalPipeline)}</div>
                        </div>
                        <TrendingUp className="w-8 h-8 text-blue-400" />
                    </div>
                </div>
                <div className="bg-white p-5 rounded-xl shadow-sm border">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="text-sm text-gray-500">Team Revenue</div>
                            <div className="text-2xl font-bold text-green-600">{formatCurrency(teamTotals.totalRevenue)}</div>
                        </div>
                        <Target className="w-8 h-8 text-green-400" />
                    </div>
                </div>
                <div className="bg-white p-5 rounded-xl shadow-sm border">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="text-sm text-gray-500">Active Deals</div>
                            <div className="text-2xl font-bold text-gray-900">{teamTotals.totalDeals}</div>
                        </div>
                        <Users className="w-8 h-8 text-gray-400" />
                    </div>
                </div>
                <div className={`p-5 rounded-xl shadow-sm border ${stuckDeals.length > 0 ? 'bg-red-50' : 'bg-white'}`}>
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="text-sm text-gray-500">Stuck Deals (14+ days)</div>
                            <div className={`text-2xl font-bold ${stuckDeals.length > 0 ? 'text-red-600' : 'text-gray-900'}`}>{stuckDeals.length}</div>
                        </div>
                        <Clock className="w-8 h-8 text-red-400" />
                    </div>
                </div>
            </div>

            {/* Team Leaderboard */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                        <Award className="w-5 h-5 text-yellow-500 mr-2" />
                        <h3 className="font-semibold text-gray-800">Team Leaderboard</h3>
                    </div>
                    <a href="/crm/manager" className="text-sm text-blue-600 hover:underline flex items-center">
                        Full View <ArrowRight className="w-4 h-4 ml-1" />
                    </a>
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full">
                        <thead>
                            <tr className="text-left text-xs text-gray-500 uppercase border-b">
                                <th className="pb-3">Salesperson</th>
                                <th className="pb-3">Pipeline</th>
                                <th className="pb-3">Won</th>
                                <th className="pb-3">Win Rate</th>
                                <th className="pb-3">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {teamStats.sort((a: any, b: any) => b.wonValue - a.wonValue).slice(0, 5).map((person: any, i: number) => (
                                <tr key={person._id} className="border-b last:border-0 hover:bg-gray-50">
                                    <td className="py-3">
                                        <div className="flex items-center">
                                            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold mr-2 ${i === 0 ? 'bg-yellow-100 text-yellow-700' :
                                                    i === 1 ? 'bg-gray-100 text-gray-700' :
                                                        i === 2 ? 'bg-orange-100 text-orange-700' :
                                                            'bg-blue-100 text-blue-700'
                                                }`}>{i + 1}</span>
                                            <span className="font-medium">{person.name}</span>
                                        </div>
                                    </td>
                                    <td className="py-3 text-gray-600">{formatCurrency(person.pendingValue)}</td>
                                    <td className="py-3 text-green-600 font-medium">{formatCurrency(person.wonValue)}</td>
                                    <td className="py-3">
                                        <div className="flex items-center">
                                            <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                                                <div className="bg-green-500 h-2 rounded-full" style={{ width: `${person.totalDeals > 0 ? (person.wonDeals / person.totalDeals) * 100 : 0}%` }}></div>
                                            </div>
                                            <span className="text-sm text-gray-600">{person.totalDeals > 0 ? Math.round((person.wonDeals / person.totalDeals) * 100) : 0}%</span>
                                        </div>
                                    </td>
                                    <td className="py-3">
                                        <a href={`/crm/pipeline?ownerId=${person._id}`} className="text-blue-600 text-sm hover:underline">View</a>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Stuck Deals Alert */}
            {stuckDeals.length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-6">
                    <div className="flex items-center mb-4">
                        <AlertTriangle className="w-5 h-5 text-red-600 mr-2" />
                        <h3 className="font-semibold text-red-800">Deals Needing Attention</h3>
                    </div>
                    <div className="space-y-2">
                        {stuckDeals.slice(0, 3).map((deal: any) => (
                            <div key={deal._id} className="flex items-center justify-between p-3 bg-white rounded-lg">
                                <div>
                                    <div className="font-medium">{deal.title}</div>
                                    <div className="text-sm text-gray-500">Stage: {deal.status}</div>
                                </div>
                                <a href="/crm/pipeline" className="text-blue-600 text-sm hover:underline">Review</a>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
