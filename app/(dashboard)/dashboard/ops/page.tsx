"use client";

import { useState, useEffect } from "react";
import {
    Activity,
    Clock,
    AlertTriangle,
    CheckCircle,
    ArrowRight,
    Users,
    BarChart3
} from "lucide-react";

export default function OpsDashboard() {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const projectsRes = await fetch("/api/projects");
            const projects = await projectsRes.json();
            setData({ projects });
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="p-8 text-center text-gray-500">Loading operations data...</div>;

    const projects = data?.projects || [];
    const activeProjects = projects.filter((p: any) => p.status === 'Active');

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Operations Dashboard</h1>
                <p className="text-sm text-gray-500">Workflow & Bottlenecks • Keep things moving</p>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white p-6 rounded-xl shadow-sm border">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="text-sm text-gray-500">Active Workflows</div>
                            <div className="text-2xl font-bold text-blue-600">{activeProjects.length}</div>
                        </div>
                        <Activity className="w-8 h-8 text-blue-400" />
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="text-sm text-gray-500">Pending Approvals</div>
                            <div className="text-2xl font-bold text-orange-600">0</div>
                        </div>
                        <Clock className="w-8 h-8 text-orange-400" />
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="text-sm text-gray-500">Blockers</div>
                            <div className="text-2xl font-bold text-red-600">0</div>
                        </div>
                        <AlertTriangle className="w-8 h-8 text-red-400" />
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="text-sm text-gray-500">Completed Today</div>
                            <div className="text-2xl font-bold text-green-600">--</div>
                        </div>
                        <CheckCircle className="w-8 h-8 text-green-400" />
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Active Projects */}
                <div className="bg-white rounded-xl shadow-sm border p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold text-gray-800">Active Workflows</h3>
                        <a href="/projects" className="text-sm text-blue-600 hover:underline flex items-center">
                            View All <ArrowRight className="w-4 h-4 ml-1" />
                        </a>
                    </div>
                    <div className="space-y-3">
                        {activeProjects.slice(0, 5).map((project: any) => (
                            <div key={project._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                <div>
                                    <div className="font-medium">{project.name}</div>
                                    <div className="text-sm text-gray-500">{project.health || 'Unknown'} health</div>
                                </div>
                                <span className={`w-3 h-3 rounded-full ${project.health === 'Green' ? 'bg-green-500' :
                                        project.health === 'Yellow' ? 'bg-yellow-500' :
                                            project.health === 'Red' ? 'bg-red-500' :
                                                'bg-gray-400'
                                    }`}></span>
                            </div>
                        ))}
                        {activeProjects.length === 0 && (
                            <div className="text-center py-8 text-gray-500">No active workflows</div>
                        )}
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="bg-white rounded-xl shadow-sm border p-6">
                    <h3 className="font-semibold text-gray-800 mb-4">Operations Actions</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <a href="/projects" className="flex flex-col items-center justify-center p-6 bg-blue-50 rounded-xl hover:bg-blue-100 transition">
                            <Activity className="w-8 h-8 text-blue-600 mb-2" />
                            <span className="font-medium text-gray-800">Workflows</span>
                        </a>
                        <a href="/hr/employees" className="flex flex-col items-center justify-center p-6 bg-green-50 rounded-xl hover:bg-green-100 transition">
                            <Users className="w-8 h-8 text-green-600 mb-2" />
                            <span className="font-medium text-gray-800">Resources</span>
                        </a>
                        <a href="/finance/reports" className="flex flex-col items-center justify-center p-6 bg-purple-50 rounded-xl hover:bg-purple-100 transition">
                            <BarChart3 className="w-8 h-8 text-purple-600 mb-2" />
                            <span className="font-medium text-gray-800">Reports</span>
                        </a>
                        <a href="/admin/audit-logs" className="flex flex-col items-center justify-center p-6 bg-gray-100 rounded-xl hover:bg-gray-200 transition">
                            <Clock className="w-8 h-8 text-gray-600 mb-2" />
                            <span className="font-medium text-gray-800">Activity</span>
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
}
