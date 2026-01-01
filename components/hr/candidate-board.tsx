"use client";

import { useState, useEffect } from "react";
import { DragDropContext, DropResult, Droppable, Draggable } from "@hello-pangea/dnd";

interface Candidate {
    _id: string;
    name: string;
    position: string;
    status: string;
    order: number;
}

const COLUMNS = ["Applied", "Screening", "Interview", "Offer", "Hired", "Rejected"];

export default function CandidateBoard() {
    const [candidates, setCandidates] = useState<Candidate[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchCandidates();
    }, []);

    const fetchCandidates = async () => {
        try {
            const res = await fetch("/api/hr/candidates");
            const data = await res.json();
            setCandidates(data);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const onDragEnd = async (result: DropResult) => {
        const { destination, source, draggableId } = result;

        if (!destination) return;

        if (
            destination.droppableId === source.droppableId &&
            destination.index === source.index
        ) {
            return;
        }

        const newStatus = destination.droppableId;

        // Optimistic Update
        const updated = candidates.map(c => {
            if (c._id === draggableId) {
                return { ...c, status: newStatus };
            }
            return c;
        });
        setCandidates(updated);

        // Call API
        await fetch("/api/hr/candidates", {
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
                    const colCandidates = candidates.filter(c => c.status === colId).sort((a, b) => a.order - b.order);
                    return (
                        <div key={colId} className="flex flex-col w-72 bg-gray-100 rounded-lg min-h-[500px]">
                            <div className="p-4 font-semibold text-gray-700 bg-gray-200 rounded-t-lg">
                                {colId} <span className="text-sm text-gray-500 ml-2">({colCandidates.length})</span>
                            </div>
                            <Droppable droppableId={colId}>
                                {(provided) => (
                                    <div
                                        {...provided.droppableProps}
                                        ref={provided.innerRef}
                                        className="flex-1 p-2 space-y-2"
                                    >
                                        {colCandidates.map((c, index) => (
                                            <Draggable key={c._id} draggableId={c._id} index={index}>
                                                {(provided) => (
                                                    <div
                                                        ref={provided.innerRef}
                                                        {...provided.draggableProps}
                                                        {...provided.dragHandleProps}
                                                        className="p-4 bg-white rounded shadow-sm hover:shadow-md cursor-grab"
                                                    >
                                                        <div className="font-medium text-gray-800">{c.name}</div>
                                                        <div className="text-sm text-gray-500">{c.position}</div>
                                                    </div>
                                                )}
                                            </Draggable>
                                        ))}
                                        {provided.placeholder}
                                    </div>
                                )}
                            </Droppable>
                        </div>
                    )
                })}
            </div>
        </DragDropContext>
    );
}
