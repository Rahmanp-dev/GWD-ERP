"use client";

import { useState, useEffect } from "react";
import {
    DollarSign,
    TrendingUp,
    CreditCard,
    AlertCircle,
    ArrowRight,
    FileText,
    PieChart
} from "lucide-react";

export default function CFODashboard() {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [commissionsRes, salesRes] = await Promise.all([
                fetch("/api/finance/commissions"),
                fetch("/api/crm/analytics/dashboard")
            ]);

            const commissions = await commissionsRes.json();
            const sales = await salesRes.json();

            setData({ commissions, sales });
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (val: number) =>
        new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val || 0);

    if (loading) return <div className="p-8 text-center text-gray-500">Loading financial overview...</div>;

    const revenue = data?.sales?.totalRevenue || 0;
    const pendingCommissions = data?.commissions?.totals?.totalPending || 0;
    const approvedCommissions = data?.commissions?.totals?.totalApproved || 0;
    const paidCommissions = data?.commissions?.totals?.totalPaid || 0;
    const totalLiabilities = pendingCommissions + approvedCommissions;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-gray-900">CFO Dashboard</h1>
                <p className="text-sm text-gray-500">Numbers & Risk • Financial health at a glance</p>
            </div>

            {/* Financial KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-gradient-to-br from-green-500 to-green-600 p-6 rounded-xl text-white shadow-lg">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="text-sm opacity-80">Total Revenue</div>
                            <div className="text-2xl font-bold">{formatCurrency(revenue)}</div>
                        </div>
                        <DollarSign className="w-10 h-10 opacity-50" />
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="text-sm text-gray-500">Pipeline Value</div>
                            <div className="text-2xl font-bold text-blue-600">{formatCurrency(data?.sales?.totalPipelineValue)}</div>
                        </div>
                        <TrendingUp className="w-8 h-8 text-blue-400" />
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="text-sm text-gray-500">Commission Liability</div>
                            <div className="text-2xl font-bold text-orange-600">{formatCurrency(totalLiabilities)}</div>
                        </div>
                        <CreditCard className="w-8 h-8 text-orange-400" />
                    </div>
                    <div className="text-xs text-gray-500 mt-2">Pending + Approved</div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="text-sm text-gray-500">Commissions Paid</div>
                            <div className="text-2xl font-bold text-gray-900">{formatCurrency(paidCommissions)}</div>
                        </div>
                        <FileText className="w-8 h-8 text-gray-400" />
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Commission Breakdown */}
                <div className="bg-white rounded-xl shadow-sm border p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold text-gray-800">Commission Status</h3>
                        <a href="/finance/commissions" className="text-sm text-blue-600 hover:underline flex items-center">
                            Manage <ArrowRight className="w-4 h-4 ml-1" />
                        </a>
                    </div>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg">
                            <div className="flex items-center">
                                <AlertCircle className="w-5 h-5 text-yellow-600 mr-3" />
                                <span className="font-medium">Pending Approval</span>
                            </div>
                            <span className="text-lg font-bold text-yellow-600">{formatCurrency(pendingCommissions)}</span>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                            <div className="flex items-center">
                                <CreditCard className="w-5 h-5 text-blue-600 mr-3" />
                                <span className="font-medium">Approved (To Pay)</span>
                            </div>
                            <span className="text-lg font-bold text-blue-600">{formatCurrency(approvedCommissions)}</span>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                            <div className="flex items-center">
                                <DollarSign className="w-5 h-5 text-green-600 mr-3" />
                                <span className="font-medium">Paid Out</span>
                            </div>
                            <span className="text-lg font-bold text-green-600">{formatCurrency(paidCommissions)}</span>
                        </div>
                    </div>
                </div>

                {/* Quick Links */}
                <div className="bg-white rounded-xl shadow-sm border p-6">
                    <h3 className="font-semibold text-gray-800 mb-4">Financial Actions</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <a href="/finance/commissions" className="flex flex-col items-center justify-center p-6 bg-blue-50 rounded-xl hover:bg-blue-100 transition">
                            <DollarSign className="w-8 h-8 text-blue-600 mb-2" />
                            <span className="font-medium text-gray-800">Commissions</span>
                        </a>
                        <a href="/finance/reports" className="flex flex-col items-center justify-center p-6 bg-purple-50 rounded-xl hover:bg-purple-100 transition">
                            <PieChart className="w-8 h-8 text-purple-600 mb-2" />
                            <span className="font-medium text-gray-800">Reports</span>
                        </a>
                        <a href="/admin/audit-logs" className="flex flex-col items-center justify-center p-6 bg-gray-50 rounded-xl hover:bg-gray-100 transition">
                            <FileText className="w-8 h-8 text-gray-600 mb-2" />
                            <span className="font-medium text-gray-800">Audit Logs</span>
                        </a>
                        <a href="/finance" className="flex flex-col items-center justify-center p-6 bg-green-50 rounded-xl hover:bg-green-100 transition">
                            <TrendingUp className="w-8 h-8 text-green-600 mb-2" />
                            <span className="font-medium text-gray-800">Finance Hub</span>
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
}
