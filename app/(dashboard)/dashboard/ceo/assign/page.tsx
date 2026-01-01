import dbConnect from '@/lib/db';
import User from '@/lib/models/User';
import Task from '@/lib/models/Task';
import { redirect } from 'next/navigation';
import { Send, AlertCircle } from 'lucide-react';

export const dynamic = 'force-dynamic';

async function createDirective(formData: FormData) {
    "use server";
    await dbConnect();

    const title = formData.get('title');
    const description = formData.get('description');
    const priority = formData.get('priority');
    const assigneeId = formData.get('assignee');
    const dueDate = formData.get('dueDate');

    if (!title || !assigneeId) return;

    await Task.create({
        title,
        description,
        priority,
        assignee: assigneeId,
        status: 'To Do',
        isProvisional: false,
        dueDate: dueDate ? new Date(dueDate as string) : undefined
        // project is undefined for direct directives
    });

    redirect('/dashboard/ceo');
}

export default async function CEOAssignPage() {
    await dbConnect();

    // Fetch Operations Managers to assign to
    const opsManagers = await User.find({
        role: { $in: ['Ops', 'Operations Manager'] }
    }).select('name _id').lean();

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <div className="bg-white p-6 rounded-lg border shadow-sm">
                <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                    <Send className="w-6 h-6 text-blue-600 mr-2" />
                    Issue Strategic Directive
                </h1>
                <p className="text-gray-500">Create a high-priority task directly for Operations Leadership.</p>
            </div>

            <form action={createDirective} className="bg-white p-8 rounded-xl shadow-sm border border-gray-200 space-y-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Directive Title</label>
                    <input
                        type="text"
                        name="title"
                        required
                        placeholder="e.g., Q3 Cost Reduction Initiative"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Details & Context</label>
                    <textarea
                        name="description"
                        rows={4}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Provide strategic context..."
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Assign To (Ops Lead)</label>
                        <select
                            name="assignee"
                            required
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                            {opsManagers.map((user: any) => (
                                <option key={user._id.toString()} value={user._id.toString()}>{user.name}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Priority Level</label>
                        <select
                            name="priority"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                            <option value="High">High</option>
                            <option value="Critical">Critical</option>
                            <option value="Medium">Medium</option>
                        </select>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
                    <input
                        type="date"
                        name="dueDate"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                </div>

                <div className="pt-4 flex items-center justify-end space-x-4">
                    <button type="button" className="text-gray-600 hover:text-gray-900 font-medium">Cancel</button>
                    <button
                        type="submit"
                        className="px-6 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
                    >
                        Issue Directive
                    </button>
                </div>
            </form>
        </div>
    );
}
