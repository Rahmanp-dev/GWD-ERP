"use client";

import { Draggable } from "@hello-pangea/dnd";

interface Task {
    _id: string;
    title: string;
}

interface Props {
    task: Task;
    index: number;
}

export default function ProjectCard({ task, index }: Props) {
    return (
        <Draggable draggableId={task._id} index={index}>
            {(provided) => (
                <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    className="p-4 bg-white rounded shadow-sm hover:shadow-md cursor-grab transition-shadow"
                >
                    <div className="font-medium text-gray-800">{task.title}</div>
                </div>
            )}
        </Draggable>
    );
}
