"use client";

import { Download } from "lucide-react";
import { downloadCSV, ExportConfigs } from "@/lib/export-utils";

interface ExportButtonProps {
    data: any[];
    type: keyof typeof ExportConfigs;
    filename?: string;
    className?: string;
}

export default function ExportButton({ data, type, filename, className = "" }: ExportButtonProps) {
    const handleExport = () => {
        const config = ExportConfigs[type];
        if (!config) {
            console.error(`Export config not found for type: ${type}`);
            return;
        }
        downloadCSV(data, config, filename || type);
    };

    return (
        <button
            onClick={handleExport}
            disabled={!data || data.length === 0}
            className={`flex items-center px-3 py-2 text-sm border rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
        >
            <Download className="w-4 h-4 mr-2" />
            Export CSV
        </button>
    );
}
