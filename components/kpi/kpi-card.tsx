"use client";

import { CheckCircle, Circle, Trash2, Clock } from "lucide-react";
import { useState } from "react";

export default function KPICard({ kpi, onToggleTask, onAddTask, onDeleteTask, onDeleteKPI, isExec }: {
    kpi: any,
    onToggleTask: any,
    onAddTask: () => void,
    onDeleteTask?: (taskId: string) => void,
    onDeleteKPI?: (kpiId: string) => void,
    isExec?: boolean
}) {
    const [expanded, setExpanded] = useState(false);

    const getColor = (p: number) => {
        if (p >= 100) return "text-green-600 bg-green-50 border-green-200";
        if (p >= 50) return "text-blue-600 bg-blue-50 border-blue-200";
        return "text-orange-600 bg-orange-50 border-orange-200";
    };

    const colorClass = getColor(kpi.progress);

    return (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden hover:shadow-md transition group/kpi">
            <div className="p-5 flex justify-between items-start">
                <div>
                    <h3 className="font-bold text-gray-900">{kpi.title}</h3>
                    <p className="text-sm text-gray-500">{kpi.metricType} Goal: {kpi.target}</p>
                </div>
                <div className="flex items-center space-x-2">
                    <div className={`px-3 py-1 rounded-full text-sm font-bold border ${colorClass}`}>
                        {kpi.progress}%
                    </div>
                    {isExec && onDeleteKPI && (
                        <button
                            onClick={() => onDeleteKPI(kpi._id)}
                            className="opacity-0 group-hover/kpi:opacity-100 transition p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50"
                            title="Delete KPI"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                    )}
                </div>
            </div>

            {/* Accountability Info */}
            <div className="px-5 pb-3 flex items-center justify-between text-xs text-gray-500 border-b border-gray-50">
                <div className="flex items-center space-x-2">
                    {kpi.owner && (
                        <div className="flex items-center space-x-1 bg-gray-100 px-2 py-1 rounded-full">
                            <img src={kpi.owner.image || `https://ui-avatars.com/api/?name=${kpi.owner.name}`} className="w-4 h-4 rounded-full" />
                            <span className="font-medium text-gray-700">{kpi.owner.name}</span>
                            <span className="text-gray-400">({kpi.owner.role})</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Progress Bar */}
            <div className="h-2 bg-gray-100 w-full mb-4">
                <div
                    className={`h-full transition-all duration-500 ${kpi.progress >= 100 ? 'bg-green-500' : 'bg-blue-500'}`}
                    style={{ width: `${Math.min(kpi.progress, 100)}%` }}
                ></div>
            </div>

            {/* Tasks Section */}
            <div className="bg-gray-50 p-4 border-t border-gray-100">
                <div className="flex justify-between items-center mb-3">
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Related Tasks</span>
                    <div className="flex space-x-2">
                        <button onClick={onAddTask} className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-2 py-1 rounded transition flex items-center">
                            + Assign
                        </button>
                        <button onClick={() => setExpanded(!expanded)} className="text-xs text-blue-600 hover:underline">
                            {expanded ? "Collapse" : `View All (${kpi.tasks.length})`}
                        </button>
                    </div>
                </div>

                <div className="space-y-2">
                    {kpi.tasks.length === 0 && <p className="text-xs text-gray-400 italic">No active tasks.</p>}

                    {kpi.tasks.slice(0, expanded ? undefined : 3).map((task: any) => (
                        <div key={task._id} className="flex items-start space-x-3 group">
                            <button
                                onClick={() => onToggleTask(task._id, task.status === 'Done' ? 'To Do' : 'Done')}
                                className="mt-0.5 text-gray-400 hover:text-green-600 transition"
                            >
                                {task.status === 'Done' ? <CheckCircle className="w-4 h-4 text-green-500" /> : <Circle className="w-4 h-4" />}
                            </button>
                            <div className="flex-1 min-w-0">
                                <p className={`text-sm font-medium ${task.status === 'Done' ? 'text-gray-400 line-through' : 'text-gray-700'}`}>
                                    {task.title}
                                </p>
                                <div className="flex items-center flex-wrap gap-2 mt-1">
                                    {task.assignee && (
                                        <div className="flex items-center space-x-1" title={`Assigned to ${task.assignee.name}`}>
                                            <img src={task.assignee.image || `https://ui-avatars.com/api/?name=${task.assignee.name}`} className="w-4 h-4 rounded-full" />
                                            <span className="text-xs text-gray-500">{task.assignee.name.split(' ')[0]}</span>
                                        </div>
                                    )}
                                    {task.requester && (
                                        <span className="text-[10px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded border border-gray-200">
                                            By: {task.requester.role || 'User'}
                                        </span>
                                    )}
                                    <span className="text-xs text-gray-400">• {new Date(task.dueDate || task.createdAt).toLocaleDateString()}</span>
                                </div>
                            </div>
                            {/* Delete button — Executives only */}
                            {isExec && onDeleteTask && (
                                <button
                                    onClick={() => onDeleteTask(task._id)}
                                    className="opacity-0 group-hover:opacity-100 transition text-gray-400 hover:text-red-500 mt-0.5"
                                    title="Delete task"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
