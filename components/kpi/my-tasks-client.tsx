"use client";

import { useState, useEffect, useCallback } from "react";
import { CheckCircle, Circle, Clock, ArrowRight, RefreshCw, AlertCircle } from "lucide-react";

export default function MyTasksClient() {
    const [tasks, setTasks] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState<string | null>(null);

    const fetchTasks = useCallback(async () => {
        try {
            const res = await fetch("/api/tasks/my-tasks");
            const data = await res.json();
            setTasks(Array.isArray(data) ? data : []);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchTasks(); }, [fetchTasks]);

    async function toggleTask(taskId: string, newStatus: string) {
        setActionLoading(taskId);
        try {
            await fetch(`/api/tasks/${taskId}/toggle`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: newStatus })
            });
            await fetchTasks();
        } catch (e) { console.error(e); }
        finally { setActionLoading(null); }
    }

    async function postponeTask(taskId: string) {
        setActionLoading(taskId + "-postpone");
        try {
            await fetch("/api/tasks/my-tasks", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ taskId, action: "postpone" })
            });
            await fetchTasks();
        } catch (e) { console.error(e); }
        finally { setActionLoading(null); }
    }

    const pending = tasks.filter(t => t.status !== 'Done');
    const completed = tasks.filter(t => t.status === 'Done');

    if (loading) return <div className="p-8 text-center text-gray-500">Loading your tasks...</div>;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">My Tasks</h1>
                    <p className="text-sm text-gray-500">Your assigned execution tasks. Mark done or postpone.</p>
                </div>
                <button onClick={fetchTasks} className="flex items-center px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm">
                    <RefreshCw className="w-4 h-4 mr-1" /> Refresh
                </button>
            </div>

            {/* Pending Tasks */}
            <div>
                <h2 className="text-lg font-bold text-gray-800 mb-3 flex items-center">
                    <AlertCircle className="w-5 h-5 mr-2 text-orange-500" />
                    Pending ({pending.length})
                </h2>
                {pending.length === 0 ? (
                    <div className="bg-green-50 border border-green-200 rounded-xl p-6 text-center">
                        <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
                        <p className="text-green-700 font-medium">All caught up! No pending tasks.</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {pending.map(task => (
                            <div key={task._id} className="bg-white border border-gray-200 rounded-xl p-5 flex items-center justify-between shadow-sm hover:shadow-md transition">
                                <div className="flex items-center space-x-4 flex-1 min-w-0">
                                    <button
                                        onClick={() => toggleTask(task._id, 'Done')}
                                        disabled={actionLoading === task._id}
                                        className="flex-shrink-0"
                                    >
                                        <Circle className={`w-6 h-6 ${actionLoading === task._id ? 'text-gray-300 animate-pulse' : 'text-gray-400 hover:text-green-500'} transition cursor-pointer`} />
                                    </button>
                                    <div className="min-w-0">
                                        <h3 className="font-semibold text-gray-900 truncate">{task.title}</h3>
                                        <div className="flex items-center space-x-3 text-xs text-gray-500 mt-1">
                                            {task.linkedKPI && (
                                                <span className="bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full font-medium">
                                                    KPI: {task.linkedKPI.title}
                                                </span>
                                            )}
                                            {task.requester && (
                                                <span>Assigned by <strong>{task.requester.name}</strong></span>
                                            )}
                                            {task.dueDate && (
                                                <span className="flex items-center">
                                                    <Clock className="w-3 h-3 mr-1" />
                                                    {new Date(task.dueDate).toLocaleDateString()}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-2 flex-shrink-0 ml-4">
                                    <button
                                        onClick={() => postponeTask(task._id)}
                                        disabled={actionLoading === task._id + "-postpone"}
                                        className="px-3 py-1.5 text-xs font-medium bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition disabled:opacity-50"
                                    >
                                        <ArrowRight className="w-3 h-3 inline mr-1" />
                                        {actionLoading === task._id + "-postpone" ? "..." : "Tomorrow"}
                                    </button>
                                    <button
                                        onClick={() => toggleTask(task._id, 'Done')}
                                        disabled={actionLoading === task._id}
                                        className="px-3 py-1.5 text-xs font-medium bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition disabled:opacity-50"
                                    >
                                        <CheckCircle className="w-3 h-3 inline mr-1" />
                                        {actionLoading === task._id ? "..." : "Done"}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Completed Tasks */}
            {completed.length > 0 && (
                <div>
                    <h2 className="text-lg font-bold text-gray-800 mb-3 flex items-center">
                        <CheckCircle className="w-5 h-5 mr-2 text-green-500" />
                        Completed ({completed.length})
                    </h2>
                    <div className="space-y-2">
                        {completed.slice(0, 10).map(task => (
                            <div key={task._id} className="bg-gray-50 border border-gray-100 rounded-xl p-4 flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                                    <span className="text-gray-500 line-through">{task.title}</span>
                                </div>
                                <button
                                    onClick={() => toggleTask(task._id, 'To Do')}
                                    className="text-xs text-gray-400 hover:text-gray-600"
                                >
                                    Undo
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
