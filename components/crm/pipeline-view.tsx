"use client";

import { useState, useEffect } from "react";
import KanbanBoard from "./kanban-board";
import PipelineTable from "./pipeline-table";
import { LayoutGrid, List, Filter, Plus } from "lucide-react";
import Link from "next/link";
import DealDetailsDrawer from "./deal-details-drawer";

export default function PipelineView() {
    const [view, setView] = useState<"kanban" | "table">("kanban");
    const [leads, setLeads] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterPriority, setFilterPriority] = useState("");
    const [selectedDealId, setSelectedDealId] = useState<string | null>(null);

    useEffect(() => {
        fetchLeads();
    }, [filterPriority]);

    const fetchLeads = async () => {
        setLoading(true);
        try {
            const query = new URLSearchParams();
            if (filterPriority) query.append("priority", filterPriority);

            const res = await fetch(`/api/crm/leads?${query.toString()}`);
            const data = await res.json();
            setLeads(data);
        } catch (error) {
            console.error("Failed to fetch leads", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="h-full flex flex-col">
            {/* Toolbar */}
            <div className="flex justify-between items-center mb-6 px-1">
                <div className="flex items-center space-x-4">
                    <h1 className="text-2xl font-bold text-gray-900">Sales Pipeline</h1>

                    {/* View Switcher */}
                    <div className="flex bg-gray-100 p-1 rounded-lg border border-gray-200">
                        <button
                            onClick={() => setView("kanban")}
                            className={`p-2 rounded-md transition-colors ${view === "kanban" ? "bg-white shadow-sm text-blue-600" : "text-gray-500 hover:text-gray-900"}`}
                        >
                            <LayoutGrid className="w-5 h-5" />
                        </button>
                        <button
                            onClick={() => setView("table")}
                            className={`p-2 rounded-md transition-colors ${view === "table" ? "bg-white shadow-sm text-blue-600" : "text-gray-500 hover:text-gray-900"}`}
                        >
                            <List className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Filters */}
                    <div className="flex items-center space-x-2">
                        <Filter className="w-4 h-4 text-gray-400" />
                        <select
                            className="border-none bg-transparent text-sm font-medium text-gray-600 focus:ring-0 cursor-pointer"
                            onChange={(e) => setFilterPriority(e.target.value)}
                            value={filterPriority}
                        >
                            <option value="">All Priorities</option>
                            <option value="High">High Priority</option>
                            <option value="Medium">Medium Priority</option>
                            <option value="Low">Low Priority</option>
                        </select>
                    </div>
                </div>

                <Link href="/crm/pipeline/new" className="flex items-center px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 shadow-sm transition-colors">
                    <Plus className="w-5 h-5 mr-1" />
                    Add Deal
                </Link>
            </div>

            {/* View Content */}
            <div className="flex-1 overflow-hidden">
                {loading ? (
                    <div className="flex items-center justify-center h-full text-gray-500">Loading pipeline...</div>
                ) : (
                    view === "kanban" ? (
                        <KanbanBoard
                            initialLeads={leads}
                            refreshTrigger={filterPriority}
                            onDealClick={(id: string) => setSelectedDealId(id)}
                        />
                    ) : (
                        <PipelineTable
                            leads={leads}
                            onDealClick={(id: string) => setSelectedDealId(id)}
                        />
                    )
                )}
            </div>

            <DealDetailsDrawer dealId={selectedDealId} onClose={() => setSelectedDealId(null)} />
        </div>
    );
}
