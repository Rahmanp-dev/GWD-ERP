import dbConnect from '@/lib/db';
import User from '@/lib/models/User';
import Project from '@/lib/models/Project';
import { redirect } from 'next/navigation';
import { Briefcase, ArrowRight } from 'lucide-react';

export const dynamic = 'force-dynamic';

async function createProject(formData: FormData) {
    "use server";
    await dbConnect();

    const title = formData.get('title');
    const description = formData.get('description');
    const managerId = formData.get('manager');
    const budget = formData.get('budget');
    const client = formData.get('client');
    const startDate = formData.get('startDate');

    if (!title || !managerId) return;

    const generatedSlug = title.toString()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '') + '-' + Math.floor(Math.random() * 10000);

    await Project.create({
        title,
        description,
        slug: generatedSlug,
        manager: managerId,
        client,
        status: 'Planning',
        budget: {
            estimated: Number(budget || 0),
            currency: 'USD'
        },
        startDate: startDate ? new Date(startDate as string) : undefined
    });

    redirect('/operations/projects');
}

export default async function NewProjectPage() {
    await dbConnect();

    // Fetch Project Managers to assign to
    const pms = await User.find({
        role: { $in: ['Project Manager', 'PM'] }
    }).select('name _id').lean();

    return (
        <div className="max-w-3xl mx-auto space-y-6">
            <div className="bg-white p-6 rounded-lg border shadow-sm">
                <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                    <Briefcase className="w-6 h-6 text-blue-600 mr-2" />
                    Project Charter
                </h1>
                <p className="text-gray-500">Initiate a new project and assign a Project Manager (Delivery Owner).</p>
            </div>

            <form action={createProject} className="bg-white p-8 rounded-xl shadow-sm border border-gray-200 space-y-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Project Title</label>
                    <input
                        type="text"
                        name="title"
                        required
                        placeholder="e.g., GWD ERP Implementation Phase 2"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Client / Account</label>
                    <input
                        type="text"
                        name="client"
                        placeholder="e.g., Acme Corp"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Scope & Objectives</label>
                    <textarea
                        name="description"
                        rows={4}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Define the project boundaries and goals..."
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Assign Project Manager</label>
                        <select
                            name="manager"
                            required
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                            <option value="">Select a PM...</option>
                            {pms.map((user: any) => (
                                <option key={user._id.toString()} value={user._id.toString()}>{user.name}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Estimated Budget (USD)</label>
                        <input
                            type="number"
                            name="budget"
                            placeholder="0.00"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Target Start Date</label>
                    <input
                        type="date"
                        name="startDate"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                </div>

                <div className="pt-4 flex items-center justify-end space-x-4">
                    <button type="button" className="text-gray-600 hover:text-gray-900 font-medium">Cancel</button>
                    <button
                        type="submit"
                        className="px-6 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-colors shadow-sm flex items-center"
                    >
                        Launch Project <ArrowRight className="w-4 h-4 ml-2" />
                    </button>
                </div>
            </form>
        </div>
    );
}
