"use client";

import { useState, useTransition } from "react";
import { createCandidate, updateCandidateStatus, deleteCandidate, hireCandidate } from "@/lib/actions/hr";
import { Plus, MoreHorizontal, Mail, Phone, Calendar, CheckCircle, XCircle, Trash2, UserPlus } from "lucide-react";

const COLUMNS = [
    { id: 'New', label: 'New Applied', color: 'bg-gray-100' },
    { id: 'Screening', label: 'Screening', color: 'bg-blue-50' },
    { id: 'Interview', label: 'Interview', color: 'bg-yellow-50' },
    { id: 'Offer', label: 'Offer Sent', color: 'bg-purple-50' },
    { id: 'Hired', label: 'Hired', color: 'bg-green-50' },
    { id: 'Rejected', label: 'Rejected', color: 'bg-red-50' }
];

export default function RecruitmentBoard({ initialCandidates }: { initialCandidates: any[] }) {
    const [candidates, setCandidates] = useState(initialCandidates);
    const [isPending, startTransition] = useTransition();
    const [showAddModal, setShowAddModal] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        name: '', email: '', roleApplied: '', phone: ''
    });

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        startTransition(async () => {
            await createCandidate(formData);
            setShowAddModal(false);
            setFormData({ name: '', email: '', roleApplied: '', phone: '' });
            window.location.reload();
        });
    };

    const handleHire = async (candidateId: string, currentEmail: string) => {
        const confirmHire = confirm(`Ready to hire this candidate? \nThis will create a User account for ${currentEmail} and add them to the Employee Directory.`);
        if (!confirmHire) return;

        startTransition(async () => {
            const email = prompt("Enter company email for new employee:", currentEmail) || currentEmail;
            await hireCandidate(candidateId, email);
            window.location.reload();
        });
    };

    const handleMove = (id: string, newStatus: string) => {
        startTransition(async () => {
            // Optimistic Update
            setCandidates(prev => prev.map(c => c._id === id ? { ...c, status: newStatus } : c));
            await updateCandidateStatus(id, newStatus);
        });
    };

    const handleDelete = (id: string) => {
        if (!confirm("Delete this candidate?")) return;
        startTransition(async () => {
            setCandidates(prev => prev.filter(c => c._id !== id));
            await deleteCandidate(id);
        });
    }

    return (
        <>
            <div className="flex justify-end mb-4">
                <button
                    onClick={() => setShowAddModal(true)}
                    className="flex items-center bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700"
                >
                    <Plus className="w-4 h-4 mr-2" /> Add Candidate
                </button>
            </div>

            <div className="flex-1 overflow-x-auto overflow-y-hidden whitespace-nowrap pb-4">
                <div className="flex space-x-4 h-full">
                    {COLUMNS.map(col => (
                        <div key={col.id} className={`w-80 flex-shrink-0 flex flex-col rounded-lg border ${col.color} h-full`}>
                            <div className="p-3 border-b border-gray-200/50 flex justify-between items-center bg-white/50 backdrop-blur-sm rounded-t-lg">
                                <h3 className="font-semibold text-gray-700 text-sm">{col.label}</h3>
                                <span className="text-xs bg-white px-2 py-0.5 rounded-full border text-gray-500">
                                    {candidates.filter(c => c.status === col.id).length}
                                </span>
                            </div>

                            <div className="p-3 space-y-3 overflow-y-auto flex-1 custom-scrollbar">
                                {candidates
                                    .filter(c => c.status === col.id)
                                    .map(candidate => (
                                        <div key={candidate._id} className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow group whitespace-normal">
                                            <div className="flex justify-between items-start mb-2">
                                                <h4 className="font-bold text-gray-900 leading-tight">{candidate.name}</h4>
                                                <button onClick={() => handleDelete(candidate._id)} className="text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100">
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                            <p className="text-blue-600 text-xs font-medium mb-3">{candidate.roleApplied}</p>

                                            <div className="space-y-1 mb-4">
                                                <div className="flex items-center text-xs text-gray-500">
                                                    <Mail className="w-3 h-3 mr-2" /> {candidate.email}
                                                </div>
                                                {candidate.phone && (
                                                    <div className="flex items-center text-xs text-gray-500">
                                                        <Phone className="w-3 h-3 mr-2" /> {candidate.phone}
                                                    </div>
                                                )}
                                            </div>

                                            {/* Actions */}
                                            <div className="pt-3 border-t flex justify-between items-center">
                                                <select
                                                    className="text-xs border rounded p-1 bg-gray-50 outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
                                                    value={candidate.status}
                                                    onChange={(e) => handleMove(candidate._id, e.target.value)}
                                                >
                                                    {COLUMNS.map(c => (
                                                        <option key={c.id} value={c.id}>{c.label}</option>
                                                    ))}
                                                </select>

                                                {(candidate.status === 'Offer' || candidate.status === 'Interview') && (
                                                    <button
                                                        onClick={() => handleHire(candidate._id, candidate.email)}
                                                        className="text-xs bg-green-600 text-white px-2 py-1 rounded hover:bg-green-700 flex items-center"
                                                        title="Hire & Create Account"
                                                    >
                                                        <UserPlus className="w-3 h-3 mr-1" /> Hire
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Add Modal */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-xl">
                        <h3 className="text-lg font-bold mb-4">Add New Candidate</h3>
                        <form onSubmit={handleCreate} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                                <input required type="text" className="w-full border rounded-md p-2 text-sm"
                                    value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                <input required type="email" className="w-full border rounded-md p-2 text-sm"
                                    value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Role Applying For</label>
                                <input required type="text" className="w-full border rounded-md p-2 text-sm" placeholder="e.g. Sales Executive"
                                    value={formData.roleApplied} onChange={e => setFormData({ ...formData, roleApplied: e.target.value })} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Phone (Optional)</label>
                                <input type="text" className="w-full border rounded-md p-2 text-sm"
                                    value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} />
                            </div>
                            <div className="flex justify-end space-x-3 pt-4">
                                <button type="button" onClick={() => setShowAddModal(false)} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-md">Cancel</button>
                                <button type="submit" disabled={isPending} className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700">
                                    {isPending ? 'Saving...' : 'Add Candidate'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}
