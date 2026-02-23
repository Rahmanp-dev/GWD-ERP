"use client";

import { useState } from "react";
import ContentCard from "./content-card";

export default function ContentBoard({ initialItems, role, userId }: { initialItems: any[], role: string, userId: string }) {
    const [items, setItems] = useState(initialItems);

    // Group items by status
    const groupedItems: Record<string, any[]> = {
        drafts: items.filter(i => i.status === 'draft'),
        editing: items.filter(i => i.status === 'editing'),
        review: items.filter(i => ['review', 'in_review_l1', 'in_review_l2'].includes(i.status)),
        revision: items.filter(i => i.status === 'revision' || i.status === 'changes_requested'),
        approved: items.filter(i => ['approved_l1', 'approved_l2', 'scheduled'].includes(i.status)),
        published: items.filter(i => i.status === 'published')
    };

    // Determine relevant columns based on role
    let activeColumns = [];
    if (role === 'CEO') {
        activeColumns = [
            { id: 'review', title: 'Pending Signoff', data: groupedItems.review },
            { id: 'approved', title: 'Recently Approved', data: groupedItems.approved }
        ];
    } else if (role === 'Content Strategist' || role === 'Production Lead') {
        activeColumns = [
            { id: 'drafts', title: 'Drafts & Ideas', data: groupedItems.drafts },
            { id: 'editing', title: 'In Production', data: groupedItems.editing },
            { id: 'revision', title: 'Needs Revision', data: groupedItems.revision },
            { id: 'review', title: 'Under Review', data: groupedItems.review },
            { id: 'approved', title: 'Scheduled', data: groupedItems.approved }
        ];
    } else if (role === 'Editor') {
        activeColumns = [
            { id: 'editing', title: 'My Active Tasks', data: groupedItems.editing },
            { id: 'revision', title: 'Needs Revision', data: groupedItems.revision },
            { id: 'review', title: 'Pending Review', data: groupedItems.review },
            { id: 'approved', title: 'Scheduled', data: groupedItems.approved }
        ];
    } else {
        // Admin or other
        activeColumns = [
            { id: 'drafts', title: 'Drafts', data: groupedItems.drafts },
            { id: 'editing', title: 'Editing', data: groupedItems.editing },
            { id: 'review', title: 'Review', data: groupedItems.review },
            { id: 'revision', title: 'Revision', data: groupedItems.revision },
            { id: 'approved', title: 'Scheduled', data: groupedItems.approved }
        ];
    }

    const refreshContent = () => {
        // Simple reload for MVP. Can be optimistic UI later.
        window.location.reload();
    };

    return (
        <div className="flex gap-6 overflow-x-auto pb-4 h-[calc(100vh-180px)]">
            {activeColumns.map(col => (
                <div key={col.id} className="min-w-[350px] w-[350px] bg-gray-50/50 rounded-xl border border-gray-100 flex flex-col h-full">
                    <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/80 rounded-t-xl">
                        <h3 className="font-semibold text-gray-900">{col.title}</h3>
                        <span className="bg-white text-gray-500 text-xs font-medium px-2.5 py-1 rounded-full border border-gray-200 shadow-sm">
                            {col.data.length}
                        </span>
                    </div>

                    <div className="p-4 flex-1 overflow-y-auto space-y-4">
                        {col.data.length === 0 ? (
                            <div className="h-24 flex items-center justify-center text-sm text-gray-400 border-2 border-dashed border-gray-200 rounded-lg">
                                Queue is empty
                            </div>
                        ) : (
                            col.data.map(item => (
                                <ContentCard
                                    key={item._id}
                                    item={item}
                                    role={role}
                                    userId={userId}
                                    onActionComplete={refreshContent}
                                />
                            ))
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
}
