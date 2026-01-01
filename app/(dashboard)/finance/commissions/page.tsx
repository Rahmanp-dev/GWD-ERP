"use client";

import { useState, useEffect } from "react";
import { DollarSign, CheckCircle, Clock, AlertCircle, TrendingUp } from "lucide-react";

export default function CommissionsDashboard() {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState("");

    useEffect(() => {
        fetchCommissions();
    }, [filter]);

    const fetchCommissions = async () => {
        setLoading(true);
        try {
            const url = filter ? `/api/finance/commissions?status=${filter}` : "/api/finance/commissions";
            const res = await fetch(url);
            const result = await res.json();
            setData(result);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const updateStatus = async (id: string, status: string) => {
        try {
            await fetch("/api/finance/commissions", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id, status })
            });
            fetchCommissions();
        } catch (error) {
            console.error(error);
        }
    };

    if (loading) return <div className="p-8 text-center text-gray-500">Loading...</div>;

    const formatCurrency = (val: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);

    return (
        <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-900">Commissions</h1>
                <select
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                    className="border rounded px-3 py-2 text-sm"
                >
                    <option value="">All Status</option>
                    <option value="Pending">Pending</option>
                    <option value="Approved">Approved</option>
                    <option value="Paid">Paid</option>
                </select>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-lg shadow-sm border flex items-center justify-between">
                    <div>
                        <div className="text-sm text-gray-500">Pending</div>
                        <div className="text-2xl font-bold text-yellow-600">{formatCurrency(data?.totals?.totalPending || 0)}</div>
                    </div>
                    <Clock className="w-8 h-8 text-yellow-400" />
                </div>
                <div className="bg-white p-6 rounded-lg shadow-sm border flex items-center justify-between">
                    <div>
                        <div className="text-sm text-gray-500">Approved</div>
                        <div className="text-2xl font-bold text-blue-600">{formatCurrency(data?.totals?.totalApproved || 0)}</div>
                    </div>
                    <CheckCircle className="w-8 h-8 text-blue-400" />
                </div>
                <div className="bg-white p-6 rounded-lg shadow-sm border flex items-center justify-between">
                    <div>
                        <div className="text-sm text-gray-500">Paid</div>
                        <div className="text-2xl font-bold text-green-600">{formatCurrency(data?.totals?.totalPaid || 0)}</div>
                    </div>
                    <DollarSign className="w-8 h-8 text-green-400" />
                </div>
                <div className="bg-white p-6 rounded-lg shadow-sm border flex items-center justify-between">
                    <div>
                        <div className="text-sm text-gray-500">Total Commissions</div>
                        <div className="text-2xl font-bold text-gray-900">{data?.commissions?.length || 0}</div>
                    </div>
                    <TrendingUp className="w-8 h-8 text-gray-400" />
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Deal</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Salesperson</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Deal Value</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rate</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Commission</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {data?.commissions?.map((comm: any) => (
                            <tr key={comm._id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm font-medium text-gray-900">{comm.dealTitle}</div>
                                    <div className="text-xs text-gray-500">{comm.dealId?.accountName}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                    {comm.userId?.name || "Unknown"}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                    {formatCurrency(comm.dealValue)}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {(comm.commissionRate * 100).toFixed(1)}%
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-green-600">
                                    {formatCurrency(comm.commissionAmount)}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-2 py-1 text-xs rounded-full ${comm.status === 'Paid' ? 'bg-green-100 text-green-700' :
                                            comm.status === 'Approved' ? 'bg-blue-100 text-blue-700' :
                                                comm.status === 'Pending' ? 'bg-yellow-100 text-yellow-700' :
                                                    'bg-red-100 text-red-700'
                                        }`}>
                                        {comm.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                                    {comm.status === 'Pending' && (
                                        <button
                                            onClick={() => updateStatus(comm._id, 'Approved')}
                                            className="text-blue-600 hover:text-blue-800"
                                        >
                                            Approve
                                        </button>
                                    )}
                                    {comm.status === 'Approved' && (
                                        <button
                                            onClick={() => updateStatus(comm._id, 'Paid')}
                                            className="text-green-600 hover:text-green-800"
                                        >
                                            Mark Paid
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
