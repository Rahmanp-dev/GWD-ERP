"use client";

import { useState, useEffect } from "react";
import { DragDropContext, DropResult } from "@hello-pangea/dnd";
import ProjectColumn from "./project-column";

interface Task {
    _id: string;
    title: string;
    status: string;
    order: number;
}

const COLUMNS = ["To Do", "In Progress", "Done"];

export default function ProjectBoard({ projectId }: { projectId: string }) {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchTasks();
    }, [projectId]);

    const fetchTasks = async () => {
        try {
            const res = await fetch(`/api/tasks?projectId=${projectId}`);
            const data = await res.json();
            setTasks(data);
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
        const updatedTasks = tasks.map(t => {
            if (t._id === draggableId) {
                return { ...t, status: newStatus };
            }
            return t;
        });
        setTasks(updatedTasks);

        // Call API
        await fetch("/api/tasks", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id: draggableId, status: newStatus }),
        });
    };

    if (loading) return <div>Loading tasks...</div>;

    return (
        <DragDropContext onDragEnd={onDragEnd}>
            <div className="flex h-full gap-4 overflow-x-auto pb-4">
                {COLUMNS.map((colId) => {
                    const colTasks = tasks.filter(t => t.status === colId).sort((a, b) => a.order - b.order);
                    return (
                        <ProjectColumn key={colId} columnId={colId} tasks={colTasks} />
                    )
                })}
            </div>
        </DragDropContext>
    );
}
