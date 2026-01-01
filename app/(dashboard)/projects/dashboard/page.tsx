import dbConnect from '@/lib/db';
import Project from '@/lib/models/Project';
import Task from '@/lib/models/Task';
import { LayoutDashboard, AlertCircle, CheckSquare, Users, Clock, MessageSquare, TrendingUp } from 'lucide-react';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

async function getPMStats() {
    await dbConnect();

    // 1. Project Stats
    const activeProjects = await Project.find({ status: 'Active' });
    const projectCount = activeProjects.length;

    // Calculate overall Delivery Confidence
    let totalConfidence = 0;
    activeProjects.forEach((p: any) => totalConfidence += (p.deliveryConfidence || 80));
    const avgConfidence = projectCount > 0 ? Math.round(totalConfidence / projectCount) : 100;

    // 2. Urgent Tasks (Due today or Overdue)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const urgentTasks = await Task.countDocuments({
        status: { $nin: ['Done', 'Completed'] },
        dueDate: { $lt: tomorrow }
    });

    // 3. Blockers
    const blockedTasks = await Task.countDocuments({ status: 'Blocked' });

    // 4. Pending Reviews
    const pendingReviews = await Task.countDocuments({ status: 'In Review' });

    // 5. Active Risks
    // Simple aggregation on embedded risks array would strictly require aggregate pipeline
    // For now, approximate by checking filtered projects
    const highRiskProjects = await Project.countDocuments({
        status: 'Active',
        riskStatus: { $in: ['High', 'Critical'] }
    });

    return {
        projectCount,
        avgConfidence,
        urgentTasks,
        blockedTasks,
        pendingReviews,
        highRiskProjects
    };
}

export default async function ProjectManagerDashboard() {
    const stats = await getPMStats();

    const widgets = [
        {
            title: 'Active Projects',
            value: stats.projectCount,
            icon: LayoutDashboard,
            color: 'text-blue-600',
            bg: 'bg-blue-50',
            link: '/projects'
        },
        {
            title: 'Delivery Confidence',
            value: `${stats.avgConfidence}%`,
            icon: TrendingUp,
            color: stats.avgConfidence < 80 ? 'text-red-600' : 'text-green-600',
            bg: stats.avgConfidence < 80 ? 'bg-red-50' : 'bg-green-50',
            link: '/projects/dashboards'
        },
        {
            title: 'Tasks Due Today/Late',
            value: stats.urgentTasks,
            icon: Clock,
            color: 'text-orange-600',
            bg: 'bg-orange-50',
            link: '/projects/my-tasks?filter=urgent'
        },
        {
            title: 'Blocked Items',
            value: stats.blockedTasks,
            icon: AlertCircle,
            color: 'text-red-600',
            bg: 'bg-red-50',
            link: '/projects/my-tasks?status=Blocked'
        },
        {
            title: 'Pending Reviews',
            value: stats.pendingReviews,
            icon: CheckSquare,
            color: 'text-purple-600',
            bg: 'bg-purple-50',
            link: '/projects/evaluations' // Placeholder
        }
    ];

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Delivery Control</h1>
                    <p className="text-gray-500">Execution focus: What must be delivered today?</p>
                </div>
                <div className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                    {new Date().toLocaleDateString()}
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
                {/* My Critical Tasks */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 min-h-[300px]">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-lg font-bold text-gray-900 flex items-center">
                            <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
                            Firefighting (Critical & Blocked)
                        </h2>
                        <Link href="/projects/my-tasks" className="text-sm text-blue-600 hover:underline">View All</Link>
                    </div>

                    <div className="space-y-3">
                        {/* We can fetch these directly here for the dashboard view */}
                        {(await Task.find({
                            status: { $nin: ['Done', 'Completed'] },
                            $or: [{ priority: 'Critical' }, { status: 'Blocked' }]
                        }).limit(5).populate('project', 'title').lean()).map((task: any) => (
                            <div key={task._id} className="p-3 bg-red-50 border border-red-100 rounded-lg flex justify-between items-center">
                                <div>
                                    <h4 className="text-sm font-medium text-gray-900">{task.title}</h4>
                                    <p className="text-xs text-gray-500">{task.project?.title || 'No Project'}</p>
                                </div>
                                <div className="flex flex-col items-end gap-1">
                                    {task.status === 'Blocked' && <span className="px-2 py-0.5 bg-red-200 text-red-800 text-xs font-bold rounded">BLOCKED</span>}
                                    {task.priority === 'Critical' && <span className="px-2 py-0.5 bg-orange-200 text-orange-800 text-xs font-bold rounded">CRITICAL</span>}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Team Workload Pulse */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 min-h-[300px]">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-lg font-bold text-gray-900 flex items-center">
                            <Users className="w-5 h-5 text-blue-500 mr-2" />
                            Team Workload Pulse
                        </h2>
                        <Link href="/hr/employees" className="text-sm text-blue-600 hover:underline">View Team</Link>
                    </div>

                    <div className="space-y-4">
                        {/* Mocking team load aggregation for dashboard speed - in real app would be complex agg */}
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-700">Engineering Team</span>
                                <span className="text-gray-500">85% Capacity</span>
                            </div>
                            <div className="w-full bg-gray-100 rounded-full h-2">
                                <div className="bg-blue-500 h-2 rounded-full" style={{ width: '85%' }}></div>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-700">Design Team</span>
                                <span className="text-gray-500">92% Capacity (High)</span>
                            </div>
                            <div className="w-full bg-gray-100 rounded-full h-2">
                                <div className="bg-orange-500 h-2 rounded-full" style={{ width: '92%' }}></div>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-700">Marketing</span>
                                <span className="text-gray-500">45% Capacity</span>
                            </div>
                            <div className="w-full bg-gray-100 rounded-full h-2">
                                <div className="bg-green-500 h-2 rounded-full" style={{ width: '45%' }}></div>
                            </div>
                        </div>
                        <div className="pt-4 text-xs text-gray-500 text-center">
                            * Based on active task assignments vs standard 40h week
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
