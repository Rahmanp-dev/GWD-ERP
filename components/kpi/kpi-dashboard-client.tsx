"use client";

import { useState } from "react";
import { Plus, Monitor } from "lucide-react";
import KPICard from "@/components/kpi/kpi-card";
import NewKPIModal from "@/components/kpi/new-kpi-modal";
import NewTaskModal from "@/components/kpi/new-task-modal";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function KPIDashboard({
    kpis,
    userRole
}: {
    kpis: any[],
    userRole: string
}) {
    const router = useRouter();
    const [filter, setFilter] = useState('All');
    const [isKPIModalOpen, setIsKPIModalOpen] = useState(false);

    // Task Modal State
    const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
    const [selectedKPIId, setSelectedKPIId] = useState("");

    const isExec = ['CEO', 'CFO', 'CMO', 'Admin'].includes(userRole);

    // Filter logic
    const displayedKPIs = kpis.filter(k => filter === 'All' || k.metricType === filter);

    async function handleToggleTask(taskId: string, status: string) {
        await fetch(`/api/tasks/${taskId}/toggle`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status })
        });
        router.refresh();
    }

    async function handleDeleteTask(taskId: string) {
        if (!confirm("Delete this task permanently?")) return;
        await fetch(`/api/tasks/${taskId}`, { method: 'DELETE' });
        router.refresh();
    }

    async function handleDeleteKPI(kpiId: string) {
        if (!confirm("Delete this KPI and ALL its linked tasks? This cannot be undone.")) return;
        await fetch(`/api/kpi?id=${kpiId}`, { method: 'DELETE' });
        router.refresh();
    }

    const openTaskModal = (kpiId: string) => {
        setSelectedKPIId(kpiId);
        setIsTaskModalOpen(true);
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Executive KPI Board</h1>
                    <p className="text-sm text-gray-500">Track high-level goals and assign execution tasks.</p>
                </div>
                <div className="flex space-x-3">
                    <Link href="/kpi/projector" className="flex items-center px-4 py-2 bg-gray-800 text-white rounded hover:bg-gray-900">
                        <Monitor className="w-4 h-4 mr-2" />
                        Projector Mode
                    </Link>
                    {isExec && (
                        <button
                            onClick={() => setIsKPIModalOpen(true)}
                            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                        >
                            <Plus className="w-4 h-4 mr-2" />
                            New KPI
                        </button>
                    )}
                </div>
            </div>

            {/* Filters */}
            <div className="flex space-x-2 border-b pb-2">
                {['All', 'Count', 'Revenue', 'Percentage'].map(type => (
                    <button
                        key={type}
                        onClick={() => setFilter(type)}
                        className={`px-4 py-2 text-sm font-medium rounded-t-lg ${filter === type ? 'bg-gray-100 text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        {type}
                    </button>
                ))}
            </div>

            {/* KPI Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {displayedKPIs.map(kpi => (
                    <KPICard
                        key={kpi._id}
                        kpi={kpi}
                        onToggleTask={handleToggleTask}
                        onAddTask={() => openTaskModal(kpi._id)}
                        onDeleteTask={handleDeleteTask}
                        onDeleteKPI={handleDeleteKPI}
                        isExec={isExec}
                    />
                ))}

                {displayedKPIs.length === 0 && (
                    <div className="col-span-full text-center py-20 bg-gray-50 rounded border border-dashed">
                        <p className="text-gray-500">No KPIs found for this filter.</p>
                    </div>
                )}
            </div>

            <NewKPIModal isOpen={isKPIModalOpen} onClose={() => setIsKPIModalOpen(false)} />

            <NewTaskModal
                isOpen={isTaskModalOpen}
                onClose={() => setIsTaskModalOpen(false)}
                kpiId={selectedKPIId}
                onTaskCreated={() => router.refresh()}
            />
        </div>
    );
}
