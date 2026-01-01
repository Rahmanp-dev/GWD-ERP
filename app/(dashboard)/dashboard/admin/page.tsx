"use client";

import { useState, useEffect } from "react";
import {
    Users,
    Activity,
    Settings,
    Shield,
    ArrowRight,
    FileText,
    AlertCircle
} from "lucide-react";

export default function AdminDashboard() {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [usersRes, auditRes] = await Promise.all([
                fetch("/api/admin/users"),
                fetch("/api/admin/audit-logs?limit=10")
            ]);

            const users = await usersRes.json();
            const audit = await auditRes.json();

            setData({ users, audit });
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="p-8 text-center text-gray-500">Loading system overview...</div>;

    const totalUsers = data?.users?.length || 0;
    const recentLogs = data?.audit?.logs || [];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
                <p className="text-sm text-gray-500">System Health • User management & logs</p>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white p-6 rounded-xl shadow-sm border">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="text-sm text-gray-500">Total Users</div>
                            <div className="text-2xl font-bold text-gray-900">{totalUsers}</div>
                        </div>
                        <Users className="w-8 h-8 text-blue-400" />
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="text-sm text-gray-500">Audit Events</div>
                            <div className="text-2xl font-bold text-purple-600">{data?.audit?.pagination?.total || 0}</div>
                        </div>
                        <Activity className="w-8 h-8 text-purple-400" />
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="text-sm text-gray-500">System Status</div>
                            <div className="text-2xl font-bold text-green-600">Healthy</div>
                        </div>
                        <Shield className="w-8 h-8 text-green-400" />
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="text-sm text-gray-500">Errors (24h)</div>
                            <div className="text-2xl font-bold text-gray-900">0</div>
                        </div>
                        <AlertCircle className="w-8 h-8 text-gray-400" />
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Activity */}
                <div className="bg-white rounded-xl shadow-sm border p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold text-gray-800">Recent Activity</h3>
                        <a href="/admin/audit-logs" className="text-sm text-blue-600 hover:underline flex items-center">
                            View All <ArrowRight className="w-4 h-4 ml-1" />
                        </a>
                    </div>
                    <div className="space-y-3">
                        {recentLogs.slice(0, 5).map((log: any) => (
                            <div key={log._id} className="flex items-start p-3 bg-gray-50 rounded-lg">
                                <Activity className="w-4 h-4 text-gray-400 mr-3 mt-1" />
                                <div className="flex-1">
                                    <div className="text-sm">
                                        <span className="font-medium">{log.userName || 'System'}</span>
                                        <span className="text-gray-500"> {log.action?.toLowerCase()} </span>
                                        <span className="text-gray-700">{log.entityType}</span>
                                    </div>
                                    <div className="text-xs text-gray-500 mt-1">
                                        {new Date(log.timestamp).toLocaleString()}
                                    </div>
                                </div>
                            </div>
                        ))}
                        {recentLogs.length === 0 && (
                            <div className="text-center py-8 text-gray-500">No recent activity</div>
                        )}
                    </div>
                </div>

                {/* Admin Actions */}
                <div className="bg-white rounded-xl shadow-sm border p-6">
                    <h3 className="font-semibold text-gray-800 mb-4">Admin Actions</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <a href="/admin/users" className="flex flex-col items-center justify-center p-6 bg-blue-50 rounded-xl hover:bg-blue-100 transition">
                            <Users className="w-8 h-8 text-blue-600 mb-2" />
                            <span className="font-medium text-gray-800">Users</span>
                        </a>
                        <a href="/admin/audit-logs" className="flex flex-col items-center justify-center p-6 bg-purple-50 rounded-xl hover:bg-purple-100 transition">
                            <FileText className="w-8 h-8 text-purple-600 mb-2" />
                            <span className="font-medium text-gray-800">Audit Logs</span>
                        </a>
                        <a href="/finance/reports" className="flex flex-col items-center justify-center p-6 bg-green-50 rounded-xl hover:bg-green-100 transition">
                            <Activity className="w-8 h-8 text-green-600 mb-2" />
                            <span className="font-medium text-gray-800">Reports</span>
                        </a>
                        <div className="flex flex-col items-center justify-center p-6 bg-gray-100 rounded-xl cursor-not-allowed">
                            <Settings className="w-8 h-8 text-gray-400 mb-2" />
                            <span className="font-medium text-gray-500">Settings</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
