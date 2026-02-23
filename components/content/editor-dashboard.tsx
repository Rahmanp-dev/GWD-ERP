"use client";

import { useState, useMemo, useEffect } from "react";
import {
    Clock, AlertTriangle, CheckCircle, MessageSquare, ChevronRight, Zap,
    Search, X, Upload, Send, RotateCcw, Filter, Eye
} from "lucide-react";
import TaskSidePanel from "./task-side-panel";
import { updateIdeaStatus, addIdeaComment, addAssetVersion } from "@/lib/actions/content-command";

const PRIORITY_BADGE: Record<string, string> = {
    Low: '🟢', Medium: '🔵', High: '🟠', Urgent: '🔴'
};

const STATUS_STYLES: Record<string, { label: string; bg: string; text: string }> = {
    draft: { label: 'Draft', bg: 'bg-gray-100', text: 'text-gray-700' },
    editing: { label: 'In Production', bg: 'bg-purple-100', text: 'text-purple-700' },
    revision: { label: 'Revision', bg: 'bg-orange-100', text: 'text-orange-700' },
    review: { label: 'Review', bg: 'bg-blue-100', text: 'text-blue-700' },
    in_review_l1: { label: 'Review L1', bg: 'bg-blue-100', text: 'text-blue-700' },
    in_review_l2: { label: 'Review L2', bg: 'bg-indigo-100', text: 'text-indigo-700' },
    approved_l1: { label: 'Approved L1', bg: 'bg-teal-100', text: 'text-teal-700' },
    approved_l2: { label: 'Approved', bg: 'bg-green-100', text: 'text-green-700' },
    scheduled: { label: 'Scheduled', bg: 'bg-blue-100', text: 'text-blue-800' },
    published: { label: 'Published', bg: 'bg-green-100', text: 'text-green-800' },
};

