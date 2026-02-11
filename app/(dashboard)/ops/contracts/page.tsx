"use client";

import { useState, useEffect } from 'react';
import { getContracts, createContract, getContractFormData, generateAndSendContract } from '@/lib/actions/contract';
import { Plus, FileText, CheckCircle, Send, MoreHorizontal, Download } from 'lucide-react';
import { format } from 'date-fns';

export default function ContractsPage() {
    const [contracts, setContracts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [formData, setFormData] = useState<any>(null); // To store projects/freelancers lists

    const [newContract, setNewContract] = useState({
        title: '',
        projectId: '',
        freelancerId: '',
        startDate: '',
        endDate: '',
        paymentType: 'Fixed',
        amount: '',
        scopeOfWork: '',
        currency: 'USD'
    });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const [contractsData, formDataRes] = await Promise.all([
                getContracts(),
                getContractFormData()
            ]);
            setContracts(contractsData);
            setFormData(formDataRes);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async (e: any) => {
        e.preventDefault();
        if (!confirm("Create this contract?")) return;

        try {
            await createContract({
                ...newContract,
                amount: parseFloat(newContract.amount)
            });
            setIsCreateOpen(false);
            loadData(); // Refresh
            alert("Contract Draft Created!");
        } catch (error) {
            alert("Error creating contract");
        }
    };

    const handleSend = async (id: string) => {
        if (!confirm("Generate PDF and mark as Sent?")) return;
        try {
            await generateAndSendContract(id);
            loadData();
            alert("Contract Generated & Sent!");
        } catch (e) {
            alert("Error sending contract");
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Contract Engine</h1>
                    <p className="text-gray-500">Manage legal agreements and payouts.</p>
                </div>
                <button
                    onClick={() => setIsCreateOpen(true)}
                    className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                    <Plus className="w-4 h-4 mr-2" />
                    New Contract
                </button>
            </div>

            {/* List */}
            <div className="bg-white shadow-sm rounded-lg border overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contract</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Freelancer</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Project</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {contracts.map((c) => (
                            <tr key={c._id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center">
                                        <FileText className="w-5 h-5 text-gray-400 mr-3" />
                                        <div>
                                            <div className="text-sm font-medium text-gray-900">{c.title}</div>
                                            <div className="text-xs text-gray-500">{c.contractNumber}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-900">{c.freelancer?.name}</div>
                                    <div className="text-xs text-gray-500">{c.freelancer?.email}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                        {c.project?.title}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <StatusBadge status={c.status} />
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {new Intl.NumberFormat('en-US', { style: 'currency', currency: c.currency }).format(c.amount)}
                                    <span className="text-xs ml-1">({c.paymentType})</span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    {c.status === 'Draft' && (
                                        <button onClick={() => handleSend(c._id)} className="text-blue-600 hover:text-blue-900 flex items-center justify-end w-full">
                                            <Send className="w-4 h-4 mr-1" /> Generate & Send
                                        </button>
                                    )}
                                    {c.status === 'Sent' && (
                                        <span className="text-gray-400 text-xs italic">Awaiting Signature</span>
                                    )}
                                    {c.status === 'Signed' && (
                                        <span className="text-green-600 text-xs flex items-center justify-end">
                                            <CheckCircle className="w-4 h-4 mr-1" /> Active
                                        </span>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {contracts.length === 0 && !loading && (
                    <div className="p-12 text-center text-gray-500">No contracts found. Create one to get started.</div>
                )}
            </div>

            {/* Create Modal */}
            {isCreateOpen && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center">
                    <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-2xl">
                        <h2 className="text-xl font-bold mb-6">Draft New Contract</h2>
                        <form onSubmit={handleCreate} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Title</label>
                                    <input required type="text" className="mt-1 block w-full border rounded-md p-2"
                                        value={newContract.title} onChange={e => setNewContract({ ...newContract, title: e.target.value })}
                                        placeholder="e.g. Frontend Development Phase 1"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Project</label>
                                    <select required className="mt-1 block w-full border rounded-md p-2"
                                        value={newContract.projectId} onChange={e => setNewContract({ ...newContract, projectId: e.target.value })}
                                    >
                                        <option value="">Select Project...</option>
                                        {formData?.projects?.map((p: any) => (
                                            <option key={p._id} value={p._id}>{p.title}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Freelancer</label>
                                    <select required className="mt-1 block w-full border rounded-md p-2"
                                        value={newContract.freelancerId} onChange={e => setNewContract({ ...newContract, freelancerId: e.target.value })}
                                    >
                                        <option value="">Select Freelancer...</option>
                                        {formData?.freelancers?.map((f: any) => (
                                            <option key={f._id} value={f._id}>{f.name} ({f.domain})</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Payment Type</label>
                                    <select className="mt-1 block w-full border rounded-md p-2"
                                        value={newContract.paymentType} onChange={e => setNewContract({ ...newContract, paymentType: e.target.value })}
                                    >
                                        <option value="Fixed">Fixed Price</option>
                                        <option value="Milestone">Milestone Based</option>
                                        <option value="Hourly">Hourly Rate</option>
                                        <option value="Monthly">Monthly Retainer</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Start Date</label>
                                    <input required type="date" className="mt-1 block w-full border rounded-md p-2"
                                        value={newContract.startDate} onChange={e => setNewContract({ ...newContract, startDate: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">End Date (Optional)</label>
                                    <input type="date" className="mt-1 block w-full border rounded-md p-2"
                                        value={newContract.endDate} onChange={e => setNewContract({ ...newContract, endDate: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Amount ({newContract.currency})</label>
                                    <input required type="number" className="mt-1 block w-full border rounded-md p-2"
                                        value={newContract.amount} onChange={e => setNewContract({ ...newContract, amount: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Scope of Work</label>
                                <textarea required className="mt-1 block w-full border rounded-md p-2 h-24"
                                    value={newContract.scopeOfWork} onChange={e => setNewContract({ ...newContract, scopeOfWork: e.target.value })}
                                    placeholder="Describe the services to be performed..."
                                />
                            </div>

                            <div className="flex justify-end space-x-3 pt-4">
                                <button type="button" onClick={() => setIsCreateOpen(false)} className="px-4 py-2 border rounded-md text-gray-700 hover:bg-gray-50">Cancel</button>
                                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">Draft Contract</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

function StatusBadge({ status }: { status: string }) {
    const colors: any = {
        Draft: 'bg-gray-100 text-gray-800',
        Sent: 'bg-yellow-100 text-yellow-800',
        Signed: 'bg-green-100 text-green-800',
        Active: 'bg-blue-100 text-blue-800',
        Completed: 'bg-purple-100 text-purple-800',
        Terminated: 'bg-red-100 text-red-800'
    };
    return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colors[status] || 'bg-gray-100'}`}>
            {status}
        </span>
    );
}
