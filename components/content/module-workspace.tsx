"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import {
    ArrowLeft, Plus, Activity, Clock, AlertTriangle, ChevronRight,
    Megaphone, Search, X, Zap, CheckCircle, RotateCcw
} from "lucide-react";
import NewContentModal from "./new-content-modal";
import TaskSidePanel from "./task-side-panel";
import { updateIdeaStatus, archiveContentItem, deleteContentItem } from "@/lib/actions/content-command";

const STATUS_STYLES: Record<string, { label: string; bg: string; text: string }> = {
    draft: { label: 'Draft', bg: 'bg-gray-100', text: 'text-gray-700' },
    editing: { label: 'In Production', bg: 'bg-purple-100', text: 'text-purple-700' },
    revision: { label: 'Revision', bg: 'bg-orange-100', text: 'text-orange-700' },
    changes_requested: { label: 'Changes', bg: 'bg-orange-100', text: 'text-orange-700' },
    review: { label: 'Review', bg: 'bg-blue-100', text: 'text-blue-700' },
    in_review_l1: { label: 'Review L1', bg: 'bg-blue-100', text: 'text-blue-700' },
    in_review_l2: { label: 'Review L2', bg: 'bg-indigo-100', text: 'text-indigo-700' },
    approved_l1: { label: 'Approved L1', bg: 'bg-teal-100', text: 'text-teal-700' },
    approved_l2: { label: 'Approved', bg: 'bg-green-100', text: 'text-green-700' },
    scheduled: { label: 'Scheduled', bg: 'bg-blue-100', text: 'text-blue-800' },
    published: { label: 'Published', bg: 'bg-green-100', text: 'text-green-800' },
    archived: { label: 'Archived', bg: 'bg-gray-200', text: 'text-gray-500' },
};

const PRIORITY_BADGE: Record<string, string> = {
    Low: '🟢', Medium: '🔵', High: '🟠', Urgent: '🔴'
};

