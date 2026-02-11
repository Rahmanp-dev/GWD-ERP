import dbConnect from '@/lib/db';
import Lead from '@/lib/models/Lead';
import Project from '@/lib/models/Project';
import { redirect } from 'next/navigation';
import { Briefcase, ArrowRight, CheckCircle } from 'lucide-react';

export const dynamic = 'force-dynamic';

async function convertToProject(formData: FormData) {
    "use server";
    await dbConnect();

    const leadId = formData.get('leadId');
    const title = formData.get('title');
    const client = formData.get('client');
    const budget = formData.get('budget');
    const description = formData.get('description');
    const startDate = formData.get('startDate');

    if (!leadId || !title) return;

    // 1. Create the Project
    const generatedSlug = title.toString()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '') + '-' + Math.floor(Math.random() * 10000);

    const newProject = await Project.create({
        title,
        client,
        description,
        slug: generatedSlug,
        status: 'Planning',
        health: 'Green',
        budget: {
            estimated: Number(budget || 0),
            currency: 'USD'
        },
        startDate: startDate ? new Date(startDate as string) : undefined,
        linkedDealId: leadId
    });

    // 2. Update the Lead/Deal Status
    await Lead.findByIdAndUpdate(leadId, {
        status: 'Closed Won',
        handoverStatus: 'In Progress',
        probability: 100
    });

    // 3. Redirect to the new Project
    redirect('/operations/projects');
}

export default async function ConvertDealPage({ params }: { params: Promise<{ id: string }> }) {
    await dbConnect();
    const { id } = await params;

    const deal = await Lead.findById(id).lean();

    if (!deal) {
        return <div className="p-8">Deal not found</div>;
    }

    return (
        <div className="max-w-3xl mx-auto space-y-6">
            <div className="bg-white p-6 rounded-lg border shadow-sm border-l-4 border-l-green-500">
                <div className="flex justify-between items-start">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                            <CheckCircle className="w-6 h-6 text-green-600 mr-2" />
                            Win & Handover
                        </h1>
                        <p className="text-gray-500 mt-1">
                            Converting Deal: <span className="font-semibold text-gray-900">{deal.title}</span>
                        </p>
                    </div>
                    <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-bold">
                        {deal.value?.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
                    </div>
                </div>
                <p className="mt-4 text-sm text-gray-600">
                    This action will mark the deal as <strong>Closed Won</strong> and create a new <strong>Project Charter</strong> for the Operations team.
                </p>
            </div>

            <form action={convertToProject} className="bg-white p-8 rounded-xl shadow-sm border border-gray-200 space-y-6">
                <input type="hidden" name="leadId" value={id} />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Project Title</label>
                        <input
                            type="text"
                            name="title"
                            required
                            defaultValue={deal.title}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Client Name</label>
                        <input
                            type="text"
                            name="client"
                            required
                            defaultValue={deal.accountName || deal.contactPerson}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Approved Budget (USD)</label>
                        <input
                            type="number"
                            name="budget"
                            defaultValue={deal.value}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Target Start Date</label>
                        <input
                            type="date"
                            name="startDate"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50 bg-opacity-50"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Handover Notes / Objectives</label>
                    <textarea
                        name="description"
                        rows={4}
                        defaultValue={`Handover from Sales.\nSource: ${deal.source}\nNotes: ${deal.notes?.map((n: any) => n.content).join(' ')}`}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                </div>

                <div className="pt-4 flex items-center justify-end space-x-4">
                    <button type="button" className="text-gray-600 hover:text-gray-900 font-medium">Cancel</button>
                    <button
                        type="submit"
                        className="px-6 py-2 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 transition-colors shadow-sm flex items-center"
                    >
                        Confirm Win & Create Project <ArrowRight className="w-4 h-4 ml-2" />
                    </button>
                </div>
            </form>
        </div>
    );
}
