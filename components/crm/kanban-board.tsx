"use client";

import { useState, useEffect } from "react";
import { DragDropContext, DropResult } from "@hello-pangea/dnd";
import KanbanColumn from "./kanban-column";

interface Lead {
    _id: string;
    title: string;
    status: string;
    value: number;
    order: number;
}

const COLUMNS = ["Lead", "Qualified", "Proposal", "Negotiation", "Closed Won", "Closed Lost"];

export default function KanbanBoard({
    initialLeads = [],
    refreshTrigger,
    onDealClick
}: {
    initialLeads?: any[],
    refreshTrigger?: any,
    onDealClick?: (id: string) => void
}) {
    const [leads, setLeads] = useState<Lead[]>(initialLeads);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        setLeads(initialLeads);
    }, [initialLeads]);

    // Original fetch removed as parent handles it now, or we keep for drag-updates
    // For now we rely on parent passed props.

    const onDragEnd = async (result: DropResult) => {
        const { destination, source, draggableId } = result;

        if (!destination) return;

        if (
            destination.droppableId === source.droppableId &&
            destination.index === source.index
        ) {
            return;
        }

        // Optimistic Update
        const newStatus = destination.droppableId;
        const oldStatus = source.droppableId;

        const sourceColLeads = leads.filter(l => l.status === oldStatus).sort((a, b) => a.order - b.order);
        const destColLeads = leads.filter(l => l.status === newStatus).sort((a, b) => a.order - b.order);

        // Logic to reorder is complex without index persistence logic in DB fully robust
        // For MVP/Demo: Just update status. Reordering within column requires updating 'order' of all affected items.

        // Simple Status Change:
        const updatedLeads = leads.map(l => {
            if (l._id === draggableId) {
                return { ...l, status: newStatus };
            }
            return l;
        });
        setLeads(updatedLeads);

        // Call API
        await fetch("/api/crm/leads", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id: draggableId, status: newStatus }),
        });
    };

    if (loading) return <div>Loading pipeline...</div>;

    return (
        <DragDropContext onDragEnd={onDragEnd}>
            <div className="flex h-full gap-4 overflow-x-auto pb-4">
                {COLUMNS.map((colId) => {
                    const colLeads = leads.filter(l => l.status === colId).sort((a, b) => a.order - b.order);
                    return (
                        <KanbanColumn key={colId} columnId={colId} leads={colLeads} onDealClick={onDealClick} />
                    )
                })}
            </div>
        </DragDropContext>
    );
}
