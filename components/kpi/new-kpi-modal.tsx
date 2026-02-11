"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Plus, Search } from "lucide-react";

export default function NewKPIModal({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [users, setUsers] = useState<any[]>([]);
    const [owner, setOwner] = useState("");
    const [search, setSearch] = useState("");

    useEffect(() => {
        if (isOpen) {
            fetch("/api/admin/users?role=all")
                .then(res => res.json())
                .then(data => {
                    if (Array.isArray(data)) {
                        setUsers(data);
                    } else {
                        setUsers(data.users || []);
                    }
                })
                .catch(err => console.error("Failed to fetch users", err));
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const filteredUsers = users.filter((u: any) =>
        (u.name?.toLowerCase() || "").includes(search.toLowerCase()) ||
        (u.role?.toLowerCase() || "").includes(search.toLowerCase())
    );

    async function handleSubmit(e: any) {
        e.preventDefault();
        setLoading(true);
        const formData = new FormData(e.target);
        const data = {
            title: formData.get("title"),
            metricType: formData.get("metricType"),
            target: formData.get("target"),
            period: formData.get("period"),
            owner: owner || undefined // Send selected owner
        };

        await fetch("/api/kpi", {
            method: "POST",
            body: JSON.stringify(data)
        });

        setLoading(false);
        onClose();
        router.refresh();
    }

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md border border-gray-200">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold">Set New KPI</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">×</button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Title</label>
                        <input name="title" required className="w-full border rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="e.g. Daily Sales Calls" />
                    </div>

                    {/* Owner Selection */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Assign Owner (Optional)</label>
                        <div className="relative">
                            <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search owner..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full border rounded-lg pl-9 p-2.5 mb-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                        </div>
                        {search && (
                            <div className="max-h-32 overflow-y-auto border rounded-lg mb-2">
                                {filteredUsers.map((u: any) => (
                                    <div
                                        key={u._id}
                                        onClick={() => { setOwner(u._id); setSearch(""); }}
                                        className="p-2 hover:bg-gray-100 cursor-pointer text-sm flex items-center"
                                    >
                                        <div className="w-6 h-6 rounded-full bg-gray-200 mr-2 overflow-hidden">
                                            <img src={u.image || `https://ui-avatars.com/api/?name=${u.name}`} alt="" />
                                        </div>
                                        <span>{u.name} ({u.role})</span>
                                    </div>
                                ))}
                            </div>
                        )}
                        {owner && (
                            <div className="flex items-center justify-between p-2 bg-blue-50 text-blue-700 rounded-lg text-sm border border-blue-200">
                                <span className="font-medium">Selected: {users.find(u => u._id === owner)?.name}</span>
                                <button type="button" onClick={() => setOwner("")} className="text-blue-500 hover:text-blue-700">Change</button>
                            </div>
                        )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium">Metric Type</label>
                            <select name="metricType" className="w-full border rounded-lg p-2.5">
                                <option value="Count">Count</option>
                                <option value="Revenue">Revenue</option>
                                <option value="Percentage">Percentage</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium">Target</label>
                            <input name="target" type="number" required className="w-full border rounded-lg p-2.5" />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium">Period</label>
                        <select name="period" className="w-full border rounded-lg p-2.5">
                            <option value="Daily">Daily</option>
                            <option value="Weekly">Weekly</option>
                            <option value="Monthly">Monthly</option>
                        </select>
                    </div>
                    <div className="flex justify-end space-x-2 pt-4">
                        <button type="button" onClick={onClose} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">Cancel</button>
                        <button type="submit" disabled={loading} className="px-6 py-2 bg-black text-white font-bold rounded-lg hover:bg-gray-800">
                            {loading ? "Creating..." : "Set KPI"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
