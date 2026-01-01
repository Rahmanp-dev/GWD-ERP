"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function TransactionForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const defaultType = searchParams.get("type") || "Revenue";

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setLoading(true);
        setError("");

        const formData = new FormData(e.currentTarget);
        const data = {
            description: formData.get("description"),
            amount: Number(formData.get("amount")),
            type: formData.get("type"), // Revenue or Expense
            category: formData.get("category"),
            date: formData.get("date"),
            status: "Completed",
        };

        try {
            const res = await fetch("/api/finance/transactions", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });

            if (!res.ok) throw new Error("Failed to record transaction");

            router.push("/finance");
            router.refresh();
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow-sm border border-gray-200">
            <h1 className="text-2xl font-bold mb-6">Record Transaction</h1>
            {error && <div className="p-3 mb-4 bg-red-50 text-red-600 rounded">{error}</div>}
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Description</label>
                    <input name="description" required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Type</label>
                        <select name="type" defaultValue={defaultType} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2">
                            <option value="Revenue">Revenue</option>
                            <option value="Expense">Expense</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Amount ($)</label>
                        <input name="amount" type="number" step="0.01" required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2" />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Category</label>
                        <select name="category" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2">
                            <option value="Sales">Sales</option>
                            <option value="Service">Service</option>
                            <option value="Salary">Salary</option>
                            <option value="Rent">Rent</option>
                            <option value="Utilities">Utilities</option>
                            <option value="Software">Software</option>
                            <option value="Other">Other</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Date</label>
                        <input name="date" type="date" defaultValue={new Date().toISOString().split('T')[0]} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2" />
                    </div>
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                    <button type="button" onClick={() => router.back()} className="px-4 py-2 text-gray-700 hover:bg-gray-50 border rounded-md">Cancel</button>
                    <button type="submit" disabled={loading} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50">
                        {loading ? "Recording..." : "Record Transaction"}
                    </button>
                </div>
            </form>
        </div>
    );
}

export default function Page() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <TransactionForm />
        </Suspense>
    );
}
