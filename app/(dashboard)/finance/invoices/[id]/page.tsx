"use client";

import { useState, useEffect, use } from "react";
import { Printer, Download, ArrowLeft, Mail, Check, Loader2 } from "lucide-react";
import Link from "next/link";

export default function InvoiceViewPage({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = use(params);
    const [invoice, setInvoice] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [emailSent, setEmailSent] = useState(false);
    const [emailError, setEmailError] = useState('');

    useEffect(() => {
        fetchInvoice();
    }, []);

    const fetchInvoice = async () => {
        try {
            const res = await fetch(`/api/finance/invoices/${resolvedParams.id}`);
            const data = await res.json();
            setInvoice(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handlePrint = () => {
        window.print();
    };

    const handleSendEmail = async () => {
        if (!invoice?.client?.email) {
            setEmailError('Client email is required to send invoice');
            return;
        }

        setSending(true);
        setEmailError('');
        setEmailSent(false);

        try {
            const res = await fetch('/api/email', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type: 'invoice',
                    data: {
                        to: invoice.client.email,
                        invoiceNumber: invoice.invoiceNumber,
                        clientName: invoice.client.name,
                        total: invoice.total,
                        dueDate: invoice.dueDate,
                        viewUrl: `${window.location.origin}/finance/invoices/${invoice._id}`
                    }
                })
            });

            const result = await res.json();

            if (!res.ok) {
                throw new Error(result.error || 'Failed to send email');
            }

            setEmailSent(true);
            // Also update invoice status to Sent if it's Draft
            if (invoice.status === 'Draft') {
                await fetch('/api/finance/invoices', {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ id: invoice._id, status: 'Sent' })
                });
                setInvoice({ ...invoice, status: 'Sent' });
            }
        } catch (error: any) {
            console.error(error);
            setEmailError(error.message);
        } finally {
            setSending(false);
        }
    };

    const formatCurrency = (val: number, currency = 'INR') =>
        new Intl.NumberFormat('en-IN', { style: 'currency', currency, maximumFractionDigits: 0 }).format(val || 0);

    const formatDate = (date: string) => {
        const d = new Date(date);
        return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }).toUpperCase();
    };

    if (loading) return <div className="p-8 text-center text-gray-500">Loading invoice...</div>;
    if (!invoice) return <div className="p-8 text-center text-red-500">Invoice not found</div>;

    return (
        <>
            {/* Action Bar - Hidden when printing */}
            <div className="print:hidden mb-6 flex items-center justify-between">
                <Link href="/finance/invoices" className="flex items-center text-gray-600 hover:text-gray-900">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Invoices
                </Link>
                <div className="flex items-center space-x-3">
                    {emailError && (
                        <span className="text-red-600 text-sm">{emailError}</span>
                    )}
                    {emailSent && (
                        <span className="text-green-600 text-sm flex items-center">
                            <Check className="w-4 h-4 mr-1" /> Email sent!
                        </span>
                    )}
                    <button
                        onClick={handleSendEmail}
                        disabled={sending || !invoice?.client?.email}
                        className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                    >
                        {sending ? (
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                            <Mail className="w-4 h-4 mr-2" />
                        )}
                        {sending ? 'Sending...' : 'Send to Client'}
                    </button>
                    <button
                        onClick={handlePrint}
                        className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                        <Printer className="w-4 h-4 mr-2" />
                        Print / Save PDF
                    </button>
                </div>
            </div>

            {/* Invoice Container */}
            <div className="bg-white p-10 max-w-3xl mx-auto shadow-lg print:shadow-none print:p-0">
                {/* Header */}
                <div className="flex justify-between items-start mb-10">
                    {/* Logo & Company */}
                    <div>
                        <div className="flex items-center mb-2">
                            <span className="text-4xl font-bold">
                                <span className="text-gray-800">[</span>
                                <span className="text-red-600">G</span>
                                <span className="text-yellow-500">W</span>
                                <span className="text-green-600">D</span>
                                <span className="text-gray-800">]</span>
                            </span>
                        </div>
                        <div className="text-red-600 font-semibold tracking-widest text-sm">
                            GET WORK DONE
                        </div>
                    </div>

                    {/* Invoice Info */}
                    <div className="text-right">
                        <h1 className="text-3xl font-light text-red-600 tracking-[0.3em] mb-4">INVOICE</h1>
                        <div className="text-sm">
                            <div className="flex justify-end">
                                <span className="text-gray-600 w-24 text-right">DATE:</span>
                                <span className="font-semibold ml-2 text-red-600">{formatDate(invoice.createdAt)}</span>
                            </div>
                            <div className="flex justify-end mt-1">
                                <span className="text-gray-600 w-24 text-right">DUE DATE:</span>
                                <span className="font-semibold ml-2 text-red-600">{formatDate(invoice.dueDate)}</span>
                            </div>
                            <div className="flex justify-end mt-1">
                                <span className="text-gray-600 w-24 text-right">INVOICE #:</span>
                                <span className="font-semibold ml-2">{invoice.invoiceNumber}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bill To */}
                <div className="mb-8">
                    <h2 className="text-lg font-semibold text-gray-800 mb-2">TO:</h2>
                    <div className="text-gray-700">
                        <div className="font-medium">{invoice.client?.name}</div>
                        {invoice.client?.email && <div>{invoice.client.email}</div>}
                        {invoice.client?.address && <div className="whitespace-pre-line">{invoice.client.address}</div>}
                    </div>
                </div>

                {/* Items Table */}
                <table className="w-full mb-8">
                    <thead>
                        <tr className="bg-gray-900 text-white">
                            <th className="py-3 px-4 text-left font-semibold">Description</th>
                            <th className="py-3 px-4 text-center font-semibold w-20">Qty</th>
                            <th className="py-3 px-4 text-right font-semibold w-32">Amount (INR)</th>
                        </tr>
                    </thead>
                    <tbody>
                        {invoice.items?.map((item: any, idx: number) => (
                            <tr key={idx} className={idx % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                                <td className="py-3 px-4 font-medium">{item.description}</td>
                                <td className="py-3 px-4 text-center">{item.quantity}</td>
                                <td className="py-3 px-4 text-right">₹{item.total?.toLocaleString('en-IN')}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {/* Totals */}
                <div className="flex justify-end mb-8">
                    <div className="w-64">
                        <div className="flex justify-between py-2 border-b">
                            <span className="text-gray-600">Subtotal:</span>
                            <span className="font-medium">₹{invoice.subtotal?.toLocaleString('en-IN')}</span>
                        </div>
                        {invoice.tax > 0 && (
                            <div className="flex justify-between py-2 border-b">
                                <span className="text-gray-600">Tax ({invoice.taxRate}%):</span>
                                <span className="font-medium">₹{invoice.tax?.toLocaleString('en-IN')}</span>
                            </div>
                        )}
                        {invoice.discount > 0 && (
                            <div className="flex justify-between py-2 border-b">
                                <span className="text-gray-600">Discount:</span>
                                <span className="font-medium text-green-600">-₹{invoice.discount?.toLocaleString('en-IN')}</span>
                            </div>
                        )}
                        <div className="flex justify-between py-3 text-lg font-bold bg-gray-100 px-3 -mx-3 mt-2">
                            <span>Total:</span>
                            <span className="text-red-600">₹{invoice.total?.toLocaleString('en-IN')}</span>
                        </div>
                    </div>
                </div>

                {/* Description of Work */}
                {invoice.notes && (
                    <div className="mb-8">
                        <h3 className="font-bold text-gray-800 mb-2">DESCRIPTION OF WORK:</h3>
                        <ul className="list-disc list-inside text-gray-700 text-sm">
                            <li>{invoice.notes}</li>
                        </ul>
                    </div>
                )}

                {/* Bank Details */}
                <div className="border-t pt-6">
                    <h3 className="font-bold text-gray-800 mb-3">BANK DETAILS FOR PAYMENT:</h3>
                    <ul className="text-sm text-gray-700 space-y-1">
                        <li><span className="font-medium">BANK NAME:</span> STATE BANK OF INDIA</li>
                        <li><span className="font-medium">ACCOUNT HOLDER NAME:</span> GET WORK DONE TECHNOLOGIES</li>
                        <li><span className="font-medium">ACCOUNT NUMBER:</span> 37053009951</li>
                        <li><span className="font-medium">IFSC CODE:</span> SBIN0020951</li>
                        <li><span className="font-medium">MICR CODE:</span> 508002007</li>
                        <li><span className="font-medium">BANK ADDRESS:</span> COLLECTORATE COMPLEX, NALGONDA</li>
                    </ul>
                </div>

                {/* Footer */}
                <div className="mt-12 pt-6 border-t text-center">
                    <div className="text-2xl font-light tracking-[0.4em]">
                        <span className="text-red-600">GET</span>
                        <span className="text-yellow-500 mx-2">WORK</span>
                        <span className="text-green-600">DONE</span>
                    </div>
                </div>
            </div>

            {/* Print Styles */}
            <style jsx global>{`
                @media print {
                    body * {
                        visibility: hidden;
                    }
                    .print\\:hidden {
                        display: none !important;
                    }
                    #invoice-container, #invoice-container * {
                        visibility: visible;
                    }
                    #invoice-container {
                        position: absolute;
                        left: 0;
                        top: 0;
                        width: 100%;
                    }
                }
            `}</style>
        </>
    );
}
