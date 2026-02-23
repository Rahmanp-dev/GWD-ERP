import { notFound } from "next/navigation";
import dbConnect from "@/lib/db";
import Invoice from "@/lib/models/Invoice";
import { Printer } from "lucide-react";
import PrintButton from "@/components/common/print-button"; // I'll create this simple component or inline the client logic

// Ensure models are registered
// import "@/lib/models/Client"; 

export default async function PublicInvoicePage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    await dbConnect();

    let invoice;
    try {
        const result = await Invoice.findById(id).lean();
        if (!result) return notFound();
        // Serialize for passing to component
        invoice = JSON.parse(JSON.stringify(result));
    } catch (error) {
        return notFound();
    }

    const formatDate = (date: string) => {
        const d = new Date(date);
        return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }).toUpperCase();
    };

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-3xl mx-auto">
                <div className="print:hidden mb-6 flex justify-end">
                    <PrintButton />
                </div>

                <div className="bg-white p-10 shadow-lg print:shadow-none print:p-0">
                    {/* Header */}
                    <div className="flex justify-between items-start mb-10">
                        <div>
                            <img src="/gwdlogonobg.png" alt="Get Work Done" className="h-40 w-auto mb-2" />
                            <div className="text-red-600 font-semibold tracking-widest text-sm">
                                GET WORK DONE
                            </div>
                        </div>

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

                    {/* Terms & Conditions */}
                    <div className="border-t pt-6 mt-8">
                        <h3 className="font-bold text-gray-800 mb-3 uppercase tracking-wider text-sm">Terms & Conditions</h3>
                        <div
                            className="prose prose-sm prose-gray max-w-none prose-p:my-1 prose-ul:my-1 prose-li:my-0 text-gray-700 leading-relaxed"
                            dangerouslySetInnerHTML={{ __html: invoice.termsAndConditions || 'Payment is due within the specified terms. Please include the invoice number on your payment.' }}
                        />
                        {invoice.paymentTerms && (
                            <div className="mt-4 text-gray-800 text-sm font-semibold">
                                Payment Terms: {invoice.paymentTerms}
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="mt-12 pt-6 border-t text-center">
                        <div className="text-sm text-gray-500">
                            GET WORK DONE
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
                @media print {
                    body * {
                        visibility: hidden;
                    }
                    .print\\:hidden {
                        display: none !important;
                    }
                    .bg-gray-50 {
                        background: white !important;
                        padding: 0 !important;
                    }
                    .max-w-3xl {
                        max-width: none !important;
                    }
                    .shadow-lg {
                        box-shadow: none !important;
                    }
                    #invoice-content, #invoice-content * {
                        visibility: visible;
                    }
                    .bg-white {
                        padding: 0 !important;
                    }
                }
            `}</style>
        </div>
    );
}
