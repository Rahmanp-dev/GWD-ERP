"use client";

import { useState } from "react";
import NewContentModal from "./new-content-modal";

export default function ContentHeader({ role }: { role: string }) {
    const [isModalOpen, setIsModalOpen] = useState(false);

    return (
        <div className="flex justify-between items-center mb-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Content Approvals</h1>
                <p className="text-gray-500">Manage and review content pipeline for your role ({role}).</p>
            </div>

            {(role === 'Content Strategist' || role === 'Admin') && (
                <>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium shadow-sm transition-colors"
                    >
                        New Content
                    </button>

                    {isModalOpen && (
                        <NewContentModal
                            onClose={() => setIsModalOpen(false)}
                            onSuccess={() => window.location.reload()}
                        />
                    )}
                </>
            )}
        </div>
    );
}
