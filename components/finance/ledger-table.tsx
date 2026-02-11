"use client";

import { useState, useTransition } from "react";
import { recordTransaction, reverseTransaction, TransactionInput } from "@/lib/actions/finance";
import { format } from "date-fns";
import { Loader2, Plus, ArrowUpRight, ArrowDownLeft, AlertCircle, RotateCcw } from "lucide-react";

export default function FinanceLedgerTable({ projectId, initialData }: { projectId: string, initialData: any[] }) {
    const [ledger, setLedger] = useState(initialData);
    const [isPending, startTransition] = useTransition();
    const [showAddRow, setShowAddRow] = useState(false);

    // New Row State
    const [newRow, setNewRow] = useState<Partial<TransactionInput>>({
        type: 'Outflow',
        category: 'Ops Cost',
        description: '',
        amount: 0,
        date: new Date()
    });

    const handleAddTransaction = async () => {
        if (!newRow.description || !newRow.amount) return;

        startTransition(async () => {
            const input: TransactionInput = {
                projectId,
                type: newRow.type as any,
                category: newRow.category as any,
                description: newRow.description!,
                amount: Number(newRow.amount),
                date: new Date(newRow.date!),
                userId: 'user_id_placeholder'
            };

            const result = await recordTransaction(input);
            if (result.success) {
                window.location.reload();
            }
        });
    };

    const handleReverse = async (id: string) => {
        const reason = prompt("Enter reason for reversal:");
        if (!reason) return;

        startTransition(async () => {
            await reverseTransaction(id, reason);
            window.location.reload();
        });
    };

    return (
        <div className="bg-white border rounded-lg shadow-sm overflow-hidden">
            <div className="p-4 border-b bg-gray-50 flex justify-between items-center h-full">
                <h3 className="font-semibold text-gray-700">Project Ledger</h3>
                <button
                    onClick={() => setShowAddRow(!showAddRow)}
                    className="text-sm bg-blue-600 text-white px-3 py-1.5 rounded-md hover:bg-blue-700 flex items-center"
                >
                    <Plus className="w-4 h-4 mr-1" /> Add Entry
                </button>
            </div>

            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50 text-xs font-semibold text-gray-500 uppercase">
                        <tr>
                            <th className="px-4 py-3 text-left">Date</th>
                            <th className="px-4 py-3 text-left">Type</th>
                            <th className="px-4 py-3 text-left">Category</th>
                            <th className="px-4 py-3 text-left w-1/3">Description</th>
                            <th className="px-4 py-3 text-right text-green-700">Inflow</th>
                            <th className="px-4 py-3 text-right text-red-700">Outflow</th>
                            <th className="px-4 py-3 text-right">Balance</th>
                            <th className="px-4 py-3 text-center">Status</th>
                            <th className="px-4 py-3 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                        {/* Input Row */}
                        {showAddRow && (
                            <tr className="bg-blue-50">
                                <td className="px-4 py-2">
                                    <input type="date" className="p-1 border rounded w-32 text-sm"
                                        value={newRow.date ? format(newRow.date, 'yyyy-MM-dd') : ''}
                                        onChange={(e) => setNewRow({ ...newRow, date: new Date(e.target.value) })}
                                    />
                                </td>
                                <td className="px-4 py-2">
                                    <select className="p-1 border rounded text-sm w-24"
                                        value={newRow.type}
                                        onChange={(e) => setNewRow({ ...newRow, type: e.target.value as any })}
                                    >
                                        <option value="Inflow">Inflow</option>
                                        <option value="Outflow">Outflow</option>
                                        <option value="Adjustment">Adjust</option>
                                    </select>
                                </td>
                                <td className="px-4 py-2">
                                    <select className="p-1 border rounded text-sm w-32"
                                        value={newRow.category}
                                        onChange={(e) => setNewRow({ ...newRow, category: e.target.value as any })}
                                    >
                                        <option value="Client Payment">Payment</option>
                                        <option value="Ops Cost">Ops Cost</option>
                                        <option value="Project Cost">Prj Cost</option>
                                        <option value="Internal Investment">Invest</option>
                                    </select>
                                </td>
                                <td className="px-4 py-2">
                                    <input type="text" className="p-1 border rounded w-full text-sm" placeholder="Description..."
                                        value={newRow.description}
                                        onChange={(e) => setNewRow({ ...newRow, description: e.target.value })}
                                    />
                                </td>
                                <td className="px-4 py-2 text-right" colSpan={2}>
                                    <input type="number" className="p-1 border rounded w-full text-sm text-right" placeholder="0.00"
                                        value={newRow.amount}
                                        onChange={(e) => setNewRow({ ...newRow, amount: parseFloat(e.target.value) })}
                                    />
                                </td>
                                <td className="px-4 py-2 text-center" colSpan={3}>
                                    <button
                                        onClick={handleAddTransaction}
                                        disabled={isPending}
                                        className="bg-green-600 text-white px-3 py-1 rounded text-xs hover:bg-green-700 disabled:opacity-50"
                                    >
                                        {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save'}
                                    </button>
                                </td>
                            </tr>
                        )}

                        {/* List Rows */}
                        {ledger.map((entry) => (
                            <tr key={entry._id} className={`hover:bg-gray-50 transition-colors ${entry.status === 'Reversed' ? 'opacity-50 line-through' : ''}`}>
                                <td className="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">
                                    {format(new Date(entry.date), 'MMM dd, yyyy')}
                                </td>
                                <td className="px-4 py-3 text-sm">
                                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${entry.type === 'Inflow' ? 'bg-green-100 text-green-800' :
                                            entry.type === 'Outflow' ? 'bg-red-100 text-red-800' :
                                                'bg-gray-100 text-gray-800'
                                        }`}>
                                        {entry.type}
                                    </span>
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-600">{entry.category}</td>
                                <td className="px-4 py-3 text-sm text-gray-900 font-medium">{entry.description}</td>

                                <td className="px-4 py-3 text-right text-sm text-green-700 font-mono">
                                    {entry.type === 'Inflow' ? `+${entry.amount.toLocaleString()}` : '-'}
                                </td>
                                <td className="px-4 py-3 text-right text-sm text-red-700 font-mono">
                                    {entry.type !== 'Inflow' ? `-${Math.abs(entry.amount).toLocaleString()}` : '-'}
                                </td>

                                <td className="px-4 py-3 text-right text-sm font-bold text-gray-900 font-mono">
                                    {entry.balanceAfter ? entry.balanceAfter.toLocaleString() : '---'}
                                </td>
                                <td className="px-4 py-3 text-center">
                                    {entry.status === 'Cleared' ? (
                                        <span className="text-green-500" title="Cleared"><ArrowUpRight className="w-4 h-4 inline" /></span>
                                    ) : entry.status === 'Reversed' ? (
                                        <span className="text-red-500" title="Reversed"><AlertCircle className="w-4 h-4 inline" /></span>
                                    ) : (
                                        <span className="text-gray-400"><Loader2 className="w-4 h-4 inline" /></span>
                                    )}
                                </td>
                                <td className="px-4 py-3 text-right">
                                    {!entry.isReversal && entry.status !== 'Reversed' && (
                                        <button
                                            onClick={() => handleReverse(entry._id)}
                                            className="text-gray-400 hover:text-red-600"
                                            title="Reverse Transaction"
                                        >
                                            <RotateCcw className="w-4 h-4" />
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {ledger.length === 0 && <div className="p-8 text-center text-gray-400">No transactions recorded yet.</div>}
            </div>
        </div>
    );
}
