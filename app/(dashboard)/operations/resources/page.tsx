import dbConnect from '@/lib/db';
import Task from '@/lib/models/Task';
import { Users, Clock, AlertTriangle } from 'lucide-react';

export const dynamic = 'force-dynamic';

async function getResourceStats() {
    await dbConnect();

    // Fetch active tasks with assignee
    const tasks = await Task.find({
        status: { $in: ['To Do', 'In Progress', 'In Review'] },
        assignee: { $exists: true, $ne: null }
    })
        .populate('assignee', 'name email avatar')
        .lean();

    const resourceMap: Record<string, any> = {};

    tasks.forEach((task: any) => {
        if (!task.assignee?._id) return;

        const userId = task.assignee._id.toString();

        if (!resourceMap[userId]) {
            resourceMap[userId] = {
                user: task.assignee,
                assignedTasks: 0,
                estimatedHours: 0,
                tasksByStatus: { 'To Do': 0, 'In Progress': 0, 'In Review': 0 },
                overdueTasks: 0
            };
        }

        const stats = resourceMap[userId];
        stats.assignedTasks++;
        stats.estimatedHours += task.estimatedHours || 0;

        if (task.status) {
            stats.tasksByStatus[task.status] = (stats.tasksByStatus[task.status] || 0) + 1;
        }

        if (task.dueDate && new Date(task.dueDate) < new Date()) {
            stats.overdueTasks++;
        }
    });

    // Calculate utilization (Assuming 40h standard week capacity for simplicity)
    const STANDARD_CAPACITY = 40;

    return Object.values(resourceMap).map(stat => ({
        ...stat,
        utilization: Math.min(100, Math.round((stat.estimatedHours / STANDARD_CAPACITY) * 100)),
        isOverloaded: stat.estimatedHours > STANDARD_CAPACITY
    })).sort((a, b) => b.utilization - a.utilization);
}

export default async function ResourceLoadPage() {
    const resources = await getResourceStats();

    return (
        <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg border shadow-sm flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Resource Load & Capacity</h1>
                    <p className="text-gray-500">Monitor team utilization, identify bottlenecks, and prevent burnout.</p>
                </div>
                <div className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                    Capacity Basis: 40h / week
                </div>
            </div>

            <div className="grid grid-cols-1 gap-6">
                {resources.map((resource: any) => (
                    <div key={resource.user._id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">

                            {/* User Info */}
                            <div className="flex items-center space-x-4 w-full md:w-1/4">
                                <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-bold">
                                    {resource.user.name?.charAt(0) || 'U'}
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900">{resource.user.name}</h3>
                                    <p className="text-sm text-gray-500">{resource.user.email}</p>
                                </div>
                            </div>

                            {/* Load Bar */}
                            <div className="flex-1 w-full">
                                <div className="flex justify-between text-sm mb-2">
                                    <span className="text-gray-600 font-medium">Utilization ({resource.estimatedHours}h assigned)</span>
                                    <span className={`font-bold ${resource.isOverloaded ? 'text-red-600' : 'text-green-600'}`}>
                                        {resource.utilization}%
                                    </span>
                                </div>
                                <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full rounded-full ${resource.isOverloaded ? 'bg-red-500' : 'bg-blue-500'}`}
                                        style={{ width: `${resource.utilization}%` }}
                                    ></div>
                                </div>
                                {resource.isOverloaded && (
                                    <div className="mt-2 text-xs text-red-600 flex items-center">
                                        <AlertTriangle className="w-3 h-3 mr-1" /> Over Capacity
                                    </div>
                                )}
                            </div>

                            {/* Task Stats */}
                            <div className="flex space-x-6 text-sm text-gray-600 w-full md:w-auto shrink-0 justify-between md:justify-start">
                                <div className="text-center">
                                    <div className="font-bold text-lg text-gray-900">{resource.assignedTasks}</div>
                                    <div className="text-xs uppercase">Active</div>
                                </div>
                                <div className="text-center">
                                    <div className="font-bold text-lg text-orange-600">{resource.tasksByStatus['In Progress'] || 0}</div>
                                    <div className="text-xs uppercase">Working</div>
                                </div>
                                <div className="text-center">
                                    <div className="font-bold text-lg text-red-600">{resource.overdueTasks}</div>
                                    <div className="text-xs uppercase">Overdue</div>
                                </div>
                            </div>

                        </div>
                    </div>
                ))}

                {resources.length === 0 && (
                    <div className="text-center py-12 bg-white rounded-lg border border-dashed">
                        <p className="text-gray-500">No active resources found with assigned tasks.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
