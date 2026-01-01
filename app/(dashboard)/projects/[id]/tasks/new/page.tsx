"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { use } from "react";

export default function NewTaskPage(props: { params: Promise<{ id: string }> }) {
    const router = useRouter();
    const params = use(props.params);
    const { id: projectId } = params;
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setLoading(true);
        setError("");

        const formData = new FormData(e.currentTarget);
        const data = {
            project: projectId,
            title: formData.get("title"),
            description: formData.get("description"),
            assignee: formData.get("assignee"),
            status: "To Do",
        };

        try {
            const res = await fetch("/api/tasks", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });

            const result = await res.json();
            if (!res.ok) throw new Error(result.error || "Failed to create task");

            router.push(`/projects/${projectId}`);
            router.refresh();
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow-sm border border-gray-200">
            <h1 className="text-2xl font-bold mb-6">Add New Task</h1>
            {error && <div className="p-3 mb-4 bg-red-50 text-red-600 rounded">{error}</div>}
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Task Title</label>
                    <input name="title" required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Description</label>
                    <textarea name="description" rows={3} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Assignee (Email)</label>
                    <input name="assignee" type="email" placeholder="Optional" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2" />
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                    <button type="button" onClick={() => router.back()} className="px-4 py-2 text-gray-700 hover:bg-gray-50 border rounded-md">Cancel</button>
                    <button type="submit" disabled={loading} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50">
                        {loading ? "Adding..." : "Add Task"}
                    </button>
                </div>
            </form>
        </div>
    );
}
