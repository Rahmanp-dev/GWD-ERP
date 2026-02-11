import dbConnect from '@/lib/db';
import Project from '@/lib/models/Project';
import Invoice from '@/lib/models/Invoice';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { FileText, DollarSign, Search } from 'lucide-react';

export const dynamic = 'force-dynamic';

async function createInvoice(formData: FormData) {
    "use server";
    await dbConnect();
    const session = await auth();

    const projectId = formData.get('projectId') as string;
    const clientName = formData.get('clientName') as string;
    const description = formData.get('description') as string;
    const amount = Number(formData.get('amount'));
    const dueDate = formData.get('dueDate') as string;

    if (!projectId || !clientName || !session?.user?.id) return;

    await Invoice.create({
        client: { name: clientName },
        project: projectId, // Strictly linked to Project
        items: [{
            description: description || 'Project Services',
            quantity: 1,
            unitPrice: amount,
            total: amount
        }],
        subtotal: amount,
        total: amount,
        dueDate: dueDate ? new Date(dueDate as string) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // Default 30 days
        createdBy: session.user.id,
        status: 'Draft'
    } as any);

    redirect('/finance/invoices');
}

export default async function InvoiceFromProjectPage({ searchParams }: { searchParams: Promise<{ projectId?: string }> }) {
    await dbConnect();
    const params = await searchParams;
    const { projectId } = params;

    const projects = await Project.find({ status: { $ne: 'Cancelled' } }).select('title client budget _id linkedDealId').lean();

    let selectedProject = null;
    if (projectId) {
        selectedProject = projects.find((p: any) => p._id.toString() === projectId);
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="bg-white p-6 rounded-lg border shadow-sm">
                <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                    <FileText className="w-6 h-6 text-blue-600 mr-2" />
                    Generated Invoice
                </h1>
                <p className="text-gray-500">Create a receivable linked to a delivered project.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Project Selector Sidebar */}
                <div className="md:col-span-1 bg-gray-50 p-4 rounded-xl border border-gray-200 h-fit">
                    <h3 className="font-bold text-gray-700 mb-4 flex items-center">
                        <Search className="w-4 h-4 mr-2" />
                        Select Project
                    </h3>
                    <div className="space-y-2 max-h-[400px] overflow-y-auto">
                        {projects.map((proj: any) => (
                            <a
                                key={proj._id}
                                href={`/finance/invoices/new/from-project?projectId=${proj._id}`}
                                className={`block p-3 rounded-lg border transition-all ${projectId === proj._id.toString() ? 'bg-blue-100 border-blue-300 shadow-sm' : 'bg-white border-gray-200 hover:border-blue-300'}`}
                            >
                                <div className="text-sm font-semibold text-gray-900 truncate">{proj.title}</div>
                                <div className="text-xs text-gray-500">{proj.client}</div>
                            </a>
                        ))}
                    </div>
                </div>

                {/* Form Area */}
                <div className="md:col-span-2">
                    {selectedProject ? (
                        <form action={createInvoice} className="bg-white p-8 rounded-xl shadow-sm border border-gray-200 space-y-6">
                            <input type="hidden" name="projectId" value={selectedProject._id.toString()} />

                            <div className="p-4 bg-blue-50 text-blue-800 rounded-lg text-sm mb-6">
                                Invoice for Project: <strong>{selectedProject.title}</strong>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Client Name</label>
                                    <input
                                        type="text"
                                        name="clientName"
                                        required
                                        defaultValue={selectedProject.client}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
                                    <input
                                        type="date"
                                        name="dueDate"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Description / Line Item</label>
                                <input
                                    type="text"
                                    name="description"
                                    defaultValue={`Professional Services for ${selectedProject.title}`}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Amount (INR)</label>
                                <div className="relative">
                                    <span className="absolute left-3 top-2 text-gray-500">₹</span>
                                    <input
                                        type="number"
                                        name="amount"
                                        required
                                        defaultValue={selectedProject.budget?.estimated || 0}
                                        className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-lg"
                                    />
                                </div>
                            </div>

                            <div className="pt-4 flex items-center justify-end space-x-4">
                                <button type="button" className="text-gray-600 hover:text-gray-900 font-medium">Cancel</button>
                                <button
                                    type="submit"
                                    className="px-6 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-colors shadow-sm flex items-center"
                                >
                                    <DollarSign className="w-4 h-4 mr-2" />
                                    Generate Draft Invoice
                                </button>
                            </div>
                        </form>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center p-8 text-center text-gray-400 bg-white rounded-xl border border-dashed border-gray-300">
                            <Search className="w-12 h-12 mb-4 opacity-50" />
                            <p>Select a project from the left to generate an invoice.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
