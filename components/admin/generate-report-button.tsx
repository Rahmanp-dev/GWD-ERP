"use client";

import { useState, useTransition } from "react";
import { generateDailyReport } from "@/lib/actions/daily-report";
import { Loader2, RefreshCw } from "lucide-react";
import { useRouter } from "next/navigation";

export default function GenerateReportButton() {
    const [isPending, startTransition] = useTransition();
    const router = useRouter();

    const handleGenerate = () => {
        startTransition(async () => {
            await generateDailyReport();
            router.refresh();
        });
    };

    return (
        <button
            onClick={handleGenerate}
            disabled={isPending}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
            {isPending ? (
                <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Generating...
                </>
            ) : (
                <>
                    <RefreshCw className="w-4 h-4" />
                    Generate Report Now
                </>
            )}
        </button>
    );
}
