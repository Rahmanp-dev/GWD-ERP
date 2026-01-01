import dbConnect from '@/lib/db';
import User from '@/lib/models/User';
import { Users, UserMinus, UserPlus, AlertTriangle, Briefcase, TrendingUp } from 'lucide-react';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

async function getHRStats() {
    await dbConnect();

    // 1. Headcount Stats
    const totalEmployees = await User.countDocuments({
        role: { $nin: ['User', 'Candidate'] }, // Exclude external users/candidates
        employeeStatus: { $ne: 'Exited' }
    });

    // 2. New Joiners (Last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const newJoiners = await User.countDocuments({
        joinDate: { $gt: thirtyDaysAgo }
    });

    // 3. Attrition Risk
    const highRiskCount = await User.countDocuments({
        employeeStatus: 'Active',
        attritionRisk: 'High'
    });

    // 4. Open Roles (Mock for now, would link to Job model)
    const openRoles = 5;

    // 5. Onboarding Status
    const onboardingCount = await User.countDocuments({ employeeStatus: 'Onboarding' });

    return {
        totalEmployees,
        newJoiners,
        highRiskCount,
        openRoles,
        onboardingCount
    };
}

export default async function HRDashboardPage() {
    const stats = await getHRStats();

    const widgets = [
        {
            title: 'Total Headcount',
            value: stats.totalEmployees,
            icon: Users,
            color: 'text-blue-600',
            bg: 'bg-blue-50',
            link: '/hr/employees'
        },
        {
            title: 'High Retention Risk',
            value: stats.highRiskCount,
            icon: AlertTriangle,
            color: 'text-red-600',
            bg: 'bg-red-50',
            link: '/hr/employees?risk=High'
        },
        {
            title: 'New Joiners (30d)',
            value: stats.newJoiners,
            icon: UserPlus,
            color: 'text-green-600',
            bg: 'bg-green-50',
            link: '/hr/employees?filter=new'
        },
        {
            title: 'Open Positions',
            value: stats.openRoles,
            icon: Briefcase,
            color: 'text-purple-600',
            bg: 'bg-purple-50',
            link: '/hr/recruitment'
        },
        {
            title: 'Onboarding',
            value: stats.onboardingCount,
            icon: TrendingUp, // Using TrendingUp as a proxy for "Ramping Up"
            color: 'text-orange-600',
            bg: 'bg-orange-50',
            link: '/hr/onboarding'
        }
    ];

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">People Control Center</h1>
                    <p className="text-gray-500">Workforce analytics, retention, and compliance.</p>
                </div>
            </div>

            {/* Macro Widgets */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                {widgets.map((widget) => {
                    const Icon = widget.icon;
                    return (
                        <Link href={widget.link} key={widget.title} className="block group">
                            <div className="p-6 bg-white rounded-xl shadow-sm border border-gray-100 transition-shadow hover:shadow-md h-full">
                                <div className="flex items-center justify-between mb-4">
                                    <div className={`p-2 rounded-lg ${widget.bg}`}>
                                        <Icon className={`w-6 h-6 ${widget.color}`} />
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <h3 className="text-sm font-medium text-gray-500">{widget.title}</h3>
                                    <p className="text-3xl font-bold text-gray-900">{widget.value}</p>
                                </div>
                            </div>
                        </Link>
                    )
                })}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Employee Wellness / Absence Map */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 min-h-[300px]">
                    <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                        <Users className="w-5 h-5 text-blue-500 mr-2" />
                        Department Headcount
                    </h2>
                    <div className="space-y-4">
                        {(await User.aggregate([
                            { $match: { role: { $nin: ['User', 'Candidate'] } } },
                            { $group: { _id: "$department", count: { $sum: 1 } } },
                            { $sort: { count: -1 } }
                        ])).map((dept: any) => (
                            <div key={dept._id || 'Unassigned'} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded">
                                <span className="text-sm font-medium text-gray-700">{dept._id || 'General / Unassigned'}</span>
                                <div className="flex items-center">
                                    <div className="w-24 bg-gray-100 rounded-full h-2 mr-3">
                                        <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${(dept.count / stats.totalEmployees) * 100}%` }}></div>
                                    </div>
                                    <span className="text-xs font-bold text-gray-900">{dept.count}</span>
                                </div>
                            </div>
                        ))}
                        {stats.totalEmployees === 0 && <p className="text-sm text-center text-gray-500 py-4">No employee data available.</p>}
                    </div>
                </div>

                {/* Compliance & Payroll Status */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 min-h-[300px]">
                    <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                        <AlertTriangle className="w-5 h-5 text-orange-500 mr-2" />
                        Compliance & Alerts
                    </h2>
                    <div className="space-y-4">
                        <div className="p-3 bg-red-50 border border-red-100 rounded-lg flex justify-between items-center">
                            <span className="text-sm font-medium text-red-800">Missing Tax Documents (3 Employees)</span>
                            <button className="text-xs text-red-600 font-bold hover:underline">Resolve</button>
                        </div>
                        <div className="p-3 bg-yellow-50 border border-yellow-100 rounded-lg flex justify-between items-center">
                            <span className="text-sm font-medium text-yellow-800">Probation Reviews Due (2)</span>
                            <button className="text-xs text-yellow-600 font-bold hover:underline">Review</button>
                        </div>
                        <div className="p-3 bg-green-50 border border-green-100 rounded-lg flex justify-between items-center">
                            <span className="text-sm font-medium text-green-800">Payroll Run (Jan 2026)</span>
                            <span className="text-xs font-bold text-green-600">Ready</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
