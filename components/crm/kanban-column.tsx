"use client";

import { Droppable } from "@hello-pangea/dnd";
import KanbanCard from "./kanban-card";

interface Lead {
    _id: string;
    title: string;
    status: string;
    value: number;
}

interface Props {
    columnId: string;
    leads: Lead[];
    onDealClick?: (id: string) => void;
}

export default function KanbanColumn({ columnId, leads, onDealClick }: Props) {
    return (
        <div className="flex flex-col w-80 bg-gray-100 rounded-lg min-h-[500px]">
            <div className="p-4 font-semibold text-gray-700 bg-gray-200 rounded-t-lg">
                {columnId} <span className="text-sm text-gray-500 ml-2">({leads.length})</span>
            </div>
            <Droppable droppableId={columnId}>
                {(provided) => (
                    <div
                        {...provided.droppableProps}
                        ref={provided.innerRef}
                        className="flex-1 p-2 space-y-2"
                    >
                        {leads.map((lead, index) => (
                            <KanbanCard key={lead._id} lead={lead} index={index} onClick={() => onDealClick?.(lead._id)} />
                        ))}
                        {provided.placeholder}
                    </div>
                )}
            </Droppable>
        </div>
    );
}
