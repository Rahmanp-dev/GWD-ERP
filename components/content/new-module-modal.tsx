"use client";

import { useState } from "react";
import { createContentModule } from "@/lib/actions/content-command";
import { X, Loader2 } from "lucide-react";

export default function NewModuleModal({ onClose }: { onClose: () => void }) {
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        category: "Event",
        priority: "Medium",
        goal: "",
        audience: "",
        startDate: "",
        endDate: ""
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            await createContentModule(formData);
            onClose();
        } catch (error) {
            console.error(error);
            alert("Failed to create module");
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
                <div className="flex justify-between items-center p-4 border-b bg-gray-50">
                    <div>
                        <h2 className="text-lg font-bold text-gray-900">Create Content Module</h2>
                        <p className="text-xs text-gray-500">A module groups related content ideas together.</p>
                    </div>
                    <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Module Name *</label>
                        <input
                            required autoFocus
                            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                            placeholder="e.g. Behind The Build 2026"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                            <select
                                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-white"
                                value={formData.category}
                                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                            >
                                <option>Event</option>
                                <option>Academy</option>
                                <option>Branding</option>
                                <option>Sales</option>
                                <option>Other</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                            <select
                                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-white"
                                value={formData.priority}
                                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                            >
                                <option>Urgent</option>
                                <option>High</option>
                                <option>Medium</option>
                                <option>Low</option>
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 border-t pt-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                            <input
                                type="date"
                                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500"
                                value={formData.startDate}
                                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                            <input
                                type="date"
                                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500"
                                value={formData.endDate}
                                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="border-t pt-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Campaign Goal</label>
                        <input
                            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500"
                            placeholder="e.g. Generate 500 leads for Web Dev Course"
                            value={formData.goal}
                            onChange={(e) => setFormData({ ...formData, goal: e.target.value })}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Target Audience</label>
                        <input
                            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500"
                            placeholder="e.g. College final year students"
                            value={formData.audience}
                            onChange={(e) => setFormData({ ...formData, audience: e.target.value })}
                        />
                    </div>

                </form>

                <div className="p-4 border-t bg-gray-50 flex justify-end space-x-3">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border rounded-lg hover:bg-gray-50"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={isLoading || !formData.name}
                        className="flex items-center px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50"
                    >
                        {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : 'Create Module'}
                    </button>
                </div>
            </div>
        </div>
    );
}
