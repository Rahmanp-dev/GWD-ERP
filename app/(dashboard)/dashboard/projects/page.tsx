"use client";

import { useState, useEffect } from "react";
import {
    Briefcase,
    CheckSquare,
    AlertTriangle,
    DollarSign,
    ArrowRight,
    Clock,
    Users
} from "lucide-react";

export default function PMDashboard() {
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

    const formatCurrency = (val: number) =>
        new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val || 0);

    if (loading) return <div className="p-8 text-center text-gray-500">Loading projects...</div>;

    const projects = data?.projects || [];
    const activeProjects = projects.filter((p: any) => p.status === 'Active');
    const atRisk = projects.filter((p: any) => p.health === 'Red');
    const totalBudget = projects.reduce((acc: number, p: any) => acc + (p.budget?.estimated || 0), 0);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Project Manager Dashboard</h1>
                <p className="text-sm text-gray-500">Delivery Control • Keep projects on track</p>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white p-6 rounded-xl shadow-sm border">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="text-sm text-gray-500">Active Projects</div>
                            <div className="text-2xl font-bold text-blue-600">{activeProjects.length}</div>
                        </div>
                        <Briefcase className="w-8 h-8 text-blue-400" />
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="text-sm text-gray-500">Total Budget</div>
                            <div className="text-2xl font-bold text-green-600">{formatCurrency(totalBudget)}</div>
                        </div>
                        <DollarSign className="w-8 h-8 text-green-400" />
                    </div>
                </div>

                <div className={`p-6 rounded-xl shadow-sm border ${atRisk.length > 0 ? 'bg-red-50' : 'bg-white'}`}>
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="text-sm text-gray-500">At Risk</div>
                            <div className={`text-2xl font-bold ${atRisk.length > 0 ? 'text-red-600' : 'text-gray-900'}`}>{atRisk.length}</div>
                        </div>
                        <AlertTriangle className={`w-8 h-8 ${atRisk.length > 0 ? 'text-red-400' : 'text-gray-400'}`} />
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="text-sm text-gray-500">Overdue Tasks</div>
                            <div className="text-2xl font-bold text-gray-900">--</div>
                        </div>
                        <Clock className="w-8 h-8 text-gray-400" />
                    </div>
                </div>
            </div>

            {/* Projects List */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-gray-800">My Projects</h3>
                    <a href="/projects" className="text-sm text-blue-600 hover:underline flex items-center">
                        All Projects <ArrowRight className="w-4 h-4 ml-1" />
                    </a>
                </div>
                <div className="space-y-3">
                    {projects.slice(0, 5).map((project: any) => (
                        <a key={project._id} href={`/projects/${project._id}`} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
                            <div className="flex items-center">
                                <span className={`w-3 h-3 rounded-full mr-3 ${project.health === 'Green' ? 'bg-green-500' :
                                        project.health === 'Yellow' ? 'bg-yellow-500' :
                                            project.health === 'Red' ? 'bg-red-500' :
                                                'bg-gray-400'
                                    }`}></span>
                                <div>
                                    <div className="font-medium text-gray-900">{project.name}</div>
                                    <div className="text-sm text-gray-500">{project.client || 'Internal'}</div>
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="text-sm font-medium text-gray-900">{formatCurrency(project.budget?.estimated)}</div>
                                <span className={`text-xs px-2 py-1 rounded ${project.status === 'Active' ? 'bg-blue-100 text-blue-700' :
                                        project.status === 'Completed' ? 'bg-green-100 text-green-700' :
                                            'bg-gray-100 text-gray-700'
                                    }`}>{project.status}</span>
                            </div>
                        </a>
                    ))}
                    {projects.length === 0 && (
                        <div className="text-center py-8 text-gray-500">
                            No projects yet. <a href="/projects/new" className="text-blue-600 hover:underline">Create one!</a>
                        </div>
                    )}
                </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-4 gap-4">
                <a href="/projects/new" className="flex flex-col items-center justify-center p-6 bg-white rounded-xl shadow-sm border hover:bg-gray-50 transition">
                    <Briefcase className="w-8 h-8 text-blue-600 mb-2" />
                    <span className="font-medium text-gray-800">New Project</span>
                </a>
                <a href="/projects" className="flex flex-col items-center justify-center p-6 bg-white rounded-xl shadow-sm border hover:bg-gray-50 transition">
                    <CheckSquare className="w-8 h-8 text-green-600 mb-2" />
                    <span className="font-medium text-gray-800">Task Board</span>
                </a>
                <a href="/projects" className="flex flex-col items-center justify-center p-6 bg-white rounded-xl shadow-sm border hover:bg-gray-50 transition">
                    <Users className="w-8 h-8 text-purple-600 mb-2" />
                    <span className="font-medium text-gray-800">Resources</span>
                </a>
                <a href="/finance/reports" className="flex flex-col items-center justify-center p-6 bg-white rounded-xl shadow-sm border hover:bg-gray-50 transition">
                    <DollarSign className="w-8 h-8 text-orange-600 mb-2" />
                    <span className="font-medium text-gray-800">Budgets</span>
                </a>
            </div>
        </div>
    );
}