export default function ModuleWorkspace({ module, items: initialItems, onBack, role, userId, allItems }: any) {
    const [isNewIdeaOpen, setIsNewIdeaOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState<any>(null);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [items, setItems] = useState(initialItems);
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
    const [quickActionId, setQuickActionId] = useState<string | null>(null);

    const isStrategistOrCEO = role === 'CEO' || role === 'Content Strategist' || role === 'Admin';

    // Keyboard shortcuts
    useEffect(() => {
        const handleKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') { setSelectedItem(null); setQuickActionId(null); }
            if (e.key === '/' && !e.ctrlKey && !(e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement)) {
                e.preventDefault();
                document.getElementById('workspace-search')?.focus();
            }
        };
        window.addEventListener('keydown', handleKey);
        return () => window.removeEventListener('keydown', handleKey);
    }, []);

    // Toast auto-dismiss
    useEffect(() => {
        if (toast) { const t = setTimeout(() => setToast(null), 3000); return () => clearTimeout(t); }
    }, [toast]);

    if (!module) return null;

    // Filters
    const filteredItems = useMemo(() => {
        let result = items;
        if (search.trim()) {
            const q = search.toLowerCase();
            result = result.filter((i: any) =>
                i.title.toLowerCase().includes(q) ||
                i.assignedEditorId?.name?.toLowerCase().includes(q) ||
                i.platform?.[0]?.toLowerCase().includes(q)
            );
        }
        if (statusFilter !== 'all') {
            result = result.filter((i: any) => i.status === statusFilter);
        }
        return result;
    }, [items, search, statusFilter]);

    // Stats
    const total = items.length;
    const completedStatuses = ['approved_l1', 'approved_l2', 'scheduled', 'published'];
    const completed = items.filter((i: any) => completedStatuses.includes(i.status)).length;
    const pending = total - completed;
    const urgent = items.filter((i: any) => i.priority === 'Urgent' || i.priority === 'High').length;
    const progress = total > 0 ? Math.round((completed / total) * 100) : 0;
    const revisionCount = items.filter((i: any) => i.status === 'revision').length;

    // Activity feed
    const activityFeed = items
        .flatMap((item: any) => (item.comments || []).map((c: any) => ({ ...c, itemTitle: item.title })))
        .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 15);

    // Quick actions (optimistic)
    const handleQuickApprove = async (e: React.MouseEvent, item: any) => {
        e.stopPropagation();
        try {
            setItems(items.map((i: any) => i._id === item._id ? { ...i, status: 'approved_l1' } : i));
            setToast({ message: `✅ "${item.title}" approved`, type: 'success' });
            await updateIdeaStatus(item._id, 'approved_l1');
        } catch {
            setItems(initialItems);
            setToast({ message: 'Failed to approve', type: 'error' });
        }
    };

    const handleQuickRevision = async (e: React.MouseEvent, item: any) => {
        e.stopPropagation();
        try {
            setItems(items.map((i: any) => i._id === item._id ? { ...i, status: 'revision' } : i));
            setToast({ message: `🔄 "${item.title}" sent to revision`, type: 'success' });
            await updateIdeaStatus(item._id, 'revision');
        } catch {
            setItems(initialItems);
            setToast({ message: 'Failed', type: 'error' });
        }
    };

    const handleQuickPublish = async (e: React.MouseEvent, item: any) => {
        e.stopPropagation();
        try {
            setItems(items.map((i: any) => i._id === item._id ? { ...i, status: 'scheduled' } : i));
            setToast({ message: `📅 "${item.title}" scheduled`, type: 'success' });
            await updateIdeaStatus(item._id, 'scheduled');
        } catch {
            setItems(initialItems);
            setToast({ message: 'Failed', type: 'error' });
        }
    };

    const handleArchive = async (e: React.MouseEvent, item: any) => {
        e.stopPropagation();
        try {
            setItems(items.filter((i: any) => i._id !== item._id));
            setToast({ message: `🗑️ "${item.title}" archived`, type: 'success' });
            await archiveContentItem(item._id);
        } catch {
            setItems(initialItems);
            setToast({ message: 'Failed to archive', type: 'error' });
        }
    };

    const handlePermanentDelete = async (e: React.MouseEvent, item: any) => {
        e.stopPropagation();
        if (!confirm(`Permanently delete "${item.title}"? This cannot be undone.`)) return;
        try {
            setItems(items.filter((i: any) => i._id !== item._id));
            setToast({ message: `❌ "${item.title}" deleted`, type: 'success' });
            await deleteContentItem(item._id);
        } catch {
            setItems(initialItems);
            setToast({ message: 'Failed to delete', type: 'error' });
        }
    };
    const refreshContent = () => window.location.reload();

    return (
        <div className="h-full flex flex-col overflow-hidden relative">
            {/* Toast */}
            {toast && (
                <div className={`absolute top-3 right-3 z-50 px-4 py-2.5 rounded-lg shadow-lg text-sm font-medium animate-in slide-in-from-right ${toast.type === 'success' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'}`}>
                    {toast.message}
                </div>
            )}

            {/* Smart Alerts Banner */}
            {(revisionCount > 0 || urgent > 0) && (
                <div className="px-5 py-2 bg-gradient-to-r from-amber-50 to-red-50 border-b border-amber-200 flex items-center gap-4 text-xs shrink-0">
                    {revisionCount > 0 && (
                        <span className="flex items-center gap-1 text-orange-700 font-medium">
                            <RotateCcw className="w-3 h-3" /> {revisionCount} item{revisionCount > 1 ? 's' : ''} need revision
                        </span>
                    )}
                    {urgent > 0 && (
                        <span className="flex items-center gap-1 text-red-700 font-medium">
                            <AlertTriangle className="w-3 h-3" /> {urgent} high/urgent priority task{urgent > 1 ? 's' : ''}
                        </span>
                    )}
                </div>
            )}

            {/* Header */}
            <div className="px-5 py-3 border-b bg-white shrink-0">
                <div className="flex items-center justify-between mb-2">
                    <button onClick={onBack} className="flex items-center text-xs font-medium text-gray-500 hover:text-gray-900 transition-colors">
                        <ArrowLeft className="w-3.5 h-3.5 mr-1" /> Modules
                    </button>
                    <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded text-xs font-bold bg-gray-100 text-gray-700">{module.category}</span>
                        <span className={`px-2 py-0.5 rounded text-xs font-bold ${module.priority === 'Urgent' ? 'bg-red-100 text-red-700' : module.priority === 'High' ? 'bg-orange-100 text-orange-700' : 'bg-gray-100 text-gray-600'}`}>{module.priority}</span>
                    </div>
                </div>
                <div className="flex items-center justify-between mb-3">
                    <h2 className="text-xl font-bold text-gray-900">{module.name}</h2>
                    {isStrategistOrCEO && (
                        <button onClick={() => setIsNewIdeaOpen(true)} className="flex items-center bg-gray-900 hover:bg-black text-white px-3 py-1.5 rounded-lg text-xs font-medium transition-colors">
                            <Plus className="w-3.5 h-3.5 mr-1.5" /> Add Content
                        </button>
                    )}
                </div>

                {/* Progress + Search */}
                <div className="flex items-center gap-4">
                    <div className="flex-1 max-w-[300px]">
                        <div className="flex justify-between text-[10px] mb-1">
                            <span className="font-medium text-gray-600">Progress</span>
                            <span className="font-bold text-gray-900">{progress}%</span>
                        </div>
                        <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                            <div className={`h-full rounded-full transition-all duration-500 ${progress >= 80 ? 'bg-green-500' : progress >= 40 ? 'bg-blue-500' : 'bg-orange-400'}`} style={{ width: `${progress}%` }} />
                        </div>
                    </div>

                    <div className="flex gap-2 text-[10px] shrink-0">
                        <span className="flex items-center gap-1 px-2 py-1 bg-gray-50 border rounded font-medium"><Megaphone className="w-3 h-3 text-gray-400" />{total}</span>
                        <span className="flex items-center gap-1 px-2 py-1 bg-yellow-50 border border-yellow-200 rounded font-medium text-yellow-800"><Clock className="w-3 h-3" />{pending}</span>
                    </div>

                    {/* Search */}
                    <div className="relative ml-auto">
                        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                        <input
                            id="workspace-search"
                            type="text"
                            placeholder="Search... (press /)"
                            className="pl-8 pr-8 py-1.5 border rounded-lg text-xs bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 w-[180px] transition-all focus:w-[220px]"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                        />
                        {search && (
                            <button onClick={() => setSearch('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                                <X className="w-3 h-3" />
                            </button>
                        )}
                    </div>

                    {/* Status filter chips */}
                    <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="px-2 py-1.5 border rounded-lg text-[10px] bg-white font-medium">
                        <option value="all">All Status</option>
                        <option value="draft">Draft</option>
                        <option value="editing">Editing</option>
                        <option value="revision">Revision</option>
                        <option value="in_review_l1">Review</option>
                        <option value="scheduled">Scheduled</option>
                        <option value="published">Published</option>
                    </select>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex overflow-hidden">
                <div className="flex-1 overflow-auto p-4">
                    {filteredItems.length === 0 ? (
                        <div className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center text-gray-400">
                            <p className="font-medium">{search ? 'No results found.' : 'No content yet.'}</p>
                            <p className="text-sm mt-1">{search ? 'Try a different search term.' : 'Add your first idea.'}</p>
                        </div>
                    ) : (
                        <div className="bg-white border rounded-xl overflow-hidden shadow-sm">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="bg-gray-50 border-b">
                                        <th className="text-left py-2 px-4 text-[10px] font-semibold text-gray-500 uppercase">Content</th>
                                        <th className="text-left py-2 px-3 text-[10px] font-semibold text-gray-500 uppercase">Status</th>
                                        <th className="text-left py-2 px-3 text-[10px] font-semibold text-gray-500 uppercase">Priority</th>
                                        <th className="text-left py-2 px-3 text-[10px] font-semibold text-gray-500 uppercase">Editor</th>
                                        <th className="text-left py-2 px-3 text-[10px] font-semibold text-gray-500 uppercase">Platform</th>
                                        <th className="text-center py-2 px-2 text-[10px] font-semibold text-gray-500 uppercase">V</th>
                                        {isStrategistOrCEO && <th className="py-2 px-2 text-[10px] font-semibold text-gray-500 uppercase text-right">Quick Actions</th>}
                                        <th className="py-2 px-2"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {filteredItems.map((item: any) => {
                                        const st = STATUS_STYLES[item.status] || STATUS_STYLES.draft;
                                        const isUrgent = item.priority === 'Urgent';
                                        return (
                                            <tr key={item._id}
                                                className={`cursor-pointer transition-colors group ${isUrgent ? 'bg-red-50/30 hover:bg-red-50/60' : 'hover:bg-blue-50/30'}`}
                                                onClick={() => setSelectedItem(item)}>
                                                <td className="py-2.5 px-4">
                                                    <span className={`font-medium ${isUrgent ? 'text-red-900' : 'text-gray-900'}`}>{item.title}</span>
                                                    {item.brief?.objective && <p className="text-[10px] text-gray-400 truncate max-w-[180px] mt-0.5">{item.brief.objective}</p>}
                                                </td>
                                                <td className="py-2.5 px-3">
                                                    <span className={`inline-flex px-1.5 py-0.5 rounded text-[10px] font-bold ${st.bg} ${st.text}`}>{st.label}</span>
                                                </td>
                                                <td className="py-2.5 px-3 text-xs">{PRIORITY_BADGE[item.priority || 'Medium']} {item.priority || 'Medium'}</td>
                                                <td className="py-2.5 px-3 text-xs text-gray-600">{item.assignedEditorId?.name || <span className="text-gray-300">—</span>}</td>
                                                <td className="py-2.5 px-3 text-xs text-gray-600">{item.platform?.[0] || '—'}</td>
                                                <td className="py-2.5 px-2 text-center text-xs text-gray-500">{item.versions?.length || 0}</td>
                                                {isStrategistOrCEO && (
                                                    <td className="py-2.5 px-2 text-right">
                                                        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                            {['review', 'in_review_l1', 'in_review_l2'].includes(item.status) && (
                                                                <>
                                                                    <button onClick={e => handleQuickApprove(e, item)} className="px-2 py-1 text-[9px] font-bold text-green-700 bg-green-50 border border-green-200 rounded hover:bg-green-100" title="Quick Approve">
                                                                        <CheckCircle className="w-3 h-3 inline mr-0.5" />OK
                                                                    </button>
                                                                    <button onClick={e => handleQuickRevision(e, item)} className="px-2 py-1 text-[9px] font-bold text-orange-700 bg-orange-50 border border-orange-200 rounded hover:bg-orange-100" title="Send to Revision">
                                                                        <RotateCcw className="w-3 h-3 inline mr-0.5" />Rev
                                                                    </button>
                                                                </>
                                                            )}
                                                            {['approved_l1', 'approved_l2'].includes(item.status) && (
                                                                <button onClick={e => handleQuickPublish(e, item)} className="px-2 py-1 text-[9px] font-bold text-blue-700 bg-blue-50 border border-blue-200 rounded hover:bg-blue-100" title="Schedule">
                                                                    <Zap className="w-3 h-3 inline mr-0.5" />Schedule
                                                                </button>
                                                            )}
                                                            <button onClick={e => handleArchive(e, item)} className="px-1.5 py-1 text-[9px] font-bold text-gray-500 bg-gray-50 border border-gray-200 rounded hover:bg-gray-100" title="Archive">
                                                                <X className="w-3 h-3 inline" />
                                                            </button>
                                                            {role === 'CEO' && (
                                                                <button onClick={e => handlePermanentDelete(e, item)} className="px-1.5 py-1 text-[9px] font-bold text-red-500 bg-red-50 border border-red-200 rounded hover:bg-red-100" title="Delete permanently">
                                                                    🗑
                                                                </button>
                                                            )}
                                                        </div>
                                                    </td>
                                                )}
                                                <td className="py-2.5 px-2"><ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-blue-500 transition-colors" /></td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Activity Feed */}
                <div className="w-[260px] border-l bg-gray-50/50 p-4 overflow-y-auto shrink-0 hidden lg:block">
                    <h3 className="text-[10px] font-bold text-gray-900 mb-3 flex items-center uppercase tracking-wider">
                        <Activity className="w-3.5 h-3.5 mr-1.5 text-blue-500" /> Activity
                    </h3>
                    {activityFeed.length === 0 ? (
                        <p className="text-xs text-gray-400 italic">No activity yet.</p>
                    ) : (
                        <div className="space-y-2">
                            {activityFeed.map((entry: any, i: number) => (
                                <div key={i} className="bg-white border rounded-lg p-2 shadow-sm">
                                    <div className="flex items-center justify-between mb-0.5">
                                        <span className="text-[10px] font-bold text-gray-800">{entry.userId?.name || 'User'}</span>
                                        <span className="text-[8px] text-gray-400">{new Date(entry.createdAt).toLocaleDateString()}</span>
                                    </div>
                                    <p className="text-[10px] text-gray-600 line-clamp-2">{entry.text}</p>
                                    <p className="text-[8px] text-gray-400 mt-0.5 truncate">on: {entry.itemTitle}</p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Side Panel */}
            {selectedItem && (
                <TaskSidePanel item={selectedItem} onClose={() => setSelectedItem(null)} onSuccess={() => { setSelectedItem(null); refreshContent(); }} role={role} userId={userId} />
            )}

            {isNewIdeaOpen && (
                <NewContentModal onClose={() => setIsNewIdeaOpen(false)} onSuccess={() => { setIsNewIdeaOpen(false); refreshContent(); }} prefilledModuleId={module._id} />
            )}
        </div>
    );
}
