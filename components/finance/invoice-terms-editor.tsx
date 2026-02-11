"use client";

import { useState, useTransition } from "react";
import { updateInvoiceTerms } from "@/lib/actions/finance";
import { Edit2, Save, X, Loader2 } from "lucide-react";

export default function InvoiceTermsEditor({ invoiceId, initialTerms }: { invoiceId: string, initialTerms: string }) {
    const [isEditing, setIsEditing] = useState(false);
    const [terms, setTerms] = useState(initialTerms);
    const [isSaving, startTransition] = useTransition();

    const handleSave = () => {
        startTransition(async () => {
            await updateInvoiceTerms(invoiceId, terms);
            setIsEditing(false);
        });
    };

    if (isEditing) {
        return (
            <div className="mt-4 border rounded-lg p-4 bg-gray-50 border-blue-200">
                <div className="flex justify-between items-center mb-2">
                    <h4 className="font-bold text-gray-900 text-sm">Edit Terms & Conditions</h4>
                    <div className="flex space-x-2">
                        <button
                            onClick={() => setIsEditing(false)}
                            className="p-1 text-gray-500 hover:bg-gray-200 rounded"
                            title="Cancel"
                        >
                            <X className="w-4 h-4" />
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={isSaving}
                            className="p-1 text-green-600 hover:bg-green-100 rounded"
                            title="Save"
                        >
                            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        </button>
                    </div>
                </div>
                <textarea
                    className="w-full h-32 p-3 text-sm border rounded focus:ring-2 focus:ring-blue-500 outline-none"
                    value={terms}
                    onChange={(e) => setTerms(e.target.value)}
                    placeholder="Enter terms and conditions..."
                />
                <p className="text-xs text-gray-500 mt-2">Supports basic text. Will appear on the PDF.</p>
            </div>
        );
    }

    return (
        <div className="relative group">
            <div className="text-gray-500 text-xs leading-relaxed whitespace-pre-wrap pr-8">
                {terms || 'Payment is due within the specified terms. Please include the invoice number on your payment.'}
            </div>
            <button
                onClick={() => setIsEditing(true)}
                className="absolute top-0 right-0 p-1 text-gray-400 hover:text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity"
                title="Edit Terms"
            >
                <Edit2 className="w-3 h-3" />
            </button>
        </div>
    );
}
