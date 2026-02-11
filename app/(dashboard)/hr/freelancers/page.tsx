"use client";

import { useState, useEffect } from 'react';
import { getFreelancers, updateFreelancerStatus, createFreelancerAccount } from '@/lib/actions/freelancer';
import { Search, UserCheck, UserX, ExternalLink, Filter, Plus, Key } from 'lucide-react';
import Link from 'next/link';

export default function FreelancerVettingPage() {
    const [freelancers, setFreelancers] = useState<any[]>([]);
    const [filter, setFilter] = useState('Applied');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadFreelancers();
    }, [filter]);

    const loadFreelancers = async () => {
        setLoading(true);
        try {
            const data = await getFreelancers(filter as any);
            setFreelancers(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (id: string, newStatus: string) => {
        if (!confirm(`Are you sure you want to mark this freelancer as ${newStatus}?`)) return;
        await updateFreelancerStatus(id, newStatus);
        loadFreelancers();
    };

    const handleGrantAccess = async (id: string, name: string) => {
        if (!confirm(`Create portal account for ${name}? This will grant them login access.`)) return;
        try {
            const res = await createFreelancerAccount(id);
            if (res.success) {
                alert(`Account created!\nEmail: ${res.email}\nPassword: ${res.password}`);
                loadFreelancers();
            }
        } catch (err: any) {
            alert(err.message);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Freelancer Vetting</h1>
                    <p className="text-gray-500">Review and approve applications.</p>
                </div>
                <Link href="/hr/freelancers/new" className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-sm">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Freelancer
                </Link>
            </div>

            {/* Filters */}
            <div className="bg-white p-4 rounded-lg shadow-sm border flex gap-4">
                {['Applied', 'Vetted', 'Approved', 'Rejected'].map((status) => (
                    <button
                        key={status}
                        onClick={() => setFilter(status)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium ${filter === status
                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                            : 'text-gray-600 hover:bg-gray-50'
                            }`}
                    >
                        {status}
                    </button>
                ))}
            </div>

            {/* List */}
            {loading ? (
                <div className="text-center py-12 text-gray-500">Loading pipeline...</div>
            ) : (
                <div className="bg-white shadow-sm rounded-lg border overflow-hidden">
                    <ul className="divide-y divide-gray-200">
                        {freelancers.map((f) => (
                            <li key={f._id} className="p-6">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-start space-x-4">
                                        <div className="flex-shrink-0">
                                            <div className="h-12 w-12 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 text-lg font-bold">
                                                {f.name.charAt(0)}
                                            </div>
                                        </div>
                                        <div>
                                            <div className="flex items-center space-x-2">
                                                <h3 className="text-lg font-medium text-gray-900">{f.name}</h3>
                                                {f.user && (
                                                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800">
                                                        Portal Access Active
                                                    </span>
                                                )}
                                            </div>
                                            <div className="flex items-center space-x-2 text-sm text-gray-500 mt-1">
                                                <span className="px-2 py-0.5 rounded bg-gray-100 text-gray-600">{f.domain}</span>
                                                <span>•</span>
                                                <span>{f.experienceLevel}</span>
                                                <span>•</span>
                                                <span>${f.rates?.hourly}/hr</span>
                                            </div>
                                            <div className="mt-2 flex space-x-4 text-sm">
                                                {f.linkedinUrl && (
                                                    <a href={f.linkedinUrl} target="_blank" rel="noreferrer" className="flex items-center text-blue-600 hover:underline">
                                                        <ExternalLink className="w-3 h-3 mr-1" /> LinkedIn
                                                    </a>
                                                )}
                                                {f.portfolioUrl && (
                                                    <a href={f.portfolioUrl} target="_blank" rel="noreferrer" className="flex items-center text-blue-600 hover:underline">
                                                        <ExternalLink className="w-3 h-3 mr-1" /> Portfolio
                                                    </a>
                                                )}
                                            </div>
                                            {f.skills.length > 0 && (
                                                <div className="mt-2 flex flex-wrap gap-2">
                                                    {f.skills.map((skill: string) => (
                                                        <span key={skill} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-50 text-blue-700">
                                                            {skill}
                                                        </span>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex space-x-3">
                                        {/* Action Buttons */}
                                        {f.status === 'Applied' && (
                                            <>
                                                <button
                                                    onClick={() => handleStatusUpdate(f._id, 'Rejected')}
                                                    className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                                                >
                                                    <UserX className="w-4 h-4 mr-2 text-red-500" />
                                                    Reject
                                                </button>
                                                <button
                                                    onClick={() => handleStatusUpdate(f._id, 'Vetted')}
                                                    className="inline-flex items-center px-3 py-2 border border-transparent shadow-sm text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                                                >
                                                    <UserCheck className="w-4 h-4 mr-2" />
                                                    Vet & Interview
                                                </button>
                                            </>
                                        )}
                                        {f.status === 'Vetted' && (
                                            <button
                                                onClick={() => handleStatusUpdate(f._id, 'Approved')}
                                                className="inline-flex items-center px-3 py-2 border border-transparent shadow-sm text-sm leading-4 font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
                                            >
                                                <UserCheck className="w-4 h-4 mr-2" />
                                                Approve for Work
                                            </button>
                                        )}
                                        {f.status === 'Approved' && !f.user && (
                                            <button
                                                onClick={() => handleGrantAccess(f._id, f.name)}
                                                className="inline-flex items-center px-3 py-2 border border-gray-200 shadow-sm text-sm leading-4 font-medium rounded-md text-purple-700 bg-white hover:bg-purple-50"
                                            >
                                                <Key className="w-4 h-4 mr-2" />
                                                Grant Access
                                            </button>
                                        )}
                                        {f.status === 'Approved' && f.user && (
                                            <span className="inline-flex items-center px-3 py-2 rounded-md text-sm font-medium bg-green-100 text-green-800">
                                                Ready to Assign
                                            </span>
                                        )}
                                        {f.status === 'Rejected' && (
                                            <span className="inline-flex items-center px-3 py-2 rounded-md text-sm font-medium bg-red-100 text-red-800">
                                                Rejected
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}
