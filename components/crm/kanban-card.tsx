"use client";

import { Draggable } from "@hello-pangea/dnd";

interface Lead {
    _id: string;
    title: string;
    status: string;
    value: number;
    priority?: string;
    accountName?: string;
    expectedCloseDate?: string;
    assignedTo?: {
        name: string;
        image?: string;
    };
}

interface Props {
    lead: Lead;
    index: number;
    onClick?: () => void;
}

export default function KanbanCard({ lead, index, onClick }: Props) {
    return (
        <Draggable draggableId={lead._id} index={index}>
            {(provided) => (
                <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    onClick={onClick}
                    className="p-4 bg-white rounded shadow-sm hover:shadow-md cursor-pointer transition-shadow mb-2"
                >
                    <div className="flex justify-between items-start mb-2">
                        <span className={`px-2 py-0.5 text-xs font-semibold rounded border 
                            ${lead.priority === 'High' ? 'bg-red-50 text-red-700 border-red-200' :
                                lead.priority === 'Low' ? 'bg-gray-50 text-gray-600 border-gray-200' :
                                    'bg-yellow-50 text-yellow-700 border-yellow-200'}`}>
                            {lead.priority || 'Medium'}
                        </span>
                        {/* Avatar */}
                        {lead.assignedTo?.image ? (
                            <img className="h-6 w-6 rounded-full" src={lead.assignedTo.image} alt="" />
                        ) : (
                            <div className="h-6 w-6 rounded-full bg-gray-200 flex items-center justify-center text-xs">
                                {lead.assignedTo?.name?.[0] || "?"}
                            </div>
                        )}
                    </div>

                    <div className="font-medium text-gray-900 mb-1">{lead.title}</div>
                    <div className="text-xs text-gray-500 mb-2">{lead.accountName || "No Company"}</div>

                    <div className="flex justify-between items-center pt-2 border-t border-gray-100">
                        <div className="text-sm font-semibold text-gray-700">
                            {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(lead.value || 0)}
                        </div>
                        {lead.expectedCloseDate && (
                            <div className="text-xs text-gray-400">
                                {new Date(lead.expectedCloseDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </Draggable>
    );
}
