"use client";

import { useState, useMemo } from "react";
import {
    LayoutDashboard, FolderOpen, Calendar, Inbox, Plus, Clock,
    AlertTriangle, CheckCircle, Activity, ChevronRight, Megaphone, Search, X
} from "lucide-react";
import ModuleWorkspace from "@/components/content/module-workspace";
import RequestsTab from "@/components/content/requests-tab";
import CalendarTab from "@/components/content/calendar-tab";
import EditorDashboard from "@/components/content/editor-dashboard";
import EditorWorkloadWidget from "@/components/content/editor-workload-widget";
import CEOQuickCommand from "@/components/content/ceo-quick-command";
import NewModuleModal from "@/components/content/new-module-modal";
import TaskSidePanel from "@/components/content/task-side-panel";
import { archiveContentModule, deleteContentModule, archiveContentItem, deleteContentItem } from "@/lib/actions/content-command";

const STATUS_COLOR: Record<string, string> = {
    draft: 'bg-gray-400', editing: 'bg-purple-500', revision: 'bg-orange-500',
    review: 'bg-blue-500', in_review_l1: 'bg-blue-500', in_review_l2: 'bg-indigo-500',
    approved_l1: 'bg-teal-500', approved_l2: 'bg-green-500',
    scheduled: 'bg-blue-600', published: 'bg-green-600'
};

type NavView = 'dashboard' | 'module' | 'calendar' | 'requests';

