import dbConnect from '@/lib/db';
import Task from '@/lib/models/Task';
import { CheckCircle, XCircle, Clock } from 'lucide-react';

export const dynamic = 'force-dynamic';

async function getApprovals() {
    await dbConnect();

    // Approvals are tasks in 'In Review' status
    // In a real system, you might have a dedicated Approval model or more complex state
    const approvals = await Task.find({ status: 'In Review' })
        .populate('assignee', 'name email')
        .populate('project', 'title')
        .sort({ updatedAt: -1 })
        .lean();

    return approvals;
}

export default async function ApprovalsPage() {
    const approvals = await getApprovals();

    return (
        <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg border shadow-sm">
                <h1 className="text-2xl font-bold text-gray-900">Pending Approvals</h1>
                <p className="text-gray-500">Review and approve completed tasks and milestone sign-offs.</p>
            </div>

            <div className="bg-white border rounded-lg shadow-sm overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Task</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Project</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Submitted By</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Submitted At</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {approvals.map((task: any) => (
                            <tr key={task._id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className="text-sm font-medium text-gray-900">{task.title}</span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {task.project?.title}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center">
                                        <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-600 mr-3">
                                            {task.assignee?.name?.charAt(0) || 'U'}
                                        </div>
                                        <div className="text-sm font-medium text-gray-900">{task.assignee?.name}</div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {new Date(task.updatedAt).toLocaleDateString()}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <div className="flex justify-end space-x-2">
                                        <button className="text-green-600 hover:text-green-900 bg-green-50 p-1.5 rounded-md">
                                            <CheckCircle className="w-5 h-5" />
                                        </button>
                                        <button className="text-red-600 hover:text-red-900 bg-red-50 p-1.5 rounded-md">
                                            <XCircle className="w-5 h-5" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {approvals.length === 0 && (
                            <tr>
                                <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                                    <div className="flex flex-col items-center justify-center">
                                        <Clock className="w-12 h-12 text-gray-300 mb-3" />
                                        <p>No pending approvals.</p>
                                    </div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
