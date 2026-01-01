"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import {
    Calendar,
    Clock,
    CheckCircle,
    XCircle,
    Plus,
    AlertCircle
} from "lucide-react";

export default function LeavePage() {
    const { data: session } = useSession();
    const [leaves, setLeaves] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        leaveType: 'Casual',
        startDate: '',
        endDate: '',
        reason: ''
    });
    const [submitting, setSubmitting] = useState(false);
    const [message, setMessage] = useState('');

    const userRole = session?.user?.role?.toLowerCase() || "";
    const canApprove = ['ceo', 'hr manager', 'admin'].includes(userRole);

    useEffect(() => {
        fetchLeaves();
    }, []);

    const fetchLeaves = async () => {
        try {
            const res = await fetch("/api/hr/leave");
            const data = await res.json();
            setLeaves(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        setMessage('');

        try {
            const res = await fetch("/api/hr/leave", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData)
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error);

            setMessage('Leave request submitted successfully!');
            setShowForm(false);
            setFormData({ leaveType: 'Casual', startDate: '', endDate: '', reason: '' });
            fetchLeaves();
        } catch (error: any) {
            setMessage(`Error: ${error.message}`);
        } finally {
            setSubmitting(false);
        }
    };

    const handleAction = async (id: string, action: string) => {
        try {
            const res = await fetch("/api/hr/leave", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id, action })
            });

            if (!res.ok) throw new Error("Failed to update");
            fetchLeaves();
        } catch (error: any) {
            console.error(error);
        }
    };

    const pendingCount = leaves.filter(l => l.status === 'Pending').length;
    const approvedCount = leaves.filter(l => l.status === 'Approved').length;

    if (loading) return <div className="p-8 text-center text-gray-500">Loading...</div>;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Leave Management</h1>
                    <p className="text-sm text-gray-500">Request and manage leave</p>
                </div>
                <button
                    onClick={() => setShowForm(!showForm)}
                    className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                    <Plus className="w-4 h-4 mr-2" />
                    Request Leave
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white p-5 rounded-xl shadow-sm border">
                    <div className="flex items-center">
                        <Calendar className="w-8 h-8 text-blue-500 mr-3" />
                        <div>
                            <div className="text-sm text-gray-500">Total Requests</div>
                            <div className="text-2xl font-bold">{leaves.length}</div>
                        </div>
                    </div>
                </div>
                <div className="bg-white p-5 rounded-xl shadow-sm border">
                    <div className="flex items-center">
                        <Clock className="w-8 h-8 text-yellow-500 mr-3" />
                        <div>
                            <div className="text-sm text-gray-500">Pending</div>
                            <div className="text-2xl font-bold text-yellow-600">{pendingCount}</div>
                        </div>
                    </div>
                </div>
                <div className="bg-white p-5 rounded-xl shadow-sm border">
                    <div className="flex items-center">
                        <CheckCircle className="w-8 h-8 text-green-500 mr-3" />
                        <div>
                            <div className="text-sm text-gray-500">Approved</div>
                            <div className="text-2xl font-bold text-green-600">{approvedCount}</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Message */}
            {message && (
                <div className={`p-4 rounded-lg ${message.startsWith('Error') ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
                    {message}
                </div>
            )}

            {/* Request Form */}
            {showForm && (
                <div className="bg-white rounded-xl shadow-sm border p-6">
                    <h3 className="font-semibold text-gray-800 mb-4">New Leave Request</h3>
                    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Leave Type</label>
                            <select
                                value={formData.leaveType}
                                onChange={(e) => setFormData({ ...formData, leaveType: e.target.value })}
                                className="w-full border rounded-lg p-2"
                            >
                                <option value="Casual">Casual Leave</option>
                                <option value="Sick">Sick Leave</option>
                                <option value="Annual">Annual Leave</option>
                                <option value="Unpaid">Unpaid Leave</option>
                                <option value="Maternity">Maternity Leave</option>
                                <option value="Paternity">Paternity Leave</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>
                        <div></div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                            <input
                                type="date"
                                value={formData.startDate}
                                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                                required
                                className="w-full border rounded-lg p-2"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                            <input
                                type="date"
                                value={formData.endDate}
                                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                                required
                                className="w-full border rounded-lg p-2"
                            />
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Reason</label>
                            <textarea
                                value={formData.reason}
                                onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                                required
                                rows={3}
                                className="w-full border rounded-lg p-2"
                                placeholder="Please provide a reason for your leave request..."
                            />
                        </div>
                        <div className="md:col-span-2 flex justify-end space-x-3">
                            <button
                                type="button"
                                onClick={() => setShowForm(false)}
                                className="px-4 py-2 border rounded-lg hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={submitting}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                            >
                                {submitting ? 'Submitting...' : 'Submit Request'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Leave Requests Table */}
            <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            {canApprove && <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Employee</th>}
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Dates</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Days</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {leaves.map((leave) => (
                            <tr key={leave._id} className="hover:bg-gray-50">
                                {canApprove && (
                                    <td className="px-6 py-4 text-sm">
                                        <div className="font-medium text-gray-900">{leave.employee?.name}</div>
                                        <div className="text-xs text-gray-500">{leave.employee?.department}</div>
                                    </td>
                                )}
                                <td className="px-6 py-4 text-sm text-gray-900">{leave.leaveType}</td>
                                <td className="px-6 py-4 text-sm text-gray-500">
                                    {new Date(leave.startDate).toLocaleDateString()} - {new Date(leave.endDate).toLocaleDateString()}
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-900">{leave.days}</td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-1 text-xs rounded-full ${leave.status === 'Approved' ? 'bg-green-100 text-green-700' :
                                            leave.status === 'Rejected' ? 'bg-red-100 text-red-700' :
                                                leave.status === 'Cancelled' ? 'bg-gray-100 text-gray-700' :
                                                    'bg-yellow-100 text-yellow-700'
                                        }`}>
                                        {leave.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-sm">
                                    {leave.status === 'Pending' && canApprove && (
                                        <div className="flex space-x-2">
                                            <button
                                                onClick={() => handleAction(leave._id, 'approve')}
                                                className="text-green-600 hover:text-green-800"
                                                title="Approve"
                                            >
                                                <CheckCircle className="w-5 h-5" />
                                            </button>
                                            <button
                                                onClick={() => handleAction(leave._id, 'reject')}
                                                className="text-red-600 hover:text-red-800"
                                                title="Reject"
                                            >
                                                <XCircle className="w-5 h-5" />
                                            </button>
                                        </div>
                                    )}
                                    {leave.status === 'Pending' && !canApprove && (
                                        <button
                                            onClick={() => handleAction(leave._id, 'cancel')}
                                            className="text-gray-600 hover:text-gray-800 text-sm"
                                        >
                                            Cancel
                                        </button>
                                    )}
                                    {leave.status !== 'Pending' && (
                                        <span className="text-gray-400 text-sm">
                                            {leave.approvedBy?.name && `By ${leave.approvedBy.name}`}
                                        </span>
                                    )}
                                </td>
                            </tr>
                        ))}
                        {leaves.length === 0 && (
                            <tr>
                                <td colSpan={canApprove ? 6 : 5} className="px-6 py-8 text-center text-gray-500">
                                    No leave requests found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