export default function CommandCenterClient({
    initialModules,
    initialItems,
    initialRequests,
    initialUsers,
    role,
    userId
}: {
    initialModules: any[],
    initialItems: any[],
    initialRequests: any[],
    initialUsers: any[],
    role: string,
    userId: string
}) {
    const [activeView, setActiveView] = useState<NavView>('dashboard');
    const [selectedModuleId, setSelectedModuleId] = useState<string | null>(null);
    const [isNewModuleOpen, setIsNewModuleOpen] = useState(false);
    const [globalSearch, setGlobalSearch] = useState('');

    // Global search across items
    const searchResults = useMemo(() => {
        if (!globalSearch.trim()) return [];
        const q = globalSearch.toLowerCase();
        return initialItems.filter((i: any) =>
            i.title?.toLowerCase().includes(q) ||
            i.assignedEditorId?.name?.toLowerCase().includes(q) ||
            i.platform?.[0]?.toLowerCase().includes(q) ||
            i.brief?.objective?.toLowerCase().includes(q)
        ).slice(0, 8);
    }, [globalSearch, initialItems]);

    const filteredModules = useMemo(() => {
        if (!globalSearch.trim()) return initialModules;
        const q = globalSearch.toLowerCase();
        return initialModules.filter((m: any) => m.name.toLowerCase().includes(q) || m.category?.toLowerCase().includes(q));
    }, [globalSearch, initialModules]);

    const isStrategist = role === 'Content Strategist' || role === 'CEO' || role === 'Admin';
    const isEditor = role === 'Editor';

    // For editor: show editor dashboard directly
    if (isEditor) {
        return (
            <div className="flex h-full bg-gray-50/50">
                {/* Mini sidebar for editor */}
                <div className="w-[52px] bg-white border-r flex flex-col items-center py-4 gap-3 shrink-0">
                    <button onClick={() => { setActiveView('dashboard'); setSelectedModuleId(null); }}
                        className={`p-2.5 rounded-lg transition-colors ${activeView === 'dashboard' ? 'bg-red-50 text-red-600' : 'text-gray-400 hover:text-gray-700 hover:bg-gray-50'}`}
                        title="My Tasks">
                        <LayoutDashboard className="w-5 h-5" />
                    </button>
                    <button onClick={() => { setActiveView('calendar'); setSelectedModuleId(null); }}
                        className={`p-2.5 rounded-lg transition-colors ${activeView === 'calendar' ? 'bg-red-50 text-red-600' : 'text-gray-400 hover:text-gray-700 hover:bg-gray-50'}`}
                        title="Calendar">
                        <Calendar className="w-5 h-5" />
                    </button>
                </div>
                <div className="flex-1 overflow-hidden">
                    {activeView === 'calendar' ? (
                        <div className="p-5 h-full overflow-y-auto">
                            <CalendarTab items={initialItems} role={role} userId={userId} />
                        </div>
                    ) : (
                        <EditorDashboard items={initialItems} userId={userId} role={role} />
                    )}
                </div>
            </div>
        );
    }

    // Strategist / CEO / Admin Layout
    const handleModuleSelect = (moduleId: string) => {
        setSelectedModuleId(moduleId);
        setActiveView('module');
    };

    // Dashboard filter state for stat drilling
    const [dashFilter, setDashFilter] = useState<'all' | 'review' | 'urgent' | 'drafts' | 'active'>('all');
    const [dashSelectedItem, setDashSelectedItem] = useState<any>(null);
    const [dashToast, setDashToast] = useState<string | null>(null);

    // Dashboard stats
    const activeItems = initialItems.filter((i: any) => i.status !== 'published' && i.status !== 'archived');
    const pendingReviewItems = initialItems.filter((i: any) => ['review', 'in_review_l1', 'in_review_l2'].includes(i.status));
    const urgentItemsList = initialItems.filter((i: any) => (i.priority === 'Urgent' || i.priority === 'High') && !['published', 'scheduled', 'approved_l2', 'archived'].includes(i.status));
    const draftItems = initialItems.filter((i: any) => i.status === 'draft');

    // Toast dismiss
    useState(() => { if (dashToast) setTimeout(() => setDashToast(null), 3000); });

    // Drilled-down items
    const dashDisplayItems = dashFilter === 'review' ? pendingReviewItems
        : dashFilter === 'urgent' ? urgentItemsList
            : dashFilter === 'drafts' ? draftItems
                : dashFilter === 'active' ? activeItems
                    : [];

    // Module progress helpers
    const getModuleProgress = (moduleId: string) => {
        const moduleItems = initialItems.filter((i: any) => i.moduleId && (i.moduleId._id === moduleId || i.moduleId === moduleId));
        const total = moduleItems.length;
        if (total === 0) return { progress: 0, urgent: 0, total: 0 };
        const done = moduleItems.filter((i: any) => ['approved_l1', 'approved_l2', 'scheduled', 'published'].includes(i.status)).length;
        const urgent = moduleItems.filter((i: any) => i.priority === 'Urgent' || i.priority === 'High').length;
        return { progress: Math.round((done / total) * 100), urgent, total };
    };

    // Activity stream — only show OTHER people's comments (not your own)
    const globalActivity = initialItems
        .flatMap((item: any) =>
            (item.comments || [])
                .filter((c: any) => {
                    const commentUserId = c.userId?._id || c.userId;
                    return commentUserId !== userId; // Exclude current user's own comments
                })
                .map((c: any) => ({
                    ...c,
                    itemTitle: item.title,
                    itemStatus: item.status,
                }))
        )
        .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 10);

    const handleDashArchive = async (itemId: string, title: string) => {
        if (!confirm(`Archive "${title}"?`)) return;
        try {
            await archiveContentItem(itemId);
            setDashToast(`🗑️ "${title}" archived`);
            window.location.reload();
        } catch { setDashToast('Failed to archive'); }
    };

    const handleDashDelete = async (itemId: string, title: string) => {
        if (!confirm(`PERMANENTLY DELETE "${title}"? This cannot be undone.`)) return;
        try {
            await deleteContentItem(itemId);
            setDashToast(`❌ "${title}" deleted`);
            window.location.reload();
        } catch { setDashToast('Failed to delete'); }
    };

    return (
        <div className="flex h-full bg-gray-50/50">
            {/* Module Sidebar */}
            <div className="w-[240px] bg-white border-r flex flex-col shrink-0 overflow-hidden">
                {/* Nav Icons */}
                <div className="p-3 border-b space-y-1">
                    <button onClick={() => { setActiveView('dashboard'); setSelectedModuleId(null); }}
                        className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${activeView === 'dashboard' ? 'bg-red-50 text-red-600' : 'text-gray-600 hover:bg-gray-50'}`}>
                        <LayoutDashboard className="w-4 h-4" /> Dashboard
                    </button>
                    <button onClick={() => { setActiveView('calendar'); setSelectedModuleId(null); }}
                        className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${activeView === 'calendar' ? 'bg-red-50 text-red-600' : 'text-gray-600 hover:bg-gray-50'}`}>
                        <Calendar className="w-4 h-4" /> Calendar
                    </button>
                    <button onClick={() => { setActiveView('requests'); setSelectedModuleId(null); }}
                        className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${activeView === 'requests' ? 'bg-red-50 text-red-600' : 'text-gray-600 hover:bg-gray-50'}`}>
                        <Inbox className="w-4 h-4" /> Requests
                        {initialRequests.length > 0 && <span className="ml-auto px-1.5 py-0.5 text-[10px] rounded-full bg-red-100 text-red-600 font-bold">{initialRequests.length}</span>}
                    </button>
                </div>

                {/* Global Search */}
                <div className="px-3 py-2 border-b">
                    <div className="relative">
                        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search all content..."
                            className="w-full pl-8 pr-7 py-1.5 border rounded-lg text-xs bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 transition-all"
                            value={globalSearch}
                            onChange={e => setGlobalSearch(e.target.value)}
                        />
                        {globalSearch && (
                            <button onClick={() => setGlobalSearch('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                                <X className="w-3 h-3" />
                            </button>
                        )}
                    </div>
                    {/* Search Results Dropdown */}
                    {searchResults.length > 0 && (
                        <div className="mt-1.5 bg-white border rounded-lg shadow-lg max-h-[200px] overflow-y-auto divide-y">
                            {searchResults.map((item: any) => (
                                <button key={item._id} onClick={() => {
                                    const modId = item.moduleId?._id || item.moduleId;
                                    if (modId) { setSelectedModuleId(modId); setActiveView('module'); }
                                    setGlobalSearch('');
                                }} className="w-full text-left px-3 py-2 hover:bg-blue-50 transition-colors">
                                    <p className="text-xs font-medium text-gray-900 truncate">{item.title}</p>
                                    <p className="text-[9px] text-gray-400">{item.status?.replace(/_/g, ' ')} • {item.platform?.[0] || 'General'}</p>
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Module List */}
                <div className="flex-1 overflow-y-auto">
                    <div className="px-3 pt-3 pb-1 flex items-center justify-between">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Modules</span>
                        {isStrategist && (
                            <button onClick={() => setIsNewModuleOpen(true)} className="p-1 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded transition-colors" title="New Module">
                                <Plus className="w-3.5 h-3.5" />
                            </button>
                        )}
                    </div>
                    <div className="px-2 pb-4 space-y-0.5">
                        {filteredModules.length === 0 ? (
                            <p className="text-xs text-gray-400 px-2 py-3 italic">{globalSearch ? 'No matching modules.' : 'No modules yet.'}</p>
                        ) : (
                            filteredModules.map((mod: any) => {
                                const stats = getModuleProgress(mod._id);
                                const isSelected = activeView === 'module' && selectedModuleId === mod._id;
                                return (
                                    <div key={mod._id} className="group/mod relative">
                                        <button onClick={() => handleModuleSelect(mod._id)}
                                            className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all ${isSelected ? 'bg-red-50 text-red-700 font-semibold' : 'text-gray-700 hover:bg-gray-50'}`}>
                                            <div className="flex items-center justify-between">
                                                <span className="truncate text-xs font-medium">{mod.name}</span>
                                                <ChevronRight className={`w-3 h-3 shrink-0 transition-transform ${isSelected ? 'text-red-500 rotate-90' : 'text-gray-300'}`} />
                                            </div>
                                            <div className="mt-1.5 flex items-center gap-2">
                                                <div className="flex-1 h-1 bg-gray-100 rounded-full overflow-hidden">
                                                    <div className={`h-full rounded-full ${stats.progress >= 80 ? 'bg-green-400' : stats.progress >= 40 ? 'bg-blue-400' : 'bg-orange-300'}`} style={{ width: `${stats.progress}%` }} />
                                                </div>
                                                <span className="text-[9px] text-gray-400 shrink-0">{stats.progress}%</span>
                                            </div>
                                        </button>
                                        {/* Archive/Delete on hover */}
                                        {isStrategist && (
                                            <div className="absolute right-1 top-1 opacity-0 group-hover/mod:opacity-100 flex gap-0.5 transition-opacity">
                                                <button onClick={async (e) => { e.stopPropagation(); if (confirm(`Archive module "${mod.name}"?`)) { await archiveContentModule(mod._id); window.location.reload(); } }}
                                                    className="p-1 text-gray-400 hover:text-orange-600 hover:bg-orange-50 rounded" title="Archive Module">
                                                    <X className="w-3 h-3" />
                                                </button>
                                                {role === 'CEO' && (
                                                    <button onClick={async (e) => { e.stopPropagation(); if (confirm(`PERMANENTLY DELETE module "${mod.name}" and all its content? This cannot be undone.`)) { await deleteContentModule(mod._id); window.location.reload(); } }}
                                                        className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded" title="Delete Permanently">
                                                        <span className="text-[10px]">🗑</span>
                                                    </button>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 overflow-hidden flex flex-col relative">
                {/* Toast */}
                {dashToast && (
                    <div className="absolute top-3 right-3 z-50 px-4 py-2.5 rounded-lg shadow-lg text-sm font-medium bg-green-600 text-white animate-pulse">
                        {dashToast}
                    </div>
                )}

                {/* Dashboard View */}
                {activeView === 'dashboard' && (
                    <div className="flex-1 overflow-y-auto p-6 space-y-6">
                        {/* Header */}
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Content Command Center</h1>
                            <p className="text-sm text-gray-500">Production overview for {role} • Click stat cards to drill down</p>
                        </div>

                        {/* Stat Cards — Clickable */}
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                            {[
                                { key: 'review' as const, label: 'Pending Review', value: pendingReviewItems.length, icon: Clock, color: 'text-blue-600', bg: 'bg-blue-50 border-blue-100', activeBg: 'ring-2 ring-blue-400' },
                                { key: 'urgent' as const, label: 'Urgent Tasks', value: urgentItemsList.length, icon: AlertTriangle, color: 'text-red-600', bg: 'bg-red-50 border-red-100', activeBg: 'ring-2 ring-red-400' },
                                { key: 'drafts' as const, label: 'Drafts', value: draftItems.length, icon: Megaphone, color: 'text-gray-600', bg: 'bg-gray-50 border-gray-100', activeBg: 'ring-2 ring-gray-400' },
                                { key: 'active' as const, label: 'Total Active', value: activeItems.length, icon: Activity, color: 'text-green-600', bg: 'bg-green-50 border-green-100', activeBg: 'ring-2 ring-green-400' },
                            ].map(s => (
                                <button key={s.key} onClick={() => setDashFilter(dashFilter === s.key ? 'all' : s.key)}
                                    className={`rounded-xl border p-4 text-left transition-all hover:shadow-md ${s.bg} ${dashFilter === s.key ? s.activeBg + ' shadow-md scale-[1.02]' : ''}`}>
                                    <div className="flex items-center justify-between mb-2">
                                        <s.icon className={`w-5 h-5 ${s.color}`} />
                                        {dashFilter === s.key && <span className="text-[8px] font-bold text-gray-500 uppercase">Active</span>}
                                    </div>
                                    <p className={`text-3xl font-bold ${s.color}`}>{s.value}</p>
                                    <p className="text-xs font-medium text-gray-600 uppercase tracking-wider mt-1">{s.label}</p>
                                </button>
                            ))}
                        </div>

                        {/* Drilled-down Item List — shows when a stat card is clicked */}
                        {dashFilter !== 'all' && (
                            <div className="bg-white border rounded-xl shadow-sm overflow-hidden">
                                <div className="px-4 py-3 bg-gray-50 border-b flex justify-between items-center">
                                    <h3 className="text-sm font-bold text-gray-900">
                                        {dashFilter === 'review' ? '🕐 Pending Review' : dashFilter === 'urgent' ? '🔴 Urgent Tasks' : dashFilter === 'drafts' ? '📝 Drafts' : '⚡ All Active'}
                                        <span className="ml-2 text-xs font-normal text-gray-500">({dashDisplayItems.length} items)</span>
                                    </h3>
                                    <button onClick={() => setDashFilter('all')} className="text-xs text-gray-500 hover:text-gray-900 flex items-center gap-1">
                                        <X className="w-3 h-3" /> Close
                                    </button>
                                </div>
                                {dashDisplayItems.length === 0 ? (
                                    <p className="px-4 py-6 text-sm text-gray-400 text-center italic">Nothing here.</p>
                                ) : (
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="bg-gray-50/50 border-b">
                                                <th className="text-left py-2 px-4 text-[10px] font-semibold text-gray-500 uppercase">Title</th>
                                                <th className="text-left py-2 px-3 text-[10px] font-semibold text-gray-500 uppercase">Status</th>
                                                <th className="text-left py-2 px-3 text-[10px] font-semibold text-gray-500 uppercase">Priority</th>
                                                <th className="text-left py-2 px-3 text-[10px] font-semibold text-gray-500 uppercase">Editor</th>
                                                <th className="text-left py-2 px-3 text-[10px] font-semibold text-gray-500 uppercase">Module</th>
                                                <th className="text-right py-2 px-3 text-[10px] font-semibold text-gray-500 uppercase">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y">
                                            {dashDisplayItems.map((item: any) => (
                                                <tr key={item._id} className="hover:bg-blue-50/30 transition-colors group cursor-pointer" onClick={() => setDashSelectedItem(item)}>
                                                    <td className="py-2.5 px-4">
                                                        <span className="font-medium text-gray-900">{item.title}</span>
                                                        {item.brief?.objective && <p className="text-[10px] text-gray-400 truncate max-w-[200px]">{item.brief.objective}</p>}
                                                    </td>
                                                    <td className="py-2.5 px-3">
                                                        <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-gray-100 text-gray-600">{item.status?.replace(/_/g, ' ')}</span>
                                                    </td>
                                                    <td className="py-2.5 px-3 text-xs">{item.priority === 'Urgent' ? '🔴' : item.priority === 'High' ? '🟠' : item.priority === 'Medium' ? '🔵' : '🟢'} {item.priority}</td>
                                                    <td className="py-2.5 px-3 text-xs text-gray-600">{item.assignedEditorId?.name || '—'}</td>
                                                    <td className="py-2.5 px-3 text-xs text-gray-500">{item.moduleId?.name || '—'}</td>
                                                    <td className="py-2.5 px-3 text-right">
                                                        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <button onClick={e => { e.stopPropagation(); setDashSelectedItem(item); }}
                                                                className="px-2 py-1 text-[9px] font-bold text-blue-700 bg-blue-50 border border-blue-200 rounded hover:bg-blue-100" title="Open">
                                                                Open
                                                            </button>
                                                            <button onClick={e => { e.stopPropagation(); handleDashArchive(item._id, item.title); }}
                                                                className="px-1.5 py-1 text-[9px] font-bold text-gray-500 bg-gray-50 border rounded hover:bg-gray-100" title="Archive">
                                                                <X className="w-3 h-3 inline" />
                                                            </button>
                                                            {role === 'CEO' && (
                                                                <button onClick={e => { e.stopPropagation(); handleDashDelete(item._id, item.title); }}
                                                                    className="px-1.5 py-1 text-[9px] font-bold text-red-500 bg-red-50 border border-red-200 rounded hover:bg-red-100" title="Delete">
                                                                    🗑
                                                                </button>
                                                            )}
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                )}
                            </div>
                        )}

                        {/* Module Overview Grid */}
                        <div>
                            <h2 className="text-sm font-bold text-gray-900 mb-3 flex items-center">
                                <FolderOpen className="w-4 h-4 mr-1.5 text-gray-500" /> Module Overview
                            </h2>
                            {initialModules.length === 0 ? (
                                <div className="bg-white border rounded-xl p-6 text-center">
                                    <p className="text-sm text-gray-400 italic">No modules yet. Create one using the + button in the sidebar.</p>
                                </div>
                            ) : (
                                <div className="bg-white border rounded-xl overflow-hidden shadow-sm">
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="bg-gray-50 border-b">
                                                <th className="text-left py-2.5 px-4 text-xs font-semibold text-gray-500 uppercase">Module</th>
                                                <th className="text-center py-2.5 px-3 text-xs font-semibold text-gray-500 uppercase">Progress</th>
                                                <th className="text-center py-2.5 px-3 text-xs font-semibold text-gray-500 uppercase">Items</th>
                                                <th className="text-center py-2.5 px-3 text-xs font-semibold text-gray-500 uppercase">Urgent</th>
                                                <th className="py-2.5 px-2"></th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-50">
                                            {initialModules.map((mod: any) => {
                                                const stats = getModuleProgress(mod._id);
                                                return (
                                                    <tr key={mod._id} className="hover:bg-blue-50/30 cursor-pointer transition-colors group" onClick={() => handleModuleSelect(mod._id)}>
                                                        <td className="py-3 px-4">
                                                            <span className="font-medium text-gray-900">{mod.name}</span>
                                                            <span className="ml-2 text-[10px] text-gray-400">{mod.category}</span>
                                                        </td>
                                                        <td className="py-3 px-3">
                                                            <div className="flex items-center gap-2 justify-center">
                                                                <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                                                    <div className={`h-full rounded-full ${stats.progress >= 80 ? 'bg-green-500' : stats.progress >= 40 ? 'bg-blue-500' : 'bg-orange-400'}`} style={{ width: `${stats.progress}%` }} />
                                                                </div>
                                                                <span className="text-xs font-bold text-gray-700">{stats.progress}%</span>
                                                            </div>
                                                        </td>
                                                        <td className="py-3 px-3 text-center text-xs text-gray-600">{stats.total}</td>
                                                        <td className="py-3 px-3 text-center">
                                                            {stats.urgent > 0 ? (
                                                                <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-red-100 text-red-700">{stats.urgent}</span>
                                                            ) : (
                                                                <span className="text-gray-300">—</span>
                                                            )}
                                                        </td>
                                                        <td className="py-3 px-2">
                                                            <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-blue-500 transition-colors" />
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>

                        {/* Workload Widget */}
                        <EditorWorkloadWidget items={initialItems} users={initialUsers} />

                        {/* Global Activity Stream */}
                        <div>
                            <h2 className="text-sm font-bold text-gray-900 mb-3 flex items-center">
                                <Activity className="w-4 h-4 mr-1.5 text-blue-500" /> Latest Activity
                            </h2>
                            {globalActivity.length === 0 ? (
                                <p className="text-xs text-gray-400 italic">No activity recorded yet.</p>
                            ) : (
                                <div className="bg-white border rounded-xl divide-y shadow-sm">
                                    {globalActivity.map((entry: any, i: number) => (
                                        <div key={i} className="flex items-center gap-3 px-4 py-3">
                                            <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-[10px] font-bold shrink-0">
                                                {entry.userId?.name?.charAt(0) || 'U'}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-xs"><span className="font-semibold text-gray-900">{entry.userId?.name || 'User'}</span> <span className="text-gray-500">commented on</span> <span className="font-medium text-gray-800">{entry.itemTitle}</span></p>
                                                <p className="text-[10px] text-gray-400 truncate">{entry.text}</p>
                                            </div>
                                            <span className="text-[9px] text-gray-400 shrink-0">{new Date(entry.createdAt).toLocaleDateString()}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Module Workspace View */}
                {activeView === 'module' && selectedModuleId && (
                    <ModuleWorkspace
                        module={initialModules.find((m: any) => m._id === selectedModuleId)}
                        items={initialItems.filter((i: any) => i.moduleId && (i.moduleId._id === selectedModuleId || i.moduleId === selectedModuleId))}
                        onBack={() => { setActiveView('dashboard'); setSelectedModuleId(null); }}
                        role={role}
                        userId={userId}
                        allItems={initialItems}
                    />
                )}

                {/* Calendar View */}
                {activeView === 'calendar' && (
                    <div className="flex-1 overflow-y-auto p-6">
                        <CalendarTab items={initialItems} role={role} userId={userId} />
                    </div>
                )}

                {/* Requests View */}
                {activeView === 'requests' && (
                    <div className="flex-1 overflow-y-auto p-6">
                        <RequestsTab requests={initialRequests} role={role} />
                    </div>
                )}
            </div>

            {/* CEO Quick Command */}
            {role === 'CEO' && <CEOQuickCommand userId={userId} />}

            {/* New Module Modal */}
            {isNewModuleOpen && <NewModuleModal onClose={() => setIsNewModuleOpen(false)} />}

            {/* Dashboard Drill-down Side Panel */}
            {dashSelectedItem && (
                <TaskSidePanel
                    item={dashSelectedItem}
                    onClose={() => setDashSelectedItem(null)}
                    onSuccess={() => { setDashSelectedItem(null); window.location.reload(); }}
                    role={role}
                    userId={userId}
                />
            )}
        </div>
    );
}
