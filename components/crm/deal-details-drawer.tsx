"use client";

import { useState, useEffect } from "react";
import { X, Send, User, Calendar, DollarSign, Tag, Briefcase } from "lucide-react";

interface DealDetailsDrawerProps {
    dealId: string | null;
    onClose: () => void;
}

export default function DealDetailsDrawer({ dealId, onClose }: DealDetailsDrawerProps) {
    const [deal, setDeal] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [note, setNote] = useState("");
    const [activeTab, setActiveTab] = useState<"overview" | "timeline">("overview");

    useEffect(() => {
        if (dealId) {
            fetchDeal(dealId);
        } else {
            setDeal(null);
        }
    }, [dealId]);

    const fetchDeal = async (id: string) => {
        setLoading(true);
        try {
            // We might need a specific GET /api/crm/leads/[id] or just filter from list if we had it.
            // But fetching fresh is safer for logs.
            // For now, assuming we use the general GET with filter or a new GET by ID.
            // Let's assume we implement GET /api/crm/leads/[id] later or use a query param.
            // Actually, we haven't implemented GET /ids yet.
            // I'll simulate or I should quickly add GET /api/crm/leads/[id]... 
            // Or I can just fetch all and find (inefficient).
            // Better: update valid GET route to handle single ID.

            // Temporary: Fetch list and find (Update this to proper ID fetch later for perf)
            const res = await fetch(`/api/crm/leads?id=${id}`);
            // NOTE: The current route doesn't strictly support ID filtering yet, I will add it.
            const data = await res.json();
            // If API returns array:
            if (Array.isArray(data)) {
                setDeal(data.find((d: any) => d._id === id));
            } else {
                setDeal(data);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddNote = async () => {
        if (!note.trim()) return;
        // API call to add note would go here
        // await fetch(`/api/crm/leads/${dealId}/notes`, ...);

        // Optimistic update
        const newNote = { content: note, createdAt: new Date(), author: { name: "You" } };
        setDeal((prev: any) => ({ ...prev, notes: [newNote, ...(prev.notes || [])] }));
        setNote("");
    };

    if (!dealId) return null;

    return (
        <div className="fixed inset-y-0 right-0 w-96 bg-white shadow-2xl transform transition-transform border-l border-gray-200 z-50 flex flex-col">
            {loading ? (
                <div className="flex items-center justify-center h-full">Loading...</div>
            ) : deal ? (
                <>
                    {/* Header */}
                    <div className="p-6 border-b border-gray-100 flex justify-between items-start">
                        <div>
                            <h2 className="text-xl font-bold text-gray-900">{deal.title}</h2>
                            <p className="text-sm text-gray-500 mt-1">{deal.accountName}</p>
                        </div>
                        <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                            <X className="w-6 h-6" />
                        </button>
                    </div>

                    {/* Stats Bar */}
                    <div className="flex border-b border-gray-100 divide-x divide-gray-100 bg-gray-50">
                        <div className="flex-1 p-3 text-center">
                            <div className="text-xs text-gray-400 uppercase tracking-widest">Value</div>
                            <div className="font-semibold text-gray-900">
                                {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(deal.value)}
                            </div>
                        </div>
                        <div className="flex-1 p-3 text-center">
                            <div className="text-xs text-gray-400 uppercase tracking-widest">Status</div>
                            <div className="font-semibold text-blue-600">{deal.status}</div>
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="flex border-b border-gray-200">
                        <button
                            onClick={() => setActiveTab("overview")}
                            className={`flex-1 py-3 text-sm font-medium ${activeTab === "overview" ? "text-blue-600 border-b-2 border-blue-600" : "text-gray-500 hover:text-gray-700"}`}
                        >
                            Overview
                        </button>
                        <button
                            onClick={() => setActiveTab("timeline")}
                            className={`flex-1 py-3 text-sm font-medium ${activeTab === "timeline" ? "text-blue-600 border-b-2 border-blue-600" : "text-gray-500 hover:text-gray-700"}`}
                        >
                            Activity
                        </button>
                    </div>

                    {/* Content */}
                    <div className="flex-1 overflow-y-auto p-6">
                        {activeTab === "overview" ? (
                            <div className="space-y-6">
                                <div className="space-y-4">
                                    <div className="flex items-center text-sm text-gray-600">
                                        <Briefcase className="w-4 h-4 mr-3 text-gray-400" />
                                        <span className="w-24 font-medium">Priority</span>
                                        <span className={`px-2 py-0.5 rounded text-xs border ${deal.priority === 'High' ? 'bg-red-50 text-red-700 border-red-200' : 'bg-gray-50 text-gray-600 border-gray-200'
                                            }`}>{deal.priority}</span>
                                    </div>
                                    <div className="flex items-center text-sm text-gray-600">
                                        <User className="w-4 h-4 mr-3 text-gray-400" />
                                        <span className="w-24 font-medium">Contact</span>
                                        <span>{deal.contactPerson || "N/A"}</span>
                                    </div>
                                    <div className="flex items-center text-sm text-gray-600">
                                        <Calendar className="w-4 h-4 mr-3 text-gray-400" />
                                        <span className="w-24 font-medium">Close Date</span>
                                        <span>{deal.expectedCloseDate ? new Date(deal.expectedCloseDate).toLocaleDateString() : "N/A"}</span>
                                    </div>
                                    <div className="flex items-center text-sm text-gray-600">
                                        <Tag className="w-4 h-4 mr-3 text-gray-400" />
                                        <span className="w-24 font-medium">Source</span>
                                        <span>{deal.source || "N/A"}</span>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                {/* Note Input */}
                                <div className="space-y-2">
                                    <textarea
                                        value={note}
                                        onChange={(e) => setNote(e.target.value)}
                                        placeholder="Add a note..."
                                        className="w-full text-sm border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 min-h-[80px]"
                                    />
                                    <div className="flex justify-end">
                                        <button onClick={handleAddNote} className="px-3 py-1.5 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 flex items-center">
                                            <Send className="w-3 h-3 mr-1" /> Post
                                        </button>
                                    </div>
                                </div>

                                {/* Activity Stream */}
                                <div className="space-y-4 pt-4 border-t border-gray-100">
                                    {deal.notes?.map((n: any, i: number) => (
                                        <div key={i} className="flex space-x-3">
                                            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-xs font-bold shrink-0">
                                                {n.author?.name?.[0] || "U"}
                                            </div>
                                            <div>
                                                <div className="bg-gray-50 p-3 rounded-lg text-sm text-gray-800">
                                                    {n.content}
                                                </div>
                                                <div className="text-xs text-gray-400 mt-1 ml-1">
                                                    {new Date(n.createdAt).toLocaleString()}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                    {(!deal.notes || deal.notes.length === 0) && (
                                        <div className="text-center text-gray-400 text-sm py-8">No activity yet.</div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </>
            ) : (
                <div className="flex items-center justify-center h-full">Deal not found</div>
            )}
        </div>
    );
}
