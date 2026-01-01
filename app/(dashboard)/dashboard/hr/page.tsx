"use client";

import { useState, useEffect } from "react";
import {
    Users,
    Clock,
    UserPlus,
    Calendar,
    ArrowRight,
    CheckCircle,
    AlertCircle
} from "lucide-react";

export default function HRManagerDashboard() {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [employeesRes, candidatesRes] = await Promise.all([
                fetch("/api/hr/employees"),
                fetch("/api/hr/candidates")
            ]);

            const employees = await employeesRes.json();
            const candidates = await candidatesRes.json();

            setData({ employees, candidates });
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="p-8 text-center text-gray-500">Loading HR overview...</div>;

    const totalEmployees = data?.employees?.length || 0;
    const activeEmployees = data?.employees?.filter((e: any) => e.status === 'Active')?.length || 0;
    const totalCandidates = data?.candidates?.length || 0;
    const interviewStage = data?.candidates?.filter((c: any) => c.stage === 'Interview')?.length || 0;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-gray-900">HR Manager Dashboard</h1>
                <p className="text-sm text-gray-500">People & Compliance • Managing your workforce</p>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white p-6 rounded-xl shadow-sm border">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="text-sm text-gray-500">Total Employees</div>
                            <div className="text-2xl font-bold text-gray-900">{totalEmployees}</div>
                        </div>
                        <Users className="w-8 h-8 text-blue-400" />
                    </div>
                    <div className="text-sm text-green-600 mt-2">{activeEmployees} active</div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="text-sm text-gray-500">Candidates</div>
                            <div className="text-2xl font-bold text-purple-600">{totalCandidates}</div>
                        </div>
                        <UserPlus className="w-8 h-8 text-purple-400" />
                    </div>
                    <div className="text-sm text-gray-500 mt-2">{interviewStage} in interview</div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="text-sm text-gray-500">Attendance Today</div>
                            <div className="text-2xl font-bold text-green-600">--</div>
                        </div>
                        <Clock className="w-8 h-8 text-green-400" />
                    </div>
                    <div className="text-sm text-gray-500 mt-2">Check attendance logs</div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="text-sm text-gray-500">Pending Approvals</div>
                            <div className="text-2xl font-bold text-orange-600">0</div>
                        </div>
                        <Calendar className="w-8 h-8 text-orange-400" />
                    </div>
                    <div className="text-sm text-gray-500 mt-2">Leave requests</div>
                </div>
            </div>

            {/* Main Content */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Candidates */}
                <div className="bg-white rounded-xl shadow-sm border p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold text-gray-800">Recent Candidates</h3>
                        <a href="/hr/recruitment" className="text-sm text-blue-600 hover:underline flex items-center">
                            View All <ArrowRight className="w-4 h-4 ml-1" />
                        </a>
                    </div>
                    <div className="space-y-3">
                        {data?.candidates?.slice(0, 5).map((candidate: any) => (
                            <div key={candidate._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                <div>
                                    <div className="font-medium">{candidate.name}</div>
                                    <div className="text-sm text-gray-500">{candidate.position}</div>
                                </div>
                                <span className={`text-xs px-2 py-1 rounded ${candidate.stage === 'Hired' ? 'bg-green-100 text-green-700' :
                                        candidate.stage === 'Interview' ? 'bg-blue-100 text-blue-700' :
                                            candidate.stage === 'Rejected' ? 'bg-red-100 text-red-700' :
                                                'bg-gray-100 text-gray-700'
                                    }`}>{candidate.stage}</span>
                            </div>
                        ))}
                        {(!data?.candidates || data.candidates.length === 0) && (
                            <div className="text-center py-8 text-gray-500">
                                No candidates yet. <a href="/hr/recruitment/new" className="text-blue-600 hover:underline">Add one!</a>
                            </div>
                        )}
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="bg-white rounded-xl shadow-sm border p-6">
                    <h3 className="font-semibold text-gray-800 mb-4">HR Actions</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <a href="/hr/employees" className="flex flex-col items-center justify-center p-6 bg-blue-50 rounded-xl hover:bg-blue-100 transition">
                            <Users className="w-8 h-8 text-blue-600 mb-2" />
                            <span className="font-medium text-gray-800">Employees</span>
                        </a>
                        <a href="/hr/attendance" className="flex flex-col items-center justify-center p-6 bg-green-50 rounded-xl hover:bg-green-100 transition">
                            <Clock className="w-8 h-8 text-green-600 mb-2" />
                            <span className="font-medium text-gray-800">Attendance</span>
                        </a>
                        <a href="/hr/recruitment" className="flex flex-col items-center justify-center p-6 bg-purple-50 rounded-xl hover:bg-purple-100 transition">
                            <UserPlus className="w-8 h-8 text-purple-600 mb-2" />
                            <span className="font-medium text-gray-800">Recruitment</span>
                        </a>
                        <a href="/hr/employees/new" className="flex flex-col items-center justify-center p-6 bg-orange-50 rounded-xl hover:bg-orange-100 transition">
                            <CheckCircle className="w-8 h-8 text-orange-600 mb-2" />
                            <span className="font-medium text-gray-800">Onboard</span>
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
}
