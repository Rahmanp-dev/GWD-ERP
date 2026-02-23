"use client";

import { useState } from "react";
import { submitContentRequest } from "@/lib/actions/content-command";
import { Command, Send, Loader2 } from "lucide-react";

export default function CEOQuickCommand({ userId }: { userId: string }) {
    const [command, setCommand] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleCommandSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!command.trim()) return;
        setIsLoading(true);

        try {
            await submitContentRequest({
                title: command,
                objective: "Auto-generated from CEO Command Panel",
                moduleCategory: "General",
                urgency: "High",
                requestedById: userId,
            });
            setCommand("");
        } catch (error) {
            console.error(error);
            alert("Failed to send command.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed bottom-6 right-6 z-50">
            <div className="bg-gray-900 rounded-2xl shadow-2xl p-4 w-96 border border-gray-700">
                <div className="flex items-center text-white/50 text-xs mb-3 font-medium uppercase tracking-wider">
                    <Command className="w-3.5 h-3.5 mr-1" />
                    CEO Quick Command
                </div>
                <form onSubmit={handleCommandSubmit} className="relative">
                    <input
                        className="w-full bg-gray-800 text-white placeholder-gray-500 border border-gray-700 focus:border-red-500 focus:ring-1 focus:ring-red-500 rounded-xl py-3 pl-4 pr-12 outline-none text-sm transition-all"
                        placeholder="e.g. Create teaser for speed build event"
                        value={command}
                        onChange={(e) => setCommand(e.target.value)}
                        disabled={isLoading}
                    />
                    <button
                        type="submit"
                        disabled={isLoading || !command.trim()}
                        className="absolute right-2 top-2 p-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors disabled:opacity-50"
                    >
                        {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    </button>
                </form>
            </div>
        </div>
    );
}
