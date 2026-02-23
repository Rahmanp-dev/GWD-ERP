"use client";

import { useState } from "react";
import { requestReview, approveContent, delegateApproval, approveProductionAsset } from "@/lib/actions/content";
import { Check, Clock, User, Film, MoreVertical, X, Megaphone, Lock, Edit3 } from "lucide-react";
import ApprovalStrip from "./approval-strip";
import TaskSidePanel from "./task-side-panel";

export default function ContentCard({ item, role, userId, onActionComplete, compact }: any) {
    const [isLoading, setIsLoading] = useState(false);
    const [isDetailOpen, setIsDetailOpen] = useState(false);

    const handleAction = async (actionFn: () => Promise<any>) => {
        setIsLoading(true);
        try {
            await actionFn();
            onActionComplete();
        } catch (error) {
            console.error("Action failed", error);
            alert("Action failed to execute.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <div className="bg-white border hover:border-blue-300 rounded-xl p-4 shadow-sm hover:shadow-md transition-all relative group">
                <div className="flex justify-between items-start mb-2">
                    <div className="flex-1 cursor-pointer pr-4" onClick={() => setIsDetailOpen(true)}>
                        <div className="flex items-center gap-1.5 mb-2 flex-wrap">
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                                {item.vertical}
                            </span>
                            {item.priority && item.priority !== 'Medium' && (
                                <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold uppercase ${item.priority === 'Urgent' ? 'bg-red-100 text-red-700' :
                                    item.priority === 'High' ? 'bg-orange-100 text-orange-700' :
                                        'bg-gray-100 text-gray-500'
                                    }`}>
                                    {item.priority === 'Urgent' ? '🔴' : item.priority === 'High' ? '🟠' : '🟢'} {item.priority}
                                </span>
                            )}
                        </div>
                        <h4 className="font-bold text-gray-900">{item.title}</h4>
                    </div>
                    {item.delegated_to_userId && (
                        <div className="text-xs text-orange-600 bg-orange-50 px-2 py-1 rounded-md flex items-center border border-orange-100" title={`Delegated to ${item.delegated_to_userId.name}`}>
                            <Lock className="w-3 h-3 mr-1" />
                            Delegated
                        </div>
                    )}
                    <button
                        onClick={() => setIsDetailOpen(true)}
                        className="opacity-0 group-hover:opacity-100 absolute top-4 right-4 p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-all"
                        title="Edit Details & Assign"
                    >
                        <Edit3 className="w-4 h-4" />
                    </button>
                </div>

                <div className="py-2 cursor-pointer" onClick={() => setIsDetailOpen(true)}>
                    <ApprovalStrip approvals={item.approvals} status={item.status} />
                </div>

                {/* Action Buttons based on status and role */}
                <div className="mt-4 pt-4 border-t flex flex-wrap gap-2">
                    {/* Draft Actions */}
                    {(item.status === 'draft' || item.status === 'changes_requested') && (role === 'Content Strategist' || role === 'Admin') && (
                        <button
                            disabled={isLoading}
                            onClick={() => handleAction(() => requestReview(item._id, userId))}
                            className="bg-gray-900 text-white text-xs px-3 py-1.5 rounded disabled:opacity-50"
                        >
                            Request Review
                        </button>
                    )}

                    {/* Production Approval */}
                    {role === 'Production Lead' && ['draft', 'in_review_l1'].includes(item.status) && (
                        <button
                            disabled={isLoading}
                            onClick={() => handleAction(() => approveProductionAsset(item._id, 'dummy_asset_id', userId, 'approved', 'Looks good'))}
                            className="bg-blue-600 text-white flex items-center text-xs px-3 py-1.5 rounded hover:bg-blue-700 disabled:opacity-50"
                        >
                            <Film className="w-3 h-3 mr-1" />
                            Mark Prod-Approved
                        </button>
                    )}

                    {/* Level 1 Approval (Content Strategist) */}
                    {item.status === 'in_review_l1' && (role === 'Content Strategist' || role === 'Admin') && (
                        <>
                            <button
                                disabled={isLoading}
                                onClick={() => handleAction(() => approveContent(item._id, userId, role, 'level_1', 'approved', 'L1 Approved'))}
                                className="bg-green-600 hover:bg-green-700 text-white flex items-center text-xs px-3 py-1.5 rounded disabled:opacity-50"
                                title="Approving confirms content meets editorial standards"
                            >
                                <Check className="w-3 h-3 mr-1" />
                                Approve (L1)
                            </button>
                            <button
                                disabled={isLoading}
                                onClick={() => handleAction(() => approveContent(item._id, userId, role, 'level_1', 'changes'))}
                                className="bg-white border text-gray-700 hover:bg-gray-50 flex items-center text-xs px-3 py-1.5 rounded disabled:opacity-50"
                            >
                                Request Changes
                            </button>
                        </>
                    )}

                    {/* Level 2 Approval (CEO) */}
                    {item.status === 'in_review_l2' && (role === 'CEO' || role === 'Admin') && (
                        <>
                            <button
                                disabled={isLoading}
                                onClick={() => handleAction(() => approveContent(item._id, userId, role, 'level_2', 'approved', 'CEO Final Approval'))}
                                className="bg-black hover:bg-gray-800 text-gold-500 text-white font-medium flex items-center text-xs px-3 py-1.5 rounded disabled:opacity-50 ring-1 ring-gold-500/50"
                                title="CEO final sign-off"
                            >
                                <Check className="w-3 h-3 mr-1" />
                                CEO Final Approve
                            </button>
                            <button
                                disabled={isLoading}
                                onClick={() => handleAction(() => approveContent(item._id, userId, role, 'level_2', 'changes'))}
                                className="bg-white border text-red-600 hover:bg-red-50 flex items-center text-xs px-3 py-1.5 rounded disabled:opacity-50"
                            >
                                <X className="w-3 h-3 mr-1" />
                                Reject
                            </button>
                            {/* Delegate to Strategist shortcut for CEO */}
                            <button
                                disabled={isLoading}
                                onClick={() => {
                                    const stratId = prompt("Enter Content Strategist User ID:");
                                    if (stratId) handleAction(() => delegateApproval(item.vertical, stratId));
                                }}
                                className="bg-purple-100 text-purple-700 hover:bg-purple-200 border-purple-200 border flex items-center text-xs px-3 py-1.5 rounded disabled:opacity-50"
                            >
                                Delegate
                            </button>
                        </>
                    )}
                </div>

                {/* Quick Audit view */}
                {item.production_approvals?.length > 0 && (
                    <div className="mt-3 bg-gray-50 p-2 rounded text-xs text-gray-500 flex items-center">
                        <Film className="w-3 h-3 mr-1 text-blue-500" />
                        Production asset appended & approved.
                    </div>
                )}

                {isDetailOpen && (
                    <TaskSidePanel
                        item={item}
                        role={role}
                        userId={userId}
                        onClose={() => setIsDetailOpen(false)}
                        onSuccess={() => { setIsDetailOpen(false); onActionComplete(); }}
                    />
                )}
            </div>
        </>
    );
}
