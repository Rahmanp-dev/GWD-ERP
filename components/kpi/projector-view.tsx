"use client";

import { useEffect, useState } from "react";
import { CheckCircle, Clock, AlertTriangle, BarChart3, Users, Flame } from "lucide-react";

export default function ProjectorPage() {
    const [time, setTime] = useState(new Date());
    const [stats, setStats] = useState<any>(null);

    useEffect(() => {
        const timer = setInterval(() => setTime(new Date()), 1000);

        const fetchData = async () => {
            try {
                const res = await fetch('/api/kpi/stats');
                const data = await res.json();
                setStats(data);
            } catch (e) {
                console.error(e);
            }
        };

        fetchData();
        const refresher = setInterval(fetchData, 30000);

        return () => {
            clearInterval(timer);
            clearInterval(refresher);
        };
    }, []);

    const totalPending = stats?.teamStats?.reduce((sum: number, m: any) => sum + m.pendingTasks, 0) || 0;
    const totalCompleted = stats?.teamStats?.reduce((sum: number, m: any) => sum + m.completedTasks, 0) || 0;

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-gray-100 text-gray-900 font-sans">
            {/* Top Bar */}
            <div className="bg-white border-b border-gray-200 px-8 py-4 flex justify-between items-center shadow-sm">
                <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-gray-900 rounded-lg flex items-center justify-center">
                        <BarChart3 className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-gray-900">
                            Task Accountability Board
                        </h1>
                        <p className="text-xs text-gray-500 uppercase tracking-widest font-semibold">GWD • Executive Task Tracker</p>
                    </div>
                </div>
                <div className="flex items-center space-x-8">
                    {/* Summary Counters */}
                    <div className="flex items-center space-x-6">
                        <div className="flex items-center space-x-2">
                            <div className="w-8 h-8 bg-red-50 rounded-lg flex items-center justify-center">
                                <AlertTriangle className="w-4 h-4 text-red-500" />
                            </div>
                            <div>
                                <p className="text-xl font-bold text-red-600 tabular-nums leading-none">{totalPending}</p>
                                <p className="text-[10px] text-gray-400 uppercase font-semibold">Pending</p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-2">
                            <div className="w-8 h-8 bg-green-50 rounded-lg flex items-center justify-center">
                                <CheckCircle className="w-4 h-4 text-green-500" />
                            </div>
                            <div>
                                <p className="text-xl font-bold text-green-600 tabular-nums leading-none">{totalCompleted}</p>
                                <p className="text-[10px] text-gray-400 uppercase font-semibold">Done Today</p>
                            </div>
                        </div>
                    </div>
                    <div className="text-right border-l border-gray-200 pl-6">
                        <p className="text-2xl font-mono font-bold text-gray-900 tabular-nums">{time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</p>
                        <p className="text-xs text-gray-500">{time.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</p>
                    </div>
                </div>
            </div>

            {/* Main Content — Card Grid */}
            <div className="p-6">
                {stats?.teamStats?.length === 0 && (
                    <div className="text-center py-20 text-gray-400">
                        <Users className="w-12 h-12 mx-auto mb-3 opacity-40" />
                        <p className="text-lg font-medium">No assigned tasks yet</p>
                        <p className="text-sm">Tasks assigned by executives will appear here</p>
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                    {stats?.teamStats?.map((member: any) => (
                        <div key={member._id} className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden hover:shadow-lg transition-shadow duration-300">
                            {/* Card Header — Person Info */}
                            <div className={`px-5 pt-5 pb-4 flex items-center justify-between ${member.pendingTasks > 0 ? 'border-l-4 border-l-orange-500' : 'border-l-4 border-l-green-500'}`}>
                                <div className="flex items-center space-x-3">
                                    <div className="relative">
                                        <img
                                            src={member.image || `https://ui-avatars.com/api/?name=${member.name}&background=e5e7eb&color=374151&bold=true&size=96`}
                                            className="w-12 h-12 rounded-full border-2 border-gray-100 shadow-sm"
                                        />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-900 text-lg leading-tight">{member.name}</h3>
                                        <p className="text-xs text-gray-500 uppercase tracking-widest font-semibold">{member.role}</p>
                                    </div>
                                </div>
                                {/* Status Badge */}
                                {member.pendingTasks > 0 ? (
                                    <div className="flex items-center space-x-1 bg-orange-50 border border-orange-200 text-orange-700 px-3 py-1.5 rounded-full">
                                        <Flame className="w-3.5 h-3.5" />
                                        <span className="text-xs font-bold">{member.pendingTasks} pending</span>
                                    </div>
                                ) : (
                                    <div className="flex items-center space-x-1 bg-green-50 border border-green-200 text-green-700 px-3 py-1.5 rounded-full">
                                        <CheckCircle className="w-3.5 h-3.5" />
                                        <span className="text-xs font-bold">All clear</span>
                                    </div>
                                )}
                            </div>

                            {/* Pending Tasks — Highlighted */}
                            {member.pendingTasksList?.length > 0 && (
                                <div className="px-5 py-3 bg-orange-50/50 border-t border-orange-100">
                                    <p className="text-[10px] uppercase tracking-widest font-bold text-orange-600 mb-2 flex items-center">
                                        <Clock className="w-3 h-3 mr-1" /> Pending Tasks
                                    </p>
                                    <div className="space-y-1.5">
                                        {member.pendingTasksList.map((task: any, i: number) => (
                                            <div key={i} className="flex items-center space-x-2 bg-white rounded-lg px-3 py-2 border border-orange-100 shadow-sm">
                                                <div className={`w-2 h-2 rounded-full flex-shrink-0 animate-pulse ${task.priority === 'Critical' ? 'bg-red-500' :
                                                        task.priority === 'High' ? 'bg-orange-500' :
                                                            'bg-yellow-400'
                                                    }`}></div>
                                                <span className="text-sm text-gray-800 flex-1 truncate font-medium">{task.title}</span>
                                                <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wide flex-shrink-0 ${task.priority === 'Critical' ? 'bg-red-100 text-red-700' :
                                                        task.priority === 'High' ? 'bg-orange-100 text-orange-700' :
                                                            'bg-yellow-50 text-yellow-700'
                                                    }`}>
                                                    {task.priority || 'Medium'}
                                                </span>
                                            </div>
                                        ))}
                                        {member.pendingTasks > 6 && (
                                            <p className="text-[10px] text-orange-400 font-medium pl-1">+ {member.pendingTasks - 6} more pending</p>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Completed Today — Green Section */}
                            {member.completedTasksList?.length > 0 && (
                                <div className="px-5 py-3 bg-green-50/30 border-t border-green-100">
                                    <p className="text-[10px] uppercase tracking-widest font-bold text-green-600 mb-2 flex items-center">
                                        <CheckCircle className="w-3 h-3 mr-1" /> Completed Today
                                    </p>
                                    <div className="space-y-1">
                                        {member.completedTasksList.map((task: any, i: number) => (
                                            <div key={i} className="flex items-center space-x-2 py-1 px-1">
                                                <CheckCircle className="w-3.5 h-3.5 text-green-500 flex-shrink-0" />
                                                <span className="text-sm text-green-700 line-through decoration-green-300 truncate">{task.title}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Card Footer — Progress Bar */}
                            <div className="px-5 py-3 border-t border-gray-100 bg-gray-50/50">
                                <div className="flex items-center justify-between text-xs mb-1.5">
                                    <span className="text-gray-500 font-medium">Today&apos;s Progress</span>
                                    <span className="font-bold text-gray-700">
                                        {member.completedTasks}/{member.pendingTasks + member.completedTasks} done
                                    </span>
                                </div>
                                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full rounded-full transition-all duration-1000 ${member.pendingTasks === 0 && member.completedTasks > 0
                                                ? 'bg-green-500'
                                                : member.completedTasks > 0
                                                    ? 'bg-blue-500'
                                                    : 'bg-orange-400'
                                            }`}
                                        style={{ width: `${(member.pendingTasks + member.completedTasks) > 0 ? (member.completedTasks / (member.pendingTasks + member.completedTasks)) * 100 : 0}%` }}
                                    ></div>
                                </div>
                            </div>
                        </div>
                    )) || (
                            <div className="col-span-full text-center py-16 text-gray-400">
                                <div className="animate-pulse">Loading team data...</div>
                            </div>
                        )}
                </div>
            </div>

            {/* Footer Bar */}
            <div className="fixed bottom-0 left-0 right-0 bg-gray-900 text-gray-400 px-8 py-2 flex justify-between items-center text-xs z-50">
                <span className="font-medium">GWD ERP • Accountability Board</span>
                <span className="flex items-center space-x-2">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                    <span>Live • Auto-refreshes every 30s</span>
                </span>
            </div>
        </div>
    );
}
