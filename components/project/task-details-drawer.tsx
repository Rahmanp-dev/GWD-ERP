"use client";

import { useState, useEffect } from "react";
import { X, Plus, Clock, AlertTriangle, CheckCircle, User } from "lucide-react";

interface TaskDetailsDrawerProps {
    taskId: string | null;
    projectId: string;
    onClose: () => void;
    onUpdate: () => void;
}

export default function TaskDetailsDrawer({ taskId, projectId, onClose, onUpdate }: TaskDetailsDrawerProps) {
    const [task, setTask] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState<"details" | "time" | "blockers">("details");

    // Time log form
    const [hours, setHours] = useState("");
    const [logDescription, setLogDescription] = useState("");

    // Blocker form
    const [blockerDesc, setBlockerDesc] = useState("");

    useEffect(() => {
        if (taskId) {
            fetchTask(taskId);
        } else {
            setTask(null);
        }
    }, [taskId]);

    const fetchTask = async (id: string) => {
        setLoading(true);
        try {
            const res = await fetch(`/api/tasks?projectId=${projectId}`);
            const tasks = await res.json();
            const foundTask = tasks.find((t: any) => t._id === id);
            setTask(foundTask);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const logTime = async () => {
        if (!hours || !taskId) return;
        try {
            await fetch("/api/tasks/timelog", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    taskId,
                    hours: parseFloat(hours),
                    description: logDescription
                })
            });
            setHours("");
            setLogDescription("");
            fetchTask(taskId);
            onUpdate();
        } catch (error) {
            console.error(error);
        }
    };

    const addBlocker = async () => {
        if (!blockerDesc || !taskId) return;
        try {
            await fetch("/api/tasks/blocker", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    taskId,
                    description: blockerDesc
                })
            });
            setBlockerDesc("");
            fetchTask(taskId);
            onUpdate();
        } catch (error) {
            console.error(error);
        }
    };

    if (!taskId) return null;

    const totalLogged = task?.timeLogs?.reduce((acc: number, log: any) => acc + (log.hours || 0), 0) || 0;
    const openBlockers = task?.blockers?.filter((b: any) => !b.isResolved) || [];

    return (
        <div className="fixed inset-y-0 right-0 w-96 bg-white shadow-2xl border-l border-gray-200 z-50 flex flex-col">
            {loading ? (
                <div className="flex items-center justify-center h-full">Loading...</div>
            ) : task ? (
                <>
                    {/* Header */}
                    <div className="p-6 border-b border-gray-100 flex justify-between items-start">
                        <div>
                            <h2 className="text-xl font-bold text-gray-900">{task.title}</h2>
                            <p className="text-sm text-gray-500 mt-1">{task.description || "No description"}</p>
                        </div>
                        <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                            <X className="w-6 h-6" />
                        </button>
                    </div>

                    {/* Stats Bar */}
                    <div className="flex border-b border-gray-100 divide-x divide-gray-100 bg-gray-50">
                        <div className="flex-1 p-3 text-center">
                            <div className="text-xs text-gray-400 uppercase">Status</div>
                            <div className="font-semibold text-gray-900 text-sm">{task.status}</div>
                        </div>
                        <div className="flex-1 p-3 text-center">
                            <div className="text-xs text-gray-400 uppercase">Logged</div>
                            <div className="font-semibold text-blue-600 text-sm">{totalLogged}h</div>
                        </div>
                        <div className="flex-1 p-3 text-center">
                            <div className="text-xs text-gray-400 uppercase">Blockers</div>
                            <div className={`font-semibold text-sm ${openBlockers.length > 0 ? 'text-red-600' : 'text-green-600'}`}>
                                {openBlockers.length}
                            </div>
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="flex border-b border-gray-200">
                        <button
                            onClick={() => setActiveTab("details")}
                            className={`flex-1 py-3 text-sm font-medium ${activeTab === "details" ? "text-blue-600 border-b-2 border-blue-600" : "text-gray-500"}`}
                        >
                            Details
                        </button>
                        <button
                            onClick={() => setActiveTab("time")}
                            className={`flex-1 py-3 text-sm font-medium ${activeTab === "time" ? "text-blue-600 border-b-2 border-blue-600" : "text-gray-500"}`}
                        >
                            Time Log
                        </button>
                        <button
                            onClick={() => setActiveTab("blockers")}
                            className={`flex-1 py-3 text-sm font-medium ${activeTab === "blockers" ? "text-blue-600 border-b-2 border-blue-600" : "text-gray-500"}`}
                        >
                            Blockers
                        </button>
                    </div>

                    {/* Content */}
                    <div className="flex-1 overflow-y-auto p-6">
                        {activeTab === "details" && (
                            <div className="space-y-4">
                                <div className="flex items-center text-sm">
                                    <User className="w-4 h-4 mr-3 text-gray-400" />
                                    <span className="w-20 font-medium text-gray-600">Assignee</span>
                                    <span>{task.assignee?.name || "Unassigned"}</span>
                                </div>
                                <div className="flex items-center text-sm">
                                    <Clock className="w-4 h-4 mr-3 text-gray-400" />
                                    <span className="w-20 font-medium text-gray-600">Due</span>
                                    <span>{task.dueDate ? new Date(task.dueDate).toLocaleDateString() : "No due date"}</span>
                                </div>
                                <div className="flex items-center text-sm">
                                    <CheckCircle className="w-4 h-4 mr-3 text-gray-400" />
                                    <span className="w-20 font-medium text-gray-600">Priority</span>
                                    <span className={`px-2 py-0.5 text-xs rounded border ${task.priority === 'Critical' ? 'bg-red-50 text-red-700 border-red-200' :
                                            task.priority === 'High' ? 'bg-orange-50 text-orange-700 border-orange-200' :
                                                'bg-gray-50 text-gray-600 border-gray-200'
                                        }`}>{task.priority}</span>
                                </div>
                            </div>
                        )}

                        {activeTab === "time" && (
                            <div className="space-y-4">
                                <div className="flex space-x-2">
                                    <input
                                        type="number"
                                        value={hours}
                                        onChange={(e) => setHours(e.target.value)}
                                        placeholder="Hours"
                                        className="w-20 border rounded px-2 py-1 text-sm"
                                    />
                                    <input
                                        type="text"
                                        value={logDescription}
                                        onChange={(e) => setLogDescription(e.target.value)}
                                        placeholder="What did you work on?"
                                        className="flex-1 border rounded px-2 py-1 text-sm"
                                    />
                                    <button onClick={logTime} className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700">
                                        <Plus className="w-4 h-4" />
                                    </button>
                                </div>

                                <div className="space-y-2 pt-4 border-t">
                                    {task.timeLogs?.map((log: any, i: number) => (
                                        <div key={i} className="flex justify-between text-sm p-2 bg-gray-50 rounded">
                                            <div>
                                                <span className="font-medium">{log.hours}h</span>
                                                <span className="text-gray-500 ml-2">{log.description}</span>
                                            </div>
                                            <div className="text-xs text-gray-400">
                                                {new Date(log.loggedAt).toLocaleDateString()}
                                            </div>
                                        </div>
                                    ))}
                                    {(!task.timeLogs || task.timeLogs.length === 0) && (
                                        <div className="text-center text-gray-400 text-sm py-4">No time logged yet</div>
                                    )}
                                </div>
                            </div>
                        )}

                        {activeTab === "blockers" && (
                            <div className="space-y-4">
                                <div className="flex space-x-2">
                                    <input
                                        type="text"
                                        value={blockerDesc}
                                        onChange={(e) => setBlockerDesc(e.target.value)}
                                        placeholder="Describe the blocker..."
                                        className="flex-1 border rounded px-2 py-1 text-sm"
                                    />
                                    <button onClick={addBlocker} className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700">
                                        <AlertTriangle className="w-4 h-4" />
                                    </button>
                                </div>

                                <div className="space-y-2 pt-4 border-t">
                                    {task.blockers?.map((blocker: any, i: number) => (
                                        <div key={i} className={`p-3 rounded border ${blocker.isResolved ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                                            <div className="flex justify-between items-start">
                                                <span className="text-sm">{blocker.description}</span>
                                                <span className={`text-xs px-2 py-0.5 rounded ${blocker.isResolved ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                                    {blocker.isResolved ? 'Resolved' : 'Open'}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                    {(!task.blockers || task.blockers.length === 0) && (
                                        <div className="text-center text-gray-400 text-sm py-4">No blockers reported</div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </>
            ) : (
                <div className="flex items-center justify-center h-full">Task not found</div>
            )}
        </div>
    );
}
