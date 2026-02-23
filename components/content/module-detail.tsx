"use client";

import { useState } from "react";
import { ArrowLeft, Target, Users, CalendarDays, Plus } from "lucide-react";
import ContentCard from "./content-card";
import NewContentModal from "./new-content-modal";

export default function ModuleDetail({ module, items, onBack, role, userId }: any) {
    const [isNewIdeaOpen, setIsNewIdeaOpen] = useState(false);
    if (!module) return null;

    // Group ideas by status roughly for the idea stack view
    const drafts = items.filter((i: any) => ['draft', 'editing', 'revision', 'changes_requested'].includes(i.status));
    const reviewing = items.filter((i: any) => ['review', 'in_review_l1', 'in_review_l2'].includes(i.status));
    const approved = items.filter((i: any) => ['approved_l1', 'approved_l2', 'scheduled', 'published'].includes(i.status));

    const refreshContent = () => {
        window.location.reload();
    };

    return (
        <div className="h-full flex flex-col bg-white rounded-xl shadow-sm border overflow-hidden">
            {/* Header */}
            <div className="p-6 border-b bg-gray-50/80">
                <button
                    onClick={onBack}
                    className="flex items-center text-sm font-medium text-gray-500 hover:text-gray-900 mb-4 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4 mr-1" />
                    Back to Modules
                </button>

                <div className="flex justify-between items-start">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-white border shadow-sm text-gray-800">
                                {module.category}
                            </span>
                            <span className={`px-2.5 py-1 rounded-md text-xs font-bold shadow-sm ${module.priority === 'Urgent' ? 'bg-red-100 text-red-800 border border-red-200' :
                                module.priority === 'High' ? 'bg-orange-100 text-orange-800 border border-orange-200' :
                                    'bg-gray-100 text-gray-800 border border-gray-200'
                                }`}>
                                {module.priority} Priority
                            </span>
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900">{module.name}</h2>
                    </div>

                    {(role === 'CEO' || role === 'Content Strategist' || role === 'Admin') && (
                        <button
                            onClick={() => setIsNewIdeaOpen(true)}
                            className="flex items-center bg-gray-900 hover:bg-black text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm"
                        >
                            <Plus className="w-4 h-4 mr-2" />
                            Add Idea to Stack
                        </button>
                    )}
                </div>

                <div className="flex flex-wrap gap-6 mt-5 text-sm">
                    {module.goal && (
                        <div className="flex items-center text-gray-700 bg-white px-3 py-1.5 rounded-lg border shadow-sm">
                            <Target className="w-4 h-4 mr-2 text-red-500" />
                            <span className="font-medium mr-1.5">Goal:</span> {module.goal}
                        </div>
                    )}
                    {module.audience && (
                        <div className="flex items-center text-gray-700 bg-white px-3 py-1.5 rounded-lg border shadow-sm">
                            <Users className="w-4 h-4 mr-2 text-blue-500" />
                            <span className="font-medium mr-1.5">Audience:</span> {module.audience}
                        </div>
                    )}
                    <div className="flex items-center text-gray-700 bg-white px-3 py-1.5 rounded-lg border shadow-sm">
                        <CalendarDays className="w-4 h-4 mr-2 text-gray-400" />
                        {module.startDate ? new Date(module.startDate).toLocaleDateString() : 'TBD'}
                        {module.endDate ? ` to ${new Date(module.endDate).toLocaleDateString()}` : ''}
                    </div>
                </div>
            </div>

            {/* Idea Stack Workspace */}
            <div className="flex-1 p-6 overflow-hidden flex flex-col bg-gray-50/30">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                    Idea Stack
                    <span className="ml-3 bg-gray-200 text-gray-700 text-xs py-0.5 px-2 rounded-full">{items.length} items</span>
                </h3>

                {items.length === 0 ? (
                    <div className="flex-1 flex items-center justify-center border-2 border-dashed border-gray-200 rounded-xl bg-gray-50">
                        <div className="text-center">
                            <p className="text-gray-500 font-medium mb-1">Stack is empty.</p>
                            <p className="text-gray-400 text-sm">No ideas or tasks have been added to this module yet.</p>
                        </div>
                    </div>
                ) : (
                    <div className="flex gap-6 overflow-x-auto pb-4 h-full">
                        {/* Working Column */}
                        <div className="min-w-[320px] w-[320px] flex flex-col h-full bg-gray-50 border rounded-xl shadow-sm overflow-hidden">
                            <div className="p-3 border-b bg-white flex justify-between items-center">
                                <span className="font-semibold text-gray-800 text-sm">Drafts & Production</span>
                                <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{drafts.length}</span>
                            </div>
                            <div className="p-3 overflow-y-auto flex-1 space-y-3">
                                {drafts.map((item: any) => (
                                    <ContentCard key={item._id} item={item} role={role} userId={userId} onActionComplete={refreshContent} compact={true} />
                                ))}
                            </div>
                        </div>

                        {/* Review Column */}
                        <div className="min-w-[320px] w-[320px] flex flex-col h-full bg-gray-50 border rounded-xl shadow-sm overflow-hidden">
                            <div className="p-3 border-b bg-white flex justify-between items-center">
                                <span className="font-semibold text-gray-800 text-sm">Under Review</span>
                                <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{reviewing.length}</span>
                            </div>
                            <div className="p-3 overflow-y-auto flex-1 space-y-3">
                                {reviewing.map((item: any) => (
                                    <ContentCard key={item._id} item={item} role={role} userId={userId} onActionComplete={refreshContent} compact={true} />
                                ))}
                            </div>
                        </div>

                        {/* Approved/Scheduled Column */}
                        <div className="min-w-[320px] w-[320px] flex flex-col h-full bg-gray-50 border rounded-xl shadow-sm overflow-hidden">
                            <div className="p-3 border-b bg-white flex justify-between items-center">
                                <span className="font-semibold text-gray-800 text-sm">Ready / Scheduled</span>
                                <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{approved.length}</span>
                            </div>
                            <div className="p-3 overflow-y-auto flex-1 space-y-3">
                                {approved.map((item: any) => (
                                    <ContentCard key={item._id} item={item} role={role} userId={userId} onActionComplete={refreshContent} compact={true} />
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {isNewIdeaOpen && (
                <NewContentModal
                    onClose={() => setIsNewIdeaOpen(false)}
                    onSuccess={() => { setIsNewIdeaOpen(false); refreshContent(); }}
                    prefilledModuleId={module._id}
                />
            )}
        </div>
    );
}
