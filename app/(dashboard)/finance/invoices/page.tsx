"use client";

import { useState, useEffect } from "react";
import {
    FileText,
    Plus,
    DollarSign,
    Clock,
    CheckCircle,
    AlertCircle,
    Send,
    Eye
} from "lucide-react";

export default function InvoicesPage() {
    const [invoices, setInvoices] = useState<any[]>([]);
    const [totals, setTotals] = useState<any>({});
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        clientName: '',
        clientEmail: '',
        clientAddress: '',
        items: [{ description: '', quantity: 1, unitPrice: 0 }],
        taxRate: 10,
        discount: 0,
        dueDate: '',
        notes: '',
        paymentTerms: 'Due on Receipt',
        termsAndConditions: ''
    });
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchInvoices();
    }, []);

    const fetchInvoices = async () => {
        try {
            const res = await fetch("/api/finance/invoices");
            const data = await res.json();
            setInvoices(data.invoices || []);
            setTotals(data.totals || {});
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        setError('');

        try {
            const res = await fetch("/api/finance/invoices", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    client: { name: formData.clientName, email: formData.clientEmail, address: formData.clientAddress },
                    items: formData.items.filter(i => i.description && i.unitPrice > 0),
                    taxRate: formData.taxRate,
                    discount: formData.discount,
                    dueDate: formData.dueDate,
                    notes: formData.notes,
                    paymentTerms: formData.paymentTerms,
                    termsAndConditions: formData.termsAndConditions
                })
            });

            const data = await res.json();
            if (!res.ok) {
                throw new Error(data.error || "Failed to create invoice");
            }

            setShowForm(false);
            setFormData({
                clientName: '', clientEmail: '', clientAddress: '',
                items: [{ description: '', quantity: 1, unitPrice: 0 }],
                taxRate: 10, discount: 0, dueDate: '', notes: '',
                paymentTerms: 'Due on Receipt', termsAndConditions: ''
            });
            fetchInvoices();
        } catch (error: any) {
            console.error(error);
            setError(error.message);
        } finally {
            setSubmitting(false);
        }
    };

    const handleStatusChange = async (id: string, status: string) => {
        try {
            await fetch("/api/finance/invoices", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id, status })
            });
            fetchInvoices();
        } catch (error) {
            console.error(error);
        }
    };

    const addItem = () => {
        setFormData({
            ...formData,
            items: [...formData.items, { description: '', quantity: 1, unitPrice: 0 }]
        });
    };

    const updateItem = (index: number, field: string, value: any) => {
        const newItems = [...formData.items];
        (newItems[index] as any)[field] = value;
        setFormData({ ...formData, items: newItems });
    };

    const formatCurrency = (val: number) =>
        new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val || 0);

    if (loading) return <div className="p-8 text-center text-gray-500">Loading invoices...</div>;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Invoices</h1>
                    <p className="text-sm text-gray-500">Create and manage invoices</p>
                </div>
                <button
                    onClick={() => setShowForm(!showForm)}
                    className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                    <Plus className="w-4 h-4 mr-2" />
                    New Invoice
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white p-5 rounded-xl shadow-sm border">
                    <div className="flex items-center">
                        <FileText className="w-8 h-8 text-gray-500 mr-3" />
                        <div>
                            <div className="text-sm text-gray-500">Draft</div>
                            <div className="text-xl font-bold">{formatCurrency(totals.draft)}</div>
                        </div>
                    </div>
                </div>
                <div className="bg-white p-5 rounded-xl shadow-sm border">
                    <div className="flex items-center">
                        <Send className="w-8 h-8 text-blue-500 mr-3" />
                        <div>
                            <div className="text-sm text-gray-500">Sent</div>
                            <div className="text-xl font-bold text-red-600">{formatCurrency(totals.sent)}</div>
                        </div>
                    </div>
                </div>
                <div className="bg-white p-5 rounded-xl shadow-sm border">
                    <div className="flex items-center">
                        <CheckCircle className="w-8 h-8 text-green-500 mr-3" />
                        <div>
                            <div className="text-sm text-gray-500">Paid</div>
                            <div className="text-xl font-bold text-green-600">{formatCurrency(totals.paid)}</div>
                        </div>
                    </div>
                </div>
                <div className="bg-white p-5 rounded-xl shadow-sm border">
                    <div className="flex items-center">
                        <AlertCircle className="w-8 h-8 text-red-500 mr-3" />
                        <div>
                            <div className="text-sm text-gray-500">Overdue</div>
                            <div className="text-xl font-bold text-red-600">{formatCurrency(totals.overdue)}</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Create Form */}
            {showForm && (
                <div className="bg-white rounded-xl shadow-sm border p-6">
                    <h3 className="font-semibold text-gray-800 mb-4">Create Invoice</h3>
                    {error && (
                        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg">
                            {error}
                        </div>
                    )}
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Client Name *</label>
                                <input
                                    value={formData.clientName}
                                    onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                                    required
                                    className="w-full border rounded-lg p-2"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Client Email</label>
                                <input
                                    type="email"
                                    value={formData.clientEmail}
                                    onChange={(e) => setFormData({ ...formData, clientEmail: e.target.value })}
                                    className="w-full border rounded-lg p-2"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Client Address</label>
                            <textarea
                                rows={2}
                                value={formData.clientAddress}
                                onChange={(e) => setFormData({ ...formData, clientAddress: e.target.value })}
                                className="w-full border rounded-lg p-2"
                                placeholder="123 Main St, City, State"
                            />
                        </div>

                        {/* Line Items */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Items</label>
                            {formData.items.map((item, idx) => (
                                <div key={idx} className="grid grid-cols-4 gap-2 mb-2">
                                    <input
                                        placeholder="Description"
                                        value={item.description}
                                        onChange={(e) => updateItem(idx, 'description', e.target.value)}
                                        className="col-span-2 border rounded-lg p-2"
                                    />
                                    <input
                                        type="number"
                                        placeholder="Qty"
                                        value={item.quantity}
                                        onChange={(e) => updateItem(idx, 'quantity', parseInt(e.target.value))}
                                        className="border rounded-lg p-2"
                                    />
                                    <input
                                        type="number"
                                        placeholder="Price"
                                        value={item.unitPrice}
                                        onChange={(e) => updateItem(idx, 'unitPrice', parseFloat(e.target.value))}
                                        className="border rounded-lg p-2"
                                    />
                                </div>
                            ))}
                            <button type="button" onClick={addItem} className="text-sm text-red-600 hover:underline">
                                + Add Item
                            </button>
                        </div>

                        <div className="grid grid-cols-4 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Tax Rate %</label>
                                <input
                                    type="number"
                                    value={formData.taxRate}
                                    onChange={(e) => setFormData({ ...formData, taxRate: parseFloat(e.target.value) })}
                                    className="w-full border rounded-lg p-2"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Discount</label>
                                <input
                                    type="number"
                                    value={formData.discount}
                                    onChange={(e) => setFormData({ ...formData, discount: parseFloat(e.target.value) })}
                                    className="w-full border rounded-lg p-2"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Due Date *</label>
                                <input
                                    type="date"
                                    value={formData.dueDate}
                                    onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                                    required
                                    className="w-full border rounded-lg p-2"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Payment Terms</label>
                                <select
                                    value={formData.paymentTerms}
                                    onChange={(e) => setFormData({ ...formData, paymentTerms: e.target.value })}
                                    className="w-full border rounded-lg p-2"
                                >
                                    <option>Due on Receipt</option>
                                    <option>Net 7</option>
                                    <option>Net 15</option>
                                    <option>Net 30</option>
                                    <option>Net 45</option>
                                    <option>Net 60</option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                            <textarea
                                rows={2}
                                value={formData.notes}
                                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                className="w-full border rounded-lg p-2"
                                placeholder="Additional notes for the client"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Terms & Conditions</label>
                            <textarea
                                rows={3}
                                value={formData.termsAndConditions}
                                onChange={(e) => setFormData({ ...formData, termsAndConditions: e.target.value })}
                                className="w-full border rounded-lg p-2"
                                placeholder="Payment is due within the specified terms..."
                            />
                        </div>

                        <div className="flex justify-end space-x-3">
                            <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 border rounded-lg">Cancel</button>
                            <button type="submit" disabled={submitting} className="px-4 py-2 bg-red-600 text-white rounded-lg disabled:opacity-50">
                                {submitting ? 'Creating...' : 'Create Invoice'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Invoice Table */}
            <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Invoice</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Client</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Due Date</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {invoices.map((inv) => (
                            <tr key={inv._id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 text-sm font-medium text-red-600">{inv.invoiceNumber}</td>
                                <td className="px-6 py-4 text-sm text-gray-900">{inv.client?.name}</td>
                                <td className="px-6 py-4 text-sm font-semibold text-gray-900">{formatCurrency(inv.total)}</td>
                                <td className="px-6 py-4 text-sm text-gray-500">{new Date(inv.dueDate).toLocaleDateString()}</td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-1 text-xs rounded-full ${inv.status === 'Paid' ? 'bg-green-100 text-green-700' :
                                        inv.status === 'Sent' ? 'bg-blue-100 text-blue-700' :
                                            inv.status === 'Overdue' ? 'bg-red-100 text-red-700' :
                                                'bg-gray-100 text-gray-700'
                                        }`}>{inv.status}</span>
                                </td>
                                <td className="px-6 py-4 text-sm">
                                    <div className="flex space-x-2">
                                        <a href={`/finance/invoices/${inv._id}`} className="text-gray-600 hover:text-gray-800" title="View PDF">
                                            <Eye className="w-4 h-4" />
                                        </a>
                                        {inv.status === 'Draft' && (
                                            <button onClick={() => handleStatusChange(inv._id, 'Sent')} className="text-red-600 hover:text-blue-800" title="Send">
                                                <Send className="w-4 h-4" />
                                            </button>
                                        )}
                                        {inv.status === 'Sent' && (
                                            <button onClick={() => handleStatusChange(inv._id, 'Paid')} className="text-green-600 hover:text-green-800" title="Mark Paid">
                                                <CheckCircle className="w-4 h-4" />
                                            </button>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {invoices.length === 0 && (
                            <tr>
                                <td colSpan={6} className="px-6 py-8 text-center text-gray-500">No invoices yet.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
