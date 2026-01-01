import dbConnect from '@/lib/db';
import Task from '@/lib/models/Task';
import { Shield, AlertOctagon, Clock, RotateCcw, Lock } from 'lucide-react';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

async function getGovernanceStats(searchParams: { filter?: string }) {
    await dbConnect();

    const filter = searchParams.filter;
    let taskQuery: any = { status: { $ne: 'Done' } };

    if (filter === 'blocked') {
        taskQuery = { status: 'Blocked' };
    } else if (filter === 'overdue') {
        taskQuery = { dueDate: { $lt: new Date() }, status: { $ne: 'Done' } };
    }

    // Fetch relevant tasks
    const tasks = await Task.find(taskQuery)
        .populate('assignee', 'name')
        .populate('project', 'title')
        .sort({ updatedAt: -1 })
        .limit(50) // Limit for performance
        .lean();

    const governanceIssues = {
        stuckTasks: [] as any[],
        highChurnTasks: [] as any[], // High reassign count
        blockedTasks: [] as any[],
        pendingApprovals: [] as any[]
    };

    const NOW = new Date().getTime();
    const TWO_DAYS = 2 * 24 * 60 * 60 * 1000;

    tasks.forEach((task: any) => {
        // Stuck: In same status > 2 days (except To Do)
        if (task.status !== 'To Do' && task.lastStatusChange) {
            const timeInStatus = NOW - new Date(task.lastStatusChange).getTime();
            if (timeInStatus > TWO_DAYS) {
                task.daysInStatus = Math.floor(timeInStatus / (24 * 60 * 60 * 1000));
                governanceIssues.stuckTasks.push(task);
            }
        }

        // High Churn
        if (task.reassignCount > 2) {
            governanceIssues.highChurnTasks.push(task);
        }

        // Blocked
        if (task.status === 'Blocked') {
            governanceIssues.blockedTasks.push(task);
        }

        // Approvals (In Review)
        if (task.status === 'In Review') {
            governanceIssues.pendingApprovals.push(task);
        }
    });

    return governanceIssues;
}

export default async function GovernancePage({ searchParams }: { searchParams: Promise<{ filter?: string }> }) {
    const params = await searchParams;
    const issues = await getGovernanceStats(params);

    const SectionHeader = ({ title, icon: Icon, count, color = 'text-gray-900', bg = 'bg-gray-100' }: any) => (
        <div className="flex items-center space-x-3 mb-4">
            <div className={`p-2 rounded-lg ${bg}`}>
                <Icon className={`w-5 h-5 ${color}`} />
            </div>
            <h2 className="text-lg font-bold text-gray-900">{title}</h2>
            {count > 0 && (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                    {count}
                </span>
            )}
        </div>
    );

    const TaskCard = ({ task, type }: { task: any, type: 'stuck' | 'churn' | 'blocked' | 'approval' }) => (
        <div className="bg-white border hover:border-red-300 rounded-lg p-4 shadow-sm transition-all mb-3 group">
            <div className="flex justify-between items-start mb-2">
                <Link href={`/projects/${task.project?._id}/tasks/${task._id}`} className="font-medium text-gray-900 hover:text-blue-600 line-clamp-1">
                    {task.title}
                </Link>
                <span className={`text-xs px-2 py-1 rounded font-medium ${task.priority === 'Critical' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-600'
                    }`}>
                    {task.priority}
                </span>
            </div>

            <div className="text-xs text-gray-500 mb-3 flex items-center space-x-2">
                <span>{task.project?.title || 'Unknown Project'}</span>
                <span>•</span>
                <span>{task.assignee?.name || 'Unassigned'}</span>
            </div>

            <div className="flex items-center text-xs font-medium">
                {type === 'stuck' && (
                    <span className="text-orange-600 flex items-center">
                        <Clock className="w-3 h-3 mr-1" />
                        Stuck for {task.daysInStatus} days
                    </span>
                )}
                {type === 'churn' && (
                    <span className="text-purple-600 flex items-center">
                        <RotateCcw className="w-3 h-3 mr-1" />
                        Reassigned {task.reassignCount} times
                    </span>
                )}
                {type === 'blocked' && (
                    <span className="text-red-600 flex items-center">
                        <Lock className="w-3 h-3 mr-1" />
                        BLOCKED
                    </span>
                )}
                {type === 'approval' && (
                    <span className="text-blue-600 flex items-center">
                        <Shield className="w-3 h-3 mr-1" />
                        Needs Approval
                    </span>
                )}
            </div>
        </div>
    );

    return (
        <div className="space-y-8">
            <div className="bg-white p-6 rounded-lg border shadow-sm">
                <h1 className="text-2xl font-bold text-gray-900">Workflow Governance & Control</h1>
                <p className="text-gray-500">Monitor flow efficiency, identify bottlenecks, and manage approvals.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

                {/* 1. Blocked Column */}
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                    <SectionHeader title="Blocked Tasks" icon={AlertOctagon} count={issues.blockedTasks.length} color="text-red-600" bg="bg-red-50" />
                    {issues.blockedTasks.length === 0 ? (
                        <p className="text-sm text-gray-400 text-center py-4">No blocked tasks.</p>
                    ) : (
                        issues.blockedTasks.map((task: any) => <TaskCard key={task._id} task={task} type="blocked" />)
                    )}
                </div>

                {/* 2. Stuck / Idle Tasks */}
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                    <SectionHeader title="Stalled Workflow" icon={Clock} count={issues.stuckTasks.length} color="text-orange-600" bg="bg-orange-50" />
                    {issues.stuckTasks.length === 0 ? (
                        <p className="text-sm text-gray-400 text-center py-4">Flow looks good.</p>
                    ) : (
                        issues.stuckTasks.map((task: any) => <TaskCard key={task._id} task={task} type="stuck" />)
                    )}
                </div>

                {/* 3. High Churn */}
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                    <SectionHeader title="High Churn" icon={RotateCcw} count={issues.highChurnTasks.length} color="text-purple-600" bg="bg-purple-50" />
                    {issues.highChurnTasks.length === 0 ? (
                        <p className="text-sm text-gray-400 text-center py-4">No high churn tasks.</p>
                    ) : (
                        issues.highChurnTasks.map((task: any) => <TaskCard key={task._id} task={task} type="churn" />)
                    )}
                </div>

                {/* 4. Approvals */}
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                    <SectionHeader title="Approval Gates" icon={Shield} count={issues.pendingApprovals.length} color="text-blue-600" bg="bg-blue-50" />
                    {issues.pendingApprovals.length === 0 ? (
                        <p className="text-sm text-gray-400 text-center py-4">No pending approvals.</p>
                    ) : (
                        issues.pendingApprovals.map((task: any) => <TaskCard key={task._id} task={task} type="approval" />)
                    )}
                </div>
            </div>
        </div>
    );
}
