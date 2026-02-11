"use client";

import { useState } from "react";
import { updateInstructorStatus } from "@/lib/actions/academy";
import { useRouter } from "next/navigation";
import { Check, X } from "lucide-react";

export default function InstructorActions({ id, currentStatus }: { id: string, currentStatus: string }) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    async function handleUpdate(status: string) {
        if (!confirm(`Are you sure you want to mark this instructor as ${status}?`)) return;
        setLoading(true);
        try {
            await updateInstructorStatus(id, status);
            router.refresh();
        } catch (e) {
            alert("Error updating status");
        } finally {
            setLoading(false);
        }
    }

    if (currentStatus === 'Active') return null;

    return (
        <div className="flex space-x-3 mt-6 border-t pt-6">
            {currentStatus !== 'Active' && (
                <button
                    onClick={() => handleUpdate('Active')}
                    disabled={loading}
                    className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                >
                    <Check className="w-4 h-4 mr-2" /> Approve & Activate
                </button>
            )}
            <button
                onClick={() => handleUpdate('Rejected')}
                disabled={loading}
                className="flex items-center px-4 py-2 bg-white border border-red-200 text-red-600 rounded-md hover:bg-red-50"
            >
                <X className="w-4 h-4 mr-2" /> Reject
            </button>
        </div>
    );
}
