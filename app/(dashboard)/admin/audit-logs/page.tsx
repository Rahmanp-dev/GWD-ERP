"use client";

import { useState, useEffect } from "react";
import {
    Search,
    Filter,
    User,
    FileText,
    Edit,
    Trash2,
    Plus,
    LogIn,
    LogOut,
    CheckCircle,
    AlertTriangle
} from "lucide-react";

export default function AuditLogsPage() {
    const [logs, setLogs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState<any>({});

    // Filters
    const [entityType, setEntityType] = useState("");
    const [action, setAction] = useState("");
    const [page, setPage] = useState(1);

    useEffect(() => {
        fetchLogs();
    }, [entityType, action, page]);

    const fetchLogs = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (entityType) params.append('entityType', entityType);
            if (action) params.append('action', action);
            params.append('page', page.toString());
            params.append('limit', '20');

            const res = await fetch(`/api/admin/audit-logs?${params}`);
            const data = await res.json();
            setLogs(data.logs || []);
            setPagination(data.pagination || {});
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const getActionIcon = (action: string) => {
        switch (action) {
            case 'CREATE': return <Plus className="w-4 h-4 text-green-500" />;
            case 'UPDATE': return <Edit className="w-4 h-4 text-blue-500" />;
            case 'DELETE': return <Trash2 className="w-4 h-4 text-red-500" />;
            case 'LOGIN': return <LogIn className="w-4 h-4 text-green-500" />;
            case 'LOGOUT': return <LogOut className="w-4 h-4 text-gray-500" />;
            case 'LOGIN_FAILED': return <AlertTriangle className="w-4 h-4 text-red-500" />;
            case 'APPROVE': return <CheckCircle className="w-4 h-4 text-green-500" />;
            default: return <FileText className="w-4 h-4 text-gray-500" />;
        }
    };

    const getActionColor = (action: string) => {
        switch (action) {
            case 'CREATE': return 'bg-green-100 text-green-700';
            case 'UPDATE': return 'bg-blue-100 text-blue-700';
            case 'DELETE': return 'bg-red-100 text-red-700';
            case 'LOGIN': return 'bg-green-100 text-green-700';
            case 'LOGIN_FAILED': return 'bg-red-100 text-red-700';
            case 'APPROVE': return 'bg-green-100 text-green-700';
            case 'REJECT': return 'bg-red-100 text-red-700';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    return (
        <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-900">Audit Logs</h1>
                <div className="text-sm text-gray-500">
                    Total: {pagination.total || 0} records
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white p-4 rounded-lg shadow-sm border flex flex-wrap gap-4 items-center">
                <Filter className="w-4 h-4 text-gray-400" />
                <select
                    value={entityType}
                    onChange={(e) => { setEntityType(e.target.value); setPage(1); }}
                    className="border rounded px-3 py-2 text-sm"
                >
                    <option value="">All Entities</option>
                    <option value="User">User</option>
                    <option value="Lead">Lead/Deal</option>
                    <option value="Project">Project</option>
                    <option value="Task">Task</option>
                    <option value="Commission">Commission</option>
                </select>

                <select
                    value={action}
                    onChange={(e) => { setAction(e.target.value); setPage(1); }}
                    className="border rounded px-3 py-2 text-sm"
                >
                    <option value="">All Actions</option>
                    <option value="CREATE">Create</option>
                    <option value="UPDATE">Update</option>
                    <option value="DELETE">Delete</option>
                    <option value="LOGIN">Login</option>
                    <option value="STATUS_CHANGE">Status Change</option>
                    <option value="APPROVE">Approve</option>
                </select>
            </div>

            {/* Logs Table */}
            <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
                {loading ? (
                    <div className="p-8 text-center text-gray-500">Loading...</div>
                ) : (
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Timestamp</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Entity</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {logs.map((log) => (
                                <tr key={log._id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {new Date(log.timestamp).toLocaleString()}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <User className="w-4 h-4 text-gray-400 mr-2" />
                                            <div>
                                                <div className="text-sm font-medium text-gray-900">{log.userName || "System"}</div>
                                                <div className="text-xs text-gray-500">{log.userRole}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`inline-flex items-center px-2 py-1 text-xs rounded-full ${getActionColor(log.action)}`}>
                                            {getActionIcon(log.action)}
                                            <span className="ml-1">{log.action}</span>
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-900">{log.entityType}</div>
                                        <div className="text-xs text-gray-500">{log.entityName}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-sm text-gray-600 max-w-md truncate">
                                            {log.description}
                                        </div>
                                        {log.changes && log.changes.length > 0 && (
                                            <div className="text-xs text-gray-400 mt-1">
                                                Changed: {log.changes.map((c: any) => c.field).join(', ')}
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
                <div className="flex justify-center space-x-2">
                    <button
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        disabled={page === 1}
                        className="px-3 py-1 border rounded text-sm disabled:opacity-50"
                    >
                        Previous
                    </button>
                    <span className="px-3 py-1 text-sm text-gray-600">
                        Page {page} of {pagination.totalPages}
                    </span>
                    <button
                        onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))}
                        disabled={page === pagination.totalPages}
                        className="px-3 py-1 border rounded text-sm disabled:opacity-50"
                    >
                        Next
                    </button>
                </div>
            )}
        </div>
    );
}
