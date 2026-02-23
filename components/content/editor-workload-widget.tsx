"use client";

import { Users, AlertTriangle, Clock, Activity } from "lucide-react";

interface EditorWorkload {
    _id: string;
    name: string;
    activeTasks: number;
    urgentTasks: number;
    revisionTasks: number;
    load: 'Low' | 'Medium' | 'High' | 'Overloaded';
}

function computeWorkloads(items: any[], users: any[]): EditorWorkload[] {
    // Get all editors from user list
    const editors = users.filter((u: any) => u.role === 'Editor');

    return editors.map((editor: any) => {
        const editorItems = items.filter((item: any) =>
            (item.assignedEditorId?._id || item.assignedEditorId) === editor._id
        );

        const activeTasks = editorItems.filter((i: any) =>
            ['editing', 'revision', 'review', 'in_review_l1'].includes(i.status)
        ).length;

        const urgentTasks = editorItems.filter((i: any) =>
            i.priority === 'Urgent' && ['editing', 'revision'].includes(i.status)
        ).length;

        const revisionTasks = editorItems.filter((i: any) => i.status === 'revision').length;

        let load: EditorWorkload['load'] = 'Low';
        if (activeTasks >= 5 || urgentTasks >= 2) load = 'Overloaded';
        else if (activeTasks >= 3 || urgentTasks >= 1) load = 'High';
        else if (activeTasks >= 1) load = 'Medium';

        return {
            _id: editor._id,
            name: editor.name,
            activeTasks,
            urgentTasks,
            revisionTasks,
            load
        };
    });
}

const LOAD_STYLES: Record<string, { bg: string; text: string; dot: string }> = {
    Low: { bg: 'bg-green-50', text: 'text-green-700', dot: 'bg-green-500' },
    Medium: { bg: 'bg-blue-50', text: 'text-blue-700', dot: 'bg-blue-500' },
    High: { bg: 'bg-orange-50', text: 'text-orange-700', dot: 'bg-orange-500' },
    Overloaded: { bg: 'bg-red-50', text: 'text-red-700', dot: 'bg-red-500' },
};

export default function EditorWorkloadWidget({ items, users }: { items: any[]; users: any[] }) {
    const workloads = computeWorkloads(items, users);

    if (workloads.length === 0) {
        return (
            <div className="bg-white border rounded-xl p-5 shadow-sm">
                <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center">
                    <Users className="w-4 h-4 mr-1.5 text-blue-500" />
                    Editor Workload
                </h3>
                <p className="text-sm text-gray-400 italic">No editors found in the system.</p>
            </div>
        );
    }

    return (
        <div className="bg-white border rounded-xl p-5 shadow-sm">
            <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center">
                <Users className="w-4 h-4 mr-1.5 text-blue-500" />
                Editor Workload Overview
            </h3>
            <div className="overflow-x-auto">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b">
                            <th className="text-left py-2 px-3 text-xs font-semibold text-gray-500 uppercase">Editor</th>
                            <th className="text-center py-2 px-3 text-xs font-semibold text-gray-500 uppercase">Active</th>
                            <th className="text-center py-2 px-3 text-xs font-semibold text-gray-500 uppercase">Urgent</th>
                            <th className="text-center py-2 px-3 text-xs font-semibold text-gray-500 uppercase">Revisions</th>
                            <th className="text-center py-2 px-3 text-xs font-semibold text-gray-500 uppercase">Load</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {workloads.map(w => {
                            const style = LOAD_STYLES[w.load];
                            return (
                                <tr key={w._id} className="hover:bg-gray-50/50 transition-colors">
                                    <td className="py-2.5 px-3 font-medium text-gray-900">{w.name}</td>
                                    <td className="py-2.5 px-3 text-center">
                                        <span className="font-bold text-gray-800">{w.activeTasks}</span>
                                    </td>
                                    <td className="py-2.5 px-3 text-center">
                                        {w.urgentTasks > 0 ? (
                                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-red-100 text-red-700">
                                                <AlertTriangle className="w-3 h-3 mr-0.5" />
                                                {w.urgentTasks}
                                            </span>
                                        ) : (
                                            <span className="text-gray-400">0</span>
                                        )}
                                    </td>
                                    <td className="py-2.5 px-3 text-center">
                                        {w.revisionTasks > 0 ? (
                                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-orange-100 text-orange-700">
                                                {w.revisionTasks}
                                            </span>
                                        ) : (
                                            <span className="text-gray-400">0</span>
                                        )}
                                    </td>
                                    <td className="py-2.5 px-3 text-center">
                                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${style.bg} ${style.text}`}>
                                            <span className={`w-2 h-2 rounded-full mr-1.5 ${style.dot}`}></span>
                                            {w.load}
                                        </span>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
