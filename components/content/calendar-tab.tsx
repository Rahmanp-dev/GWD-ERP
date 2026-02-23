"use client";

import { useState, useMemo } from "react";
import { format, addMonths, subMonths, startOfMonth, endOfMonth, startOfWeek, endOfWeek, isSameMonth, isSameDay, addDays } from "date-fns";
import { ChevronLeft, ChevronRight, MonitorPlay, FileText, Image as ImageIcon, Filter, X, Flag } from "lucide-react";
import TaskSidePanel from "./task-side-panel";

export default function CalendarTab({ items, role, userId }: { items: any[]; role?: string; userId?: string }) {
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [filterModule, setFilterModule] = useState('all');
    const [filterPriority, setFilterPriority] = useState('all');
    const [filterPlatform, setFilterPlatform] = useState('all');
    const [filterEditor, setFilterEditor] = useState('all');
    const [selectedItem, setSelectedItem] = useState<any>(null);
    const [hoveredDay, setHoveredDay] = useState<string | null>(null);

    const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
    const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

    // Extract filter options
    const modules = useMemo(() => {
        const set = new Set<string>();
        items.forEach(i => { if (i.moduleId?.name) set.add(i.moduleId.name); });
        return Array.from(set);
    }, [items]);

    const editors = useMemo(() => {
        const map = new Map<string, string>();
        items.forEach(i => { if (i.assignedEditorId?.name) map.set(i.assignedEditorId._id, i.assignedEditorId.name); });
        return Array.from(map.entries());
    }, [items]);

    const platforms = useMemo(() => {
        const set = new Set<string>();
        items.forEach(i => { if (i.platform?.[0]) set.add(i.platform[0]); });
        return Array.from(set);
    }, [items]);

    // Apply filters
    const filteredItems = useMemo(() => {
        return items.filter(item => {
            if (item.status === 'archived') return false;
            if (filterModule !== 'all' && item.moduleId?.name !== filterModule) return false;
            if (filterPriority !== 'all' && item.priority !== filterPriority) return false;
            if (filterPlatform !== 'all' && !item.platform?.includes(filterPlatform)) return false;
            if (filterEditor !== 'all' && (item.assignedEditorId?._id || item.assignedEditorId) !== filterEditor) return false;
            return true;
        });
    }, [items, filterModule, filterPriority, filterPlatform, filterEditor]);

    const getPlatformIcon = (platform: string) => {
        if (!platform) return <FileText className="w-2.5 h-2.5 mr-0.5 shrink-0" />;
        const p = platform.toLowerCase();
        if (p.includes('youtube') || p.includes('video') || p.includes('reel')) return <MonitorPlay className="w-2.5 h-2.5 mr-0.5 shrink-0" />;
        if (p.includes('instagram') || p.includes('linkedin') || p.includes('post')) return <ImageIcon className="w-2.5 h-2.5 mr-0.5 shrink-0" />;
        return <FileText className="w-2.5 h-2.5 mr-0.5 shrink-0" />;
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'published': return 'bg-green-100 text-green-800 border-green-200 hover:bg-green-200';
            case 'scheduled': return 'bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-200';
            case 'editing': return 'bg-purple-100 text-purple-800 border-purple-200 hover:bg-purple-200';
            case 'draft': return 'bg-gray-100 text-gray-800 border-gray-200 hover:bg-gray-200';
            case 'revision': return 'bg-orange-100 text-orange-800 border-orange-200 hover:bg-orange-200';
            default: return 'bg-yellow-100 text-yellow-800 border-yellow-200 hover:bg-yellow-200';
        }
    };

    const getPriorityDot = (priority: string) => {
        switch (priority) {
            case 'Urgent': return 'bg-red-500';
            case 'High': return 'bg-orange-500';
            default: return '';
        }
    };

    // Build calendar grid
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart, { weekStartsOn: 1 });
    const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });

    const rows = [];
    let days = [];
    let day = startDate;

    while (day <= endDate) {
        for (let i = 0; i < 7; i++) {
            const formattedDate = format(day, "d");
            const cloneDay = day;
            const dayKey = format(day, 'yyyy-MM-dd');
            const dayItems = filteredItems.filter(item => isSameDay(new Date(item.updatedAt), cloneDay));
            const isToday = isSameDay(day, new Date());
            const isHovered = hoveredDay === dayKey;

            days.push(
                <div
                    key={day.toISOString()}
                    onMouseEnter={() => setHoveredDay(dayKey)}
                    onMouseLeave={() => setHoveredDay(null)}
                    className={`min-h-[100px] border border-gray-100 p-1.5 flex flex-col transition-all ${!isSameMonth(day, monthStart)
                        ? "bg-gray-50/40 text-gray-400"
                        : isToday
                            ? "bg-blue-50/40 ring-1 ring-blue-200 ring-inset"
                            : isHovered
                                ? "bg-blue-50/20"
                                : "bg-white"
                        }`}
                >
                    <div className="flex justify-between items-center mb-1">
                        <span className={`text-[10px] font-semibold ${isToday ? 'bg-blue-600 text-white rounded-full w-5 h-5 flex items-center justify-center' : 'text-gray-500'}`}>
                            {formattedDate}
                        </span>
                        {dayItems.length > 0 && (
                            <span className="text-[8px] text-gray-400 font-bold">{dayItems.length}</span>
                        )}
                    </div>
                    <div className="flex-1 overflow-y-auto space-y-0.5 custom-scrollbar">
                        {dayItems.map(item => {
                            const prDot = getPriorityDot(item.priority);
                            return (
                                <div key={item._id}
                                    onClick={(e) => { e.stopPropagation(); setSelectedItem(item); }}
                                    className={`text-[9px] px-1.5 py-1 rounded border ${getStatusColor(item.status)} cursor-pointer flex items-center shadow-sm group/cal transition-all hover:shadow-md`}
                                    title={`${item.title} (${item.status}) ${item.priority || ''}\n${item.assignedEditorId?.name || 'Unassigned'}`}>
                                    {prDot && <span className={`w-1.5 h-1.5 rounded-full ${prDot} mr-1 shrink-0`} />}
                                    {getPlatformIcon(item.platform?.[0] || '')}
                                    <span className="font-semibold truncate flex-1">{item.title}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            );
            day = addDays(day, 1);
        }
        rows.push(
            <div className="grid grid-cols-7 gap-px bg-gray-200" key={day.toISOString()}>
                {days}
            </div>
        );
        days = [];
    }

    const hasActiveFilters = filterModule !== 'all' || filterPriority !== 'all' || filterPlatform !== 'all' || filterEditor !== 'all';
    const refreshContent = () => window.location.reload();

    return (
        <div className="h-full flex flex-col bg-white rounded-xl shadow-sm border overflow-hidden">
            {/* Header */}
            <div className="p-3 border-b bg-gray-50/80">
                <div className="flex justify-between items-center mb-2.5">
                    <div>
                        <h2 className="text-base font-bold text-gray-900">Content Calendar</h2>
                        <p className="text-[10px] text-gray-500">{filteredItems.length} items {hasActiveFilters ? '(filtered)' : ''} • Click any item to open</p>
                    </div>
                    <div className="flex bg-white border rounded-lg overflow-hidden shadow-sm">
                        <button onClick={prevMonth} className="px-2 py-1.5 hover:bg-gray-50 text-gray-600 border-r"><ChevronLeft className="w-3.5 h-3.5" /></button>
                        <div className="px-3 py-1.5 font-bold text-xs text-gray-800 flex items-center min-w-[110px] justify-center">{format(currentMonth, "MMMM yyyy")}</div>
                        <button onClick={nextMonth} className="px-2 py-1.5 hover:bg-gray-50 text-gray-600 border-l"><ChevronRight className="w-3.5 h-3.5" /></button>
                    </div>
                </div>

                {/* Filter Bar */}
                <div className="flex items-center gap-1.5 flex-wrap">
                    <Filter className="w-3 h-3 text-gray-400" />
                    <select value={filterModule} onChange={e => setFilterModule(e.target.value)} className="px-2 py-1 border rounded text-[10px] bg-white">
                        <option value="all">All Modules</option>
                        {modules.map(m => <option key={m} value={m}>{m}</option>)}
                    </select>
                    <select value={filterEditor} onChange={e => setFilterEditor(e.target.value)} className="px-2 py-1 border rounded text-[10px] bg-white">
                        <option value="all">All Editors</option>
                        {editors.map(([id, name]) => <option key={id} value={id}>{name}</option>)}
                    </select>
                    <select value={filterPlatform} onChange={e => setFilterPlatform(e.target.value)} className="px-2 py-1 border rounded text-[10px] bg-white">
                        <option value="all">All Platforms</option>
                        {platforms.map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                    <select value={filterPriority} onChange={e => setFilterPriority(e.target.value)} className="px-2 py-1 border rounded text-[10px] bg-white">
                        <option value="all">All Priorities</option>
                        <option value="Urgent">🔴 Urgent</option>
                        <option value="High">🟠 High</option>
                        <option value="Medium">🔵 Medium</option>
                        <option value="Low">🟢 Low</option>
                    </select>
                    {hasActiveFilters && (
                        <button onClick={() => { setFilterModule('all'); setFilterPriority('all'); setFilterPlatform('all'); setFilterEditor('all'); }}
                            className="px-2 py-1 text-[9px] font-medium text-red-600 bg-red-50 border border-red-200 rounded hover:bg-red-100">Clear</button>
                    )}
                    <div className="ml-auto flex items-center gap-2 text-[9px] text-gray-500">
                        <span className="flex items-center"><span className="w-1.5 h-1.5 rounded-full bg-gray-400 mr-0.5"></span>Draft</span>
                        <span className="flex items-center"><span className="w-1.5 h-1.5 rounded-full bg-purple-500 mr-0.5"></span>Editing</span>
                        <span className="flex items-center"><span className="w-1.5 h-1.5 rounded-full bg-orange-400 mr-0.5"></span>Review</span>
                        <span className="flex items-center"><span className="w-1.5 h-1.5 rounded-full bg-blue-500 mr-0.5"></span>Scheduled</span>
                        <span className="flex items-center"><span className="w-1.5 h-1.5 rounded-full bg-green-500 mr-0.5"></span>Published</span>
                    </div>
                </div>
            </div>

            {/* Calendar Grid */}
            <div className="flex-1 flex flex-col p-2 bg-gray-50">
                <div className="bg-white border rounded-lg shadow-sm overflow-hidden flex-1 flex flex-col">
                    <div className="grid grid-cols-7 border-b bg-gray-50/80">
                        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(dayName => (
                            <div key={dayName} className="py-1.5 text-center text-[9px] font-bold text-gray-500 uppercase tracking-wider">{dayName}</div>
                        ))}
                    </div>
                    <div className="flex-1 overflow-y-auto bg-gray-200">{rows}</div>
                </div>
            </div>

            {/* Side Panel for clicked item */}
            {selectedItem && role && userId && (
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
