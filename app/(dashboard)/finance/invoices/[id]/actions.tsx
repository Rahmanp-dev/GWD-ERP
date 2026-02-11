"use client";

import { useState, useTransition } from "react";
import { downloadInvoicePDF } from "@/lib/actions/finance";
import { Download, Send, CreditCard, Loader2 } from "lucide-react";

export default function InvoiceActions({ invoiceId, status }: { invoiceId: string, status: string }) {
    const [isDownloading, startDownload] = useTransition();

    const handleDownload = () => {
        startDownload(async () => {
            try {
                const { base64, filename } = await downloadInvoicePDF(invoiceId);

                // Convert Base64 to Blob and trigger download
                const byteCharacters = atob(base64);
                const byteNumbers = new Array(byteCharacters.length);
                for (let i = 0; i < byteCharacters.length; i++) {
                    byteNumbers[i] = byteCharacters.charCodeAt(i);
                }
                const byteArray = new Uint8Array(byteNumbers);
                const blob = new Blob([byteArray], { type: "application/pdf" });

                const url = window.URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = filename;
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
            } catch (error) {
                console.error("Failed to download PDF", error);
                alert("Failed to generate PDF");
            }
        });
    };

    return (
        <>
            <button
                onClick={handleDownload}
                disabled={isDownloading}
                className="flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
            >
                {isDownloading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Download className="w-4 h-4 mr-2" />}
                {isDownloading ? 'Generating...' : 'Download PDF'}
            </button>

            <button className="flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                <Send className="w-4 h-4 mr-2" />
                Send Email
            </button>

            {status !== 'Paid' && (
                <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">
                    <CreditCard className="w-4 h-4 mr-2" />
                    Record Payment
                </button>
            )}
        </>
    );
}
