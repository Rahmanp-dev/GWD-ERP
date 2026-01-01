"use client";

import { useState, useEffect } from "react";
import {
    Users,
    TrendingUp,
    DollarSign,
    AlertCircle,
    ChevronDown,
    RefreshCw,
    UserCheck,
    ArrowRight
} from "lucide-react";

interface SalespersonStats {
    _id: string;
    name: string;
    email: string;
    image?: string;
    totalDeals: number;
    totalValue: number;
    wonDeals: number;
    wonValue: number;
    pendingDeals: number;
    pendingValue: number;
}

export default function ManagerDashboard() {
    const [stats, setStats] = useState<SalespersonStats[]>([]);
    const [teamStats, setTeamStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [selectedUser, setSelectedUser] = useState<string | null>(null);

    useEffect(() => {
        fetchManagerStats();
    }, []);

    const fetchManagerStats = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/crm/analytics/manager");
            const data = await res.json();
            setStats(data.salespersonStats || []);
            setTeamStats(data.teamTotals || {});
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (val: number) =>
        new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);

    if (loading) return <div className="p-8 text-center text-gray-500">Loading...</div>;

    return (
        <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-900">Sales Manager Dashboard</h1>
                <button
                    onClick={fetchManagerStats}
                    className="flex items-center px-3 py-2 text-sm text-gray-600 hover:text-gray-900"
                >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Refresh
                </button>
            </div>

            {/* Team Totals */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-lg shadow-sm border flex items-center justify-between">
                    <div>
                        <div className="text-sm text-gray-500">Team Pipeline</div>
                        <div className="text-2xl font-bold text-red-600">
                            {formatCurrency(teamStats?.totalPipeline || 0)}
                        </div>
                    </div>
                    <DollarSign className="w-8 h-8 text-blue-400" />
                </div>
                <div className="bg-white p-6 rounded-lg shadow-sm border flex items-center justify-between">
                    <div>
                        <div className="text-sm text-gray-500">Revenue (Won)</div>
                        <div className="text-2xl font-bold text-green-600">
                            {formatCurrency(teamStats?.totalRevenue || 0)}
                        </div>
                    </div>
                    <TrendingUp className="w-8 h-8 text-green-400" />
                </div>
                <div className="bg-white p-6 rounded-lg shadow-sm border flex items-center justify-between">
                    <div>
                        <div className="text-sm text-gray-500">Active Deals</div>
                        <div className="text-2xl font-bold text-gray-900">
                            {teamStats?.totalDeals || 0}
                        </div>
                    </div>
                    <Users className="w-8 h-8 text-gray-400" />
                </div>
                <div className="bg-white p-6 rounded-lg shadow-sm border flex items-center justify-between">
                    <div>
                        <div className="text-sm text-gray-500">Win Rate</div>
                        <div className="text-2xl font-bold text-purple-600">
                            {teamStats?.totalDeals > 0 ?
                                Math.round((teamStats.wonDeals / teamStats.totalDeals) * 100) : 0}%
                        </div>
                    </div>
                    <UserCheck className="w-8 h-8 text-purple-400" />
                </div>
            </div>

            {/* Team Performance Table */}
            <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
                <div className="p-4 border-b bg-gray-50">
                    <h3 className="font-semibold text-gray-800">Team Performance</h3>
                </div>
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Salesperson</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Deals</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Pipeline Value</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Won</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Revenue</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Win Rate</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {stats.map((person) => (
                            <tr key={person._id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center">
                                        {person.image ? (
                                            <img className="h-8 w-8 rounded-full mr-3" src={person.image} alt="" />
                                        ) : (
                                            <div className="h-8 w-8 rounded-full bg-red-100 flex items-center justify-center mr-3 text-red-600 font-medium">
                                                {person.name?.[0]}
                                            </div>
                                        )}
                                        <div>
                                            <div className="text-sm font-medium text-gray-900">{person.name}</div>
                                            <div className="text-xs text-gray-500">{person.email}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                    {person.totalDeals}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                    {formatCurrency(person.pendingValue)}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-medium">
                                    {person.wonDeals}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-medium">
                                    {formatCurrency(person.wonValue)}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center">
                                        <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                                            <div
                                                className="bg-green-500 h-2 rounded-full"
                                                style={{ width: `${person.totalDeals > 0 ? (person.wonDeals / person.totalDeals) * 100 : 0}%` }}
                                            />
                                        </div>
                                        <span className="text-sm text-gray-600">
                                            {person.totalDeals > 0 ? Math.round((person.wonDeals / person.totalDeals) * 100) : 0}%
                                        </span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                    <a
                                        href={`/crm/pipeline?ownerId=${person._id}`}
                                        className="text-red-600 hover:text-blue-800 flex items-center"
                                    >
                                        View Pipeline <ArrowRight className="w-4 h-4 ml-1" />
                                    </a>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Alerts/Flags */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
                <h3 className="font-semibold text-gray-800 mb-4 flex items-center">
                    <AlertCircle className="w-5 h-5 text-yellow-500 mr-2" />
                    Attention Required
                </h3>
                <div className="space-y-3">
                    {stats.filter(p => p.pendingDeals > 5).map(person => (
                        <div key={person._id} className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg border border-yellow-100">
                            <div className="flex items-center">
                                <span className="font-medium text-gray-900">{person.name}</span>
                                <span className="text-sm text-gray-500 ml-2">has {person.pendingDeals} pending deals</span>
                            </div>
                            <span className="text-yellow-600 text-sm font-medium">
                                {formatCurrency(person.pendingValue)} at risk
                            </span>
                        </div>
                    ))}
                    {stats.every(p => p.pendingDeals <= 5) && (
                        <div className="text-center text-gray-500 py-4">
                            No alerts at this time.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