export default function EditorDashboard({ items, userId, role }: { items: any[]; userId: string; role: string }) {
    const [selectedItem, setSelectedItem] = useState<any>(null);
    const [search, setSearch] = useState('');
    const [activeFilter, setActiveFilter] = useState<'all' | 'urgent' | 'inprogress' | 'awaiting' | 'completed'>('all');
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
    const [quickComment, setQuickComment] = useState<{ itemId: string; text: string } | null>(null);
    const [quickVersion, setQuickVersion] = useState<{ itemId: string; url: string } | null>(null);
    const [localItems, setLocalItems] = useState(items);

    // Toast auto-dismiss
    useEffect(() => {
        if (toast) { const t = setTimeout(() => setToast(null), 3000); return () => clearTimeout(t); }
    }, [toast]);

    // Keyboard: Escape
    useEffect(() => {
        const handleKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') { setSelectedItem(null); setQuickComment(null); setQuickVersion(null); }
        };
        window.addEventListener('keydown', handleKey);
        return () => window.removeEventListener('keydown', handleKey);
    }, []);

    // Only items assigned to this editor
    const myItems = useMemo(() =>
        localItems.filter((i: any) =>
            (i.assignedEditorId?._id || i.assignedEditorId) === userId && i.status !== 'archived'
        ), [localItems, userId]);

    const urgentRevisions = myItems.filter((i: any) =>
        i.status === 'revision' || (i.status === 'editing' && (i.priority === 'Urgent' || i.priority === 'High'))
    );
    const inProgress = myItems.filter((i: any) => i.status === 'editing' && i.priority !== 'Urgent' && i.priority !== 'High');
    const awaitingFeedback = myItems.filter((i: any) => ['review', 'in_review_l1', 'in_review_l2'].includes(i.status));
    const completed = myItems.filter((i: any) => ['approved_l1', 'approved_l2', 'scheduled', 'published'].includes(i.status));

    // Filtered + searched items
    const displayItems = useMemo(() => {
        let result = myItems;
        if (activeFilter === 'urgent') result = urgentRevisions;
        else if (activeFilter === 'inprogress') result = inProgress;
        else if (activeFilter === 'awaiting') result = awaitingFeedback;
        else if (activeFilter === 'completed') result = completed;

        if (search.trim()) {
            const q = search.toLowerCase();
            result = result.filter((i: any) =>
                i.title.toLowerCase().includes(q) ||
                i.moduleId?.name?.toLowerCase().includes(q) ||
                i.platform?.[0]?.toLowerCase().includes(q)
            );
        }
        return result;
    }, [myItems, activeFilter, search, urgentRevisions, inProgress, awaitingFeedback, completed]);

    // BUG FIX: Show ALL comments (not just typed ones — legacy comments have no type field)
    const recentActivity = useMemo(() =>
        myItems
            .flatMap((item: any) =>
                (item.comments || []).map((c: any) => ({ ...c, itemTitle: item.title, itemId: item._id }))
            )
            .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
            .slice(0, 12),
        [myItems]
    );

    // Quick actions
    const handleSubmitForReview = async (e: React.MouseEvent, item: any) => {
        e.stopPropagation();
        try {
            setLocalItems(localItems.map((i: any) => i._id === item._id ? { ...i, status: 'in_review_l1' } : i));
            setToast({ message: `✅ "${item.title}" submitted for review`, type: 'success' });
            await updateIdeaStatus(item._id, 'in_review_l1');
        } catch {
            setLocalItems(items);
            setToast({ message: 'Failed', type: 'error' });
        }
    };

    const handleQuickComment = async () => {
        if (!quickComment || !quickComment.text.trim()) return;
        try {
            await addIdeaComment(quickComment.itemId, userId, quickComment.text, 'note');
            setToast({ message: '💬 Comment sent', type: 'success' });
            setQuickComment(null);
        } catch {
            setToast({ message: 'Failed to send comment', type: 'error' });
        }
    };

    const handleQuickVersion = async () => {
        if (!quickVersion || !quickVersion.url.trim()) return;
        try {
            await addAssetVersion(quickVersion.itemId, userId, quickVersion.url);
            setLocalItems(localItems.map((i: any) => i._id === quickVersion.itemId ? { ...i, status: 'review' } : i));
            setToast({ message: '📦 Version uploaded & sent for review', type: 'success' });
            setQuickVersion(null);
        } catch {
            setToast({ message: 'Failed to upload', type: 'error' });
        }
    };

    const refreshContent = () => window.location.reload();

    const filterTabs = [
        { key: 'all', label: 'All Tasks', count: myItems.length },
        { key: 'urgent', label: 'Urgent', count: urgentRevisions.length, color: 'text-red-600' },
        { key: 'inprogress', label: 'In Progress', count: inProgress.length, color: 'text-purple-600' },
        { key: 'awaiting', label: 'Awaiting', count: awaitingFeedback.length, color: 'text-blue-600' },
        { key: 'completed', label: 'Done', count: completed.length, color: 'text-green-600' },
    ];

    return (
        <div className="h-full flex overflow-hidden relative">
            {/* Toast */}
            {toast && (
                <div className={`absolute top-3 right-3 z-50 px-4 py-2.5 rounded-lg shadow-lg text-sm font-medium ${toast.type === 'success' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'}`}>
                    {toast.message}
                </div>
            )}

            {/* Main Task View */}
            <div className="flex-1 overflow-y-auto p-5">
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h2 className="text-lg font-bold text-gray-900">My Tasks</h2>
                        <p className="text-xs text-gray-500">{myItems.length} assigned • {urgentRevisions.length} need attention</p>
                    </div>
                    <div className="relative">
                        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                        <input type="text" placeholder="Search tasks..." className="pl-8 pr-7 py-1.5 border rounded-lg text-xs bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 w-[180px]"
                            value={search} onChange={e => setSearch(e.target.value)} />
                        {search && <button onClick={() => setSearch('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400"><X className="w-3 h-3" /></button>}
                    </div>
                </div>

                {/* Stats Row */}
                <div className="grid grid-cols-4 gap-3 mb-4">
                    {[
                        { label: 'Urgent', value: urgentRevisions.length, color: 'text-red-700', bg: 'bg-red-50 border-red-100' },
                        { label: 'In Progress', value: inProgress.length, color: 'text-purple-700', bg: 'bg-purple-50 border-purple-100' },
                        { label: 'Awaiting Review', value: awaitingFeedback.length, color: 'text-blue-700', bg: 'bg-blue-50 border-blue-100' },
                        { label: 'Completed', value: completed.length, color: 'text-green-700', bg: 'bg-green-50 border-green-100' },
                    ].map(s => (
                        <div key={s.label} className={`rounded-xl border p-3 ${s.bg}`}>
                            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
                            <p className="text-[10px] font-medium text-gray-600 uppercase tracking-wider">{s.label}</p>
                        </div>
                    ))}
                </div>

                {/* Filter Tabs */}
                <div className="flex items-center gap-1 mb-4 border-b">
                    {filterTabs.map(tab => (
                        <button key={tab.key} onClick={() => setActiveFilter(tab.key as any)}
                            className={`px-3 py-2 text-xs font-medium border-b-2 transition-colors ${activeFilter === tab.key ? 'border-red-600 text-red-600' : 'border-transparent text-gray-500 hover:text-gray-900'}`}>
                            {tab.label}
                            <span className={`ml-1 px-1 py-0.5 text-[9px] rounded-full bg-gray-100 font-bold ${tab.color || 'text-gray-600'}`}>{tab.count}</span>
                        </button>
                    ))}
                </div>

                {/* Task List */}
                {displayItems.length === 0 ? (
                    <div className="text-center py-8 text-gray-400">
                        <p className="font-medium">{search ? 'No results.' : activeFilter !== 'all' ? 'Nothing here.' : 'No tasks assigned.'}</p>
                    </div>
                ) : (
                    <div className="space-y-2">
                        {displayItems.map((item: any) => {
                            const st = STATUS_STYLES[item.status] || STATUS_STYLES.draft;
                            const isEditing = item.status === 'editing' || item.status === 'revision';
                            const isUrgent = item.priority === 'Urgent' || item.priority === 'High';
                            return (
                                <div key={item._id}
                                    className={`bg-white border rounded-lg p-3 hover:border-blue-300 hover:shadow-sm cursor-pointer transition-all group ${isUrgent && isEditing ? 'border-l-4 border-l-red-400' : ''}`}>
                                    <div className="flex items-center gap-3" onClick={() => setSelectedItem(item)}>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-1.5 mb-1">
                                                <span className="text-xs">{PRIORITY_BADGE[item.priority || 'Medium']}</span>
                                                <span className="font-medium text-sm text-gray-900 truncate">{item.title}</span>
                                                <span className={`ml-1 px-1.5 py-0.5 rounded text-[9px] font-bold ${st.bg} ${st.text}`}>{st.label}</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-[10px] text-gray-500">
                                                {item.moduleId?.name && <span className="px-1.5 py-0.5 bg-gray-50 border rounded">{item.moduleId.name}</span>}
                                                <span>{item.platform?.[0] || 'General'}</span>
                                                {item.versions?.length > 0 && <span className="font-bold">V{item.versions.length}</span>}
                                                {item.comments?.length > 0 && <span className="flex items-center"><MessageSquare className="w-2.5 h-2.5 mr-0.5" />{item.comments.length}</span>}
                                                {item.brief?.objective && <span className="text-gray-400 truncate max-w-[150px]"> — {item.brief.objective}</span>}
                                            </div>
                                        </div>

                                        {/* Quick Actions */}
                                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                                            {isEditing && (
                                                <>
                                                    <button onClick={e => { e.stopPropagation(); setQuickVersion({ itemId: item._id, url: '' }); }}
                                                        className="px-2 py-1 text-[9px] font-bold text-purple-700 bg-purple-50 border border-purple-200 rounded hover:bg-purple-100" title="Upload Version">
                                                        <Upload className="w-3 h-3 inline mr-0.5" />Upload
                                                    </button>
                                                    <button onClick={e => handleSubmitForReview(e, item)}
                                                        className="px-2 py-1 text-[9px] font-bold text-green-700 bg-green-50 border border-green-200 rounded hover:bg-green-100" title="Submit for Review">
                                                        <CheckCircle className="w-3 h-3 inline mr-0.5" />Submit
                                                    </button>
                                                </>
                                            )}
                                            <button onClick={e => { e.stopPropagation(); setQuickComment({ itemId: item._id, text: '' }); }}
                                                className="px-2 py-1 text-[9px] font-bold text-blue-700 bg-blue-50 border border-blue-200 rounded hover:bg-blue-100" title="Add Comment">
                                                <MessageSquare className="w-3 h-3 inline mr-0.5" />Note
                                            </button>
                                            <button onClick={() => setSelectedItem(item)}
                                                className="px-2 py-1 text-[9px] font-bold text-gray-600 bg-gray-50 border rounded hover:bg-gray-100" title="Full Details">
                                                <Eye className="w-3 h-3 inline" />
                                            </button>
                                        </div>

                                        <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-blue-500 transition-colors shrink-0" />
                                    </div>

                                    {/* Inline Quick Comment */}
                                    {quickComment !== null && quickComment.itemId === item._id && (
                                        <div className="mt-2 pt-2 border-t flex gap-2" onClick={e => e.stopPropagation()}>
                                            <input type="text" autoFocus placeholder="Quick note or question..."
                                                className="flex-1 px-2 py-1.5 border rounded text-xs bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500"
                                                value={quickComment.text} onChange={e => setQuickComment({ itemId: item._id, text: e.target.value })}
                                                onKeyDown={e => { if (e.key === 'Enter') handleQuickComment(); }} />
                                            <button onClick={handleQuickComment} disabled={!quickComment.text.trim()} className="px-3 py-1.5 text-xs font-medium text-white bg-blue-600 rounded disabled:opacity-50"><Send className="w-3 h-3" /></button>
                                            <button onClick={() => setQuickComment(null)} className="px-2 py-1.5 text-xs text-gray-500 border rounded">Cancel</button>
                                        </div>
                                    )}

                                    {/* Inline Quick Version Upload */}
                                    {quickVersion !== null && quickVersion.itemId === item._id && (
                                        <div className="mt-2 pt-2 border-t flex gap-2" onClick={e => e.stopPropagation()}>
                                            <input type="text" autoFocus placeholder="Paste Drive/Dropbox link..."
                                                className="flex-1 px-2 py-1.5 border rounded text-xs bg-gray-50 focus:bg-white focus:ring-2 focus:ring-purple-500"
                                                value={quickVersion.url} onChange={e => setQuickVersion({ itemId: item._id, url: e.target.value })}
                                                onKeyDown={e => { if (e.key === 'Enter') handleQuickVersion(); }} />
                                            <button onClick={handleQuickVersion} disabled={!quickVersion.url.trim()} className="px-3 py-1.5 text-xs font-medium text-white bg-purple-600 rounded disabled:opacity-50"><Upload className="w-3 h-3" /></button>
                                            <button onClick={() => setQuickVersion(null)} className="px-2 py-1.5 text-xs text-gray-500 border rounded">Cancel</button>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Activity Sidebar — FIXED: now shows ALL comments */}
            <div className="w-[280px] border-l bg-gray-50/50 p-4 overflow-y-auto shrink-0 hidden lg:flex flex-col">
                <h3 className="text-xs font-bold text-gray-900 mb-3 uppercase tracking-wider flex items-center shrink-0">
                    <MessageSquare className="w-3.5 h-3.5 mr-1.5 text-blue-500" /> Recent Messages
                    <span className="ml-auto px-1.5 py-0.5 text-[9px] rounded-full bg-blue-100 text-blue-600 font-bold">{recentActivity.length}</span>
                </h3>
                {recentActivity.length === 0 ? (
                    <p className="text-xs text-gray-400 italic">No messages yet. Comments from strategists will appear here.</p>
                ) : (
                    <div className="space-y-2 flex-1 overflow-y-auto">
                        {recentActivity.map((entry: any, i: number) => {
                            const typeMap: Record<string, { bg: string; text: string }> = {
                                feedback: { bg: 'bg-purple-50', text: 'text-purple-600' },
                                clarification: { bg: 'bg-orange-50', text: 'text-orange-600' },
                                revision: { bg: 'bg-red-50', text: 'text-red-600' },
                                note: { bg: 'bg-green-50', text: 'text-green-600' },
                                general: { bg: 'bg-gray-50', text: 'text-gray-600' },
                            };
                            const typeStyle = typeMap[entry.type] || typeMap.general;
                            return (
                                <div key={i} className="bg-white border rounded-lg p-2.5 shadow-sm hover:border-blue-200 cursor-pointer transition-colors"
                                    onClick={() => {
                                        const item = myItems.find(it => it._id === entry.itemId);
                                        if (item) setSelectedItem(item);
                                    }}>
                                    <div className="flex items-center justify-between mb-1">
                                        <div className="flex items-center gap-1">
                                            <div className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-[8px] font-bold shrink-0">
                                                {entry.userId?.name?.charAt(0) || 'U'}
                                            </div>
                                            <span className="text-[10px] font-bold text-gray-800">{entry.userId?.name || 'User'}</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <span className={`px-1 py-0.5 text-[7px] font-bold rounded ${typeStyle.bg} ${typeStyle.text}`}>
                                                {entry.type || 'comment'}
                                            </span>
                                        </div>
                                    </div>
                                    <p className="text-[11px] text-gray-600 line-clamp-2">{entry.text}</p>
                                    <div className="flex items-center justify-between mt-1">
                                        <p className="text-[9px] text-gray-400 truncate flex-1">{entry.itemTitle}</p>
                                        <span className="text-[8px] text-gray-400 shrink-0 ml-1">{entry.createdAt ? new Date(entry.createdAt).toLocaleDateString() : ''}</span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Side Panel */}
            {selectedItem && (
                <TaskSidePanel
                    item={selectedItem}
                    onClose={() => setSelectedItem(null)}
                    onSuccess={() => { setSelectedItem(null); refreshContent(); }}
                    role={role}
                    userId={userId}
                />
            )}
        </div>
    );
}
