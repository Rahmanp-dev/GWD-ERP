import { Shield, AlertTriangle, Clock, Layers, CheckCircle, Users } from 'lucide-react';
import dbConnect from '@/lib/db';
import Project from '@/lib/models/Project';
import Task from '@/lib/models/Task';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

async function getStats() {
    await dbConnect();

    // Active Projects
    const activeProjects = await Project.countDocuments({ status: 'Active' });

    // Projects at Risk (Red/Yellow health OR High/Critical risk status)
    const atRiskProjects = await Project.countDocuments({
        status: 'Active',
        $or: [
            { health: { $in: ['Red', 'Yellow'] } },
            { riskStatus: { $in: ['High', 'Critical'] } }
        ]
    });

    // Overdue Tasks
    const overdueTasks = await Task.countDocuments({
        status: { $nin: ['Done'] },
        dueDate: { $lt: new Date() }
    });

    // Blocked Tasks
    const blockedTasks = await Task.countDocuments({
        status: 'Blocked'
    });

    // Pending Approvals (simulated for now, assumes anything in 'In Review')
    const pendingApprovals = await Task.countDocuments({
        status: 'In Review'
    });

    return {
        activeProjects,
        atRiskProjects,
        overdueTasks,
        blockedTasks,
        pendingApprovals
    };
}

export default async function OperationsDashboard() {
    const stats = await getStats();

    const widgets = [
        {
            title: 'Active Projects',
            value: stats.activeProjects,
            icon: Layers,
            color: 'text-blue-600',
            bg: 'bg-blue-50',
            link: '/operations/projects'
        },
        {
            title: 'Projects at Risk',
            value: stats.atRiskProjects,
            icon: AlertTriangle,
            color: 'text-red-600',
            bg: 'bg-red-50',
            link: '/operations/projects?status=risk',
            alert: stats.atRiskProjects > 0
        },
        {
            title: 'Tasks Overdue',
            value: stats.overdueTasks,
            icon: Clock,
            color: 'text-orange-600',
            bg: 'bg-orange-50',
            link: '/operations/governance?filter=overdue'
        },
        {
            title: 'Blocked Tasks',
            value: stats.blockedTasks,
            icon: Shield,
            color: 'text-purple-600',
            bg: 'bg-purple-50',
            link: '/operations/governance?filter=blocked'
        },
        {
            title: 'Pending Approvals',
            value: stats.pendingApprovals,
            icon: CheckCircle,
            color: 'text-indigo-600',
            bg: 'bg-indigo-50',
            link: '/operations/approvals'
        }
    ];

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Operations Control Tower</h1>
                    <p className="text-gray-500">Macro view of enterprise workflow & delivery.</p>
                </div>
                <div className="text-sm text-gray-500">
                    Last updated: {new Date().toLocaleTimeString()}
                </div>
            </div>

            {/* Macro Widgets */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                {widgets.map((widget) => {
                    const Icon = widget.icon;
                    return (
                        <Link href={widget.link} key={widget.title} className="block group">
                            <div className={`p-6 bg-white rounded-xl shadow-sm border transition-shadow hover:shadow-md ${widget.alert ? 'border-red-200 ring-4 ring-red-50' : 'border-gray-100'}`}>
                                <div className="flex items-center justify-between mb-4">
                                    <div className={`p-2 rounded-lg ${widget.bg}`}>
                                        <Icon className={`w-6 h-6 ${widget.color}`} />
                                    </div>
                                    {widget.alert && (
                                        <span className="flex h-3 w-3 relative">
                                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                            <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                                        </span>
                                    )}
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

            {/* Dashboard Sections Placeholder */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="p-6 bg-white rounded-xl shadow-sm border border-gray-200">
                    <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                        <AlertTriangle className="w-5 h-5 text-red-500 mr-2" />
                        Project Oversight Needs Attention
                    </h2>
                    <div className="flex items-center justify-center h-48 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                        <p className="text-gray-500">Project Health Matrix Widget Loading...</p>
                    </div>
                </div>

                <div className="p-6 bg-white rounded-xl shadow-sm border border-gray-200">
                    <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                        <Users className="w-5 h-5 text-blue-500 mr-2" />
                        Resource & PM Performance
                    </h2>
                    <div className="flex items-center justify-center h-48 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                        <p className="text-gray-500">Resource Utilization Chart Loading...</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
