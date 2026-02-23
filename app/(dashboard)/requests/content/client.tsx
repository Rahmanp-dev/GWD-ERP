"use client";

import { useState } from "react";
import { submitContentRequest } from "@/lib/actions/content-command";
import { Send, Loader2 } from "lucide-react";
import { useSession } from "next-auth/react";

export default function ContentRequestClient() {
    const { data: session } = useSession();
    const [isLoading, setIsLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const [formData, setFormData] = useState({
        title: "",
        moduleCategory: "General",
        urgency: "Standard",
        deadline: "",
        platform: "General",
        objective: "",
        referenceUrl: "",
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!session?.user) {
            alert("No user session found");
            return;
        }

        setIsLoading(true);
        try {
            await submitContentRequest({
                ...formData,
                requestedById: (session.user as any).id
            });
            setSuccess(true);
            setFormData({
                title: "", moduleCategory: "General", urgency: "Standard", deadline: "", platform: "General", objective: "", referenceUrl: ""
            });
            setTimeout(() => setSuccess(false), 5000);
        } catch (error) {
            console.error(error);
            alert("Failed to submit request");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border p-6">
            {success ? (
                <div className="p-8 text-center bg-green-50 rounded-xl border border-green-200 text-green-800">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Send className="w-8 h-8 text-green-600" />
                    </div>
                    <h3 className="text-xl font-bold mb-2">Request Submitted!</h3>
                    <p>The content strategy team has received your brief and will review it shortly. It will appear in your timeline once converted to a production task.</p>
                    <button
                        onClick={() => setSuccess(false)}
                        className="mt-6 px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
                    >
                        Submit Another Request
                    </button>
                </div>
            ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Request Title *</label>
                            <input
                                required
                                className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-gray-50 hover:bg-white transition-colors"
                                placeholder="e.g. Highlight reel for yesterday's workshop"
                                value={formData.title}
                                onChange={e => setFormData({ ...formData, title: e.target.value })}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Campaign / Category</label>
                            <select
                                className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-red-500 bg-gray-50 hover:bg-white transition-colors"
                                value={formData.moduleCategory}
                                onChange={e => setFormData({ ...formData, moduleCategory: e.target.value })}
                            >
                                <option>General</option>
                                <option>Event</option>
                                <option>Academy</option>
                                <option>Sales Target</option>
                                <option>Recruitment</option>
                            </select>
                            <p className="text-xs text-gray-500 mt-2">Which department or campaign does this belong to?</p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Urgency Level</label>
                            <select
                                className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-red-500 bg-gray-50 hover:bg-white transition-colors"
                                value={formData.urgency}
                                onChange={e => setFormData({ ...formData, urgency: e.target.value })}
                            >
                                <option>Standard</option>
                                <option>High</option>
                                <option>ASAP</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Action Deadline</label>
                            <input
                                type="date"
                                className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-red-500 bg-gray-50 hover:bg-white transition-colors"
                                value={formData.deadline}
                                onChange={e => setFormData({ ...formData, deadline: e.target.value })}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Target Platform</label>
                            <select
                                className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-red-500 bg-gray-50 hover:bg-white transition-colors"
                                value={formData.platform}
                                onChange={e => setFormData({ ...formData, platform: e.target.value })}
                            >
                                <option>General / Multi-platform</option>
                                <option>Instagram Reel</option>
                                <option>YouTube Longform</option>
                                <option>LinkedIn Post</option>
                                <option>Website Hero</option>
                                <option>Print Media</option>
                            </select>
                        </div>

                        <div className="md:col-span-2 border-t pt-6">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Objective & Brief *</label>
                            <textarea
                                required
                                rows={4}
                                className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-red-500 bg-gray-50 hover:bg-white transition-colors"
                                placeholder="What is the goal of this content? Who is the audience? Please provide as much context as possible."
                                value={formData.objective}
                                onChange={e => setFormData({ ...formData, objective: e.target.value })}
                            />
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Reference URL (Optional)</label>
                            <input
                                type="url"
                                className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-red-500 bg-gray-50 hover:bg-white transition-colors"
                                placeholder="https://example.com/inspiration"
                                value={formData.referenceUrl}
                                onChange={e => setFormData({ ...formData, referenceUrl: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="pt-6 border-t flex justify-end">
                        <button
                            type="submit"
                            disabled={isLoading || !formData.title || !formData.objective}
                            className="flex items-center px-8 py-3 bg-red-600 hover:bg-red-700 text-white font-medium rounded-xl transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:shadow-none"
                        >
                            {isLoading ? <Loader2 className="w-5 h-5 mr-3 animate-spin" /> : <Send className="w-5 h-5 mr-3" />}
                            Submit to Strategist Inbox
                        </button>
                    </div>
                </form>
            )}
        </div>
    );
}
