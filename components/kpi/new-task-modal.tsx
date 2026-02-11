"use client";

import { useState, useEffect } from "react";
import { X, Search } from "lucide-react";

export default function NewTaskModal({ isOpen, onClose, kpiId, onTaskCreated }: { isOpen: boolean, onClose: () => void, kpiId: string, onTaskCreated: () => void }) {
    const [title, setTitle] = useState("");
    const [users, setUsers] = useState<any[]>([]);
    const [assignee, setAssignee] = useState("");
    const [dueDate, setDueDate] = useState("");
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState("");

    // Fetch users for assignment
    useEffect(() => {
        if (isOpen) {
            fetch("/api/admin/users?role=all")
                .then(res => res.json())
                .then(data => {
                    if (Array.isArray(data)) {
                        setUsers(data);
                    } else if (data.users) {
                        setUsers(data.users);
                    } else {
                        setUsers([]);
                    }
                })
                .catch(err => console.error("Failed to fetch users", err));
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const filteredUsers = users.filter((u: any) =>
        (u.name?.toLowerCase() || "").includes(search.toLowerCase()) ||
        (u.role?.toLowerCase() || "").includes(search.toLowerCase())
    );

    async function handleSubmit(e: any) {
        e.preventDefault();
        setLoading(true);

        try {
            await fetch("/api/tasks/create", { // Use existing task creation API
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    title,
                    assignee: assignee || undefined, // If empty, server defaults to current user or handles it
                    kpiId,
                    dueDate,
                    priority: "High"
                })
            });
            onTaskCreated();
            onClose();
            setTitle("");
            setAssignee("");
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[60]">
            <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-lg border border-gray-200">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-gray-900">Assign Execution Task</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Task Title</label>
                        <input
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            required
                            className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                            placeholder="e.g. Call 50 leads from cold list"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Assign To</label>
                        <div className="relative">
                            <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search team..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full border border-gray-300 rounded-lg pl-9 p-2.5 mb-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                        </div>

                        <div className="max-h-40 overflow-y-auto border border-gray-200 rounded-lg">
                            {filteredUsers.length > 0 ? (
                                filteredUsers.map((u: any) => (
                                    <div
                                        key={u._id}
                                        onClick={() => setAssignee(u._id)}
                                        className={`flex items-center p-2 cursor-pointer hover:bg-blue-50 transition ${assignee === u._id ? 'bg-blue-50 border-l-4 border-blue-500' : ''}`}
                                    >
                                        <img src={u.image || `https://ui-avatars.com/api/?name=${u.name}`} className="w-6 h-6 rounded-full mr-3" />
                                        <div>
                                            <p className="text-sm font-medium text-gray-900">{u.name}</p>
                                            <p className="text-xs text-gray-500">{u.role}</p>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="p-4 text-center text-sm text-gray-400">No users found</div>
                            )}
                        </div>
                        {assignee && <p className="text-xs text-blue-600 mt-1 font-medium">Selected: {users.find(u => u._id === assignee)?.name}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Due Date</label>
                        <input
                            type="date"
                            value={dueDate}
                            onChange={(e) => setDueDate(e.target.value)}
                            className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                    </div>

                    <div className="flex justify-end pt-4">
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-6 py-2.5 bg-black text-white font-bold rounded-lg hover:bg-gray-800 transition disabled:opacity-50"
                        >
                            {loading ? "Assigning..." : "Assign Task"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
