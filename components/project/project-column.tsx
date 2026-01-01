"use client";

import { Droppable } from "@hello-pangea/dnd";
import ProjectCard from "./project-card";

interface Task {
    _id: string;
    title: string;
    status: string;
}

interface Props {
    columnId: string;
    tasks: Task[];
}

export default function ProjectColumn({ columnId, tasks }: Props) {
    return (
        <div className="flex flex-col w-80 bg-gray-100 rounded-lg min-h-[500px]">
            <div className="p-4 font-semibold text-gray-700 bg-gray-200 rounded-t-lg">
                {columnId} <span className="text-sm text-gray-500 ml-2">({tasks.length})</span>
            </div>
            <Droppable droppableId={columnId}>
                {(provided) => (
                    <div
                        {...provided.droppableProps}
                        ref={provided.innerRef}
                        className="flex-1 p-2 space-y-2"
                    >
                        {tasks.map((task, index) => (
                            <ProjectCard key={task._id} task={task} index={index} />
                        ))}
                        {provided.placeholder}
                    </div>
                )}
            </Droppable>
        </div>
    );
}
