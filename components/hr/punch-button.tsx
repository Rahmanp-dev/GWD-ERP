"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function PunchButton() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");

    async function handlePunch() {
        setLoading(true);
        setMessage("");

        try {
            const res = await fetch("/api/attendance/punch", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Punch failed");

            setMessage(`Success: ${data.message}`);
            router.refresh();

            // Clear message after 3s
            setTimeout(() => setMessage(""), 3000);
        } catch (err: any) {
            setMessage(`Error: ${err.message}`);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="flex items-center space-x-4">
            {message && (
                <span className={`text-sm ${message.startsWith("Error") ? "text-red-600" : "text-green-600"}`}>
                    {message}
                </span>
            )}
            <button
                onClick={handlePunch}
                disabled={loading}
                className="px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700 disabled:opacity-50"
            >
                {loading ? "Punching..." : "Punch In/Out"}
            </button>
        </div>
    );
}
