"use client";

import { useState } from "react";
import { createContent } from "@/lib/actions/content";
import { X, Loader2 } from "lucide-react";

export default function NewContentModal({
    onClose,
    onSuccess,
    prefilledModuleId
}: {
    onClose: () => void,
    onSuccess: () => void,
    prefilledModuleId?: string
}) {
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        title: "",
        vertical: "Social"
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            await createContent({
                title: formData.title,
                vertical: formData.vertical,
                status: 'draft',
                ...(prefilledModuleId && { moduleId: prefilledModuleId })
            });
            onSuccess();
        } catch (error) {
            console.error("Failed to create content", error);
            alert("Error creating content item");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
                <div className="flex justify-between items-center p-4 border-b">
                    <h2 className="text-lg font-bold text-gray-900">
                        {prefilledModuleId ? "Add Idea to Stack" : "New Content Draft"}
                    </h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-4 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Content Title / Concept</label>
                        <input
                            required
                            type="text"
                            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-gray-50 hover:bg-white transition-colors"
                            placeholder="e.g. Q3 Launch Promo Video"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        />
                    </div>

                    {!prefilledModuleId && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Vertical / Category</label>
                            <select
                                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 bg-gray-50 hover:bg-white transition-colors"
                                value={formData.vertical}
                                onChange={(e) => setFormData({ ...formData, vertical: e.target.value })}
                            >
                                <option value="Social">Social Media</option>
                                <option value="Events">Event Promos</option>
                                <option value="Academy">Academy Content</option>
                                <option value="Founder">Founder Personal Brand</option>
                                <option value="Sponsor">Partner / Sponsor Assets</option>
                                <option value="Title-sponsor">Title Sponsor Premium</option>
                            </select>
                            <p className="mt-1 text-xs text-gray-500">
                                The vertical determines the approval flow and CEO escalation requirements.
                            </p>
                        </div>
                    )}

                    <div className="flex justify-end gap-3 pt-4 border-t">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 border rounded-lg transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isLoading || !formData.title}
                            className="px-5 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg flex items-center transition-all disabled:opacity-50"
                        >
                            {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                            {prefilledModuleId ? 'Add to Stack' : 'Create Draft'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
