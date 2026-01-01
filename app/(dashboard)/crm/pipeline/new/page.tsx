"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function NewDealPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setLoading(true);
        setError("");

        const formData = new FormData(e.currentTarget);
        const data = {
            title: formData.get("title"),
            value: Number(formData.get("value")),
            accountName: formData.get("accountName"),
            contactPerson: formData.get("contactPerson"),
            priority: formData.get("priority"),
            expectedCloseDate: formData.get("expectedCloseDate"),
            source: formData.get("source"),
            status: "Lead",
        };

        try {
            const res = await fetch("/api/crm/leads", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });

            if (!res.ok) throw new Error("Failed to create deal");

            router.push("/crm/pipeline");
            router.refresh();
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow-sm border border-gray-200">
            <h1 className="text-2xl font-bold mb-6">Create New Deal</h1>
            {error && <div className="p-3 mb-4 bg-red-50 text-red-600 rounded">{error}</div>}
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                        <label className="block text-sm font-medium text-gray-700">Deal Name</label>
                        <input name="title" required placeholder="e.g. Q4 Software Contract" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2" />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Account / Company</label>
                        <input name="accountName" placeholder="Acme Corp" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2" />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Contact Person</label>
                        <input name="contactPerson" placeholder="John Doe" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2" />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Estimated Value ($)</label>
                        <input name="value" type="number" required placeholder="0.00" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2" />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Priority</label>
                        <select name="priority" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2">
                            <option value="Medium">Medium</option>
                            <option value="High">High</option>
                            <option value="Low">Low</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Expected Close Date</label>
                        <input name="expectedCloseDate" type="date" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2" />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Source</label>
                        <select name="source" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2">
                            <option value="Other">Other</option>
                            <option value="Referral">Referral</option>
                            <option value="Cold Outreach">Cold Outreach</option>
                            <option value="Event">Event</option>
                            <option value="Website">Website</option>
                            <option value="Partner">Partner</option>
                        </select>
                    </div>
                </div>

                <div className="flex justify-end space-x-3 pt-4 border-t mt-6">
                    <button type="button" onClick={() => router.back()} className="px-4 py-2 text-gray-700 hover:bg-gray-50 border rounded-md">Cancel</button>
                    <button type="submit" disabled={loading} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50">
                        {loading ? "Creating..." : "Create Deal"}
                    </button>
                </div>
            </form>
        </div>
    );
}
