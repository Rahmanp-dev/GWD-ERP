import puppeteer from 'puppeteer';
import { IInvoice } from '@/lib/models/Invoice';
import { format } from 'date-fns';

export async function generateInvoicePDF(invoice: any) {
    const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();

    // Calculate totals
    const subtotal = invoice.items.reduce((sum: number, item: any) => sum + item.total, 0);
    const tax = invoice.tax || 0;
    const total = subtotal + tax - (invoice.discount || 0);

    // HTML Template
    // In a real app, this might be a React component rendered to string (via react-dom/server)
    // For now, we use a clean HTML template with Tailwind CDN for styling fidelity.
    const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <script src="https://cdn.tailwindcss.com?plugins=typography"></script>
        <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap');
            body { font-family: 'Inter', sans-serif; }
            .print-safe { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        </style>
    </head>
    <body class="bg-white p-8 print-safe max-w-4xl mx-auto">
        
        <!-- Header -->
        <div class="flex justify-between items-start mb-12">
            <div>
                ${invoice.logoUrl ? `<img src="${invoice.logoUrl}" alt="Logo" class="h-12 w-auto mb-4" />` : '<h1 class="text-3xl font-bold text-gray-900 mb-2">INVOICE</h1>'}
                <p class="text-gray-500 text-sm">
                    <strong>Invoice #:</strong> ${invoice.invoiceNumber}<br>
                    <strong>Date:</strong> ${format(new Date(invoice.createdAt || new Date()), 'MMM dd, yyyy')}<br>
                    <strong>Due Date:</strong> ${format(new Date(invoice.dueDate), 'MMM dd, yyyy')}
                </p>
            </div>
            <div class="text-right">
                <h3 class="font-bold text-gray-900 text-lg">Bill To:</h3>
                <p class="text-gray-600 text-sm mt-1">
                    <span class="font-semibold">${invoice.client.name}</span><br>
                    ${invoice.client.email ? `${invoice.client.email}<br>` : ''}
                    ${invoice.client.address ? invoice.client.address.replace(/\n/g, '<br>') : ''}
                </p>
            </div>
        </div>

        <!-- Line Items -->
        <table class="w-full mb-8 border-collapse">
            <thead>
                <tr class="bg-gray-50 text-gray-700 text-sm uppercase text-left border-y border-gray-200">
                    <th class="py-3 px-4 font-semibold">Description</th>
                    <th class="py-3 px-4 text-right font-semibold w-24">Qty</th>
                    <th class="py-3 px-4 text-right font-semibold w-32">Unit Price</th>
                    <th class="py-3 px-4 text-right font-semibold w-32">Total</th>
                </tr>
            </thead>
            <tbody class="text-gray-700 text-sm">
                ${invoice.items.map((item: any) => `
                <tr class="border-b border-gray-100">
                    <td class="py-4 px-4">${item.description}</td>
                    <td class="py-4 px-4 text-right">${item.quantity}</td>
                    <td class="py-4 px-4 text-right">$${item.unitPrice.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                    <td class="py-4 px-4 text-right font-medium">$${item.total.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                </tr>
                `).join('')}
            </tbody>
        </table>

        <!-- Summary -->
        <div class="flex justify-end mb-12">
            <div class="w-64 space-y-2 text-right">
                <div class="flex justify-between text-gray-600 text-sm">
                    <span>Subtotal:</span>
                    <span>$${subtotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                </div>
                ${tax > 0 ? `
                <div class="flex justify-between text-gray-600 text-sm">
                    <span>Tax:</span>
                    <span>$${tax.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                </div>` : ''}
                 ${invoice.discount > 0 ? `
                <div class="flex justify-between text-gray-600 text-sm">
                    <span>Discount:</span>
                    <span>-$${invoice.discount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                </div>` : ''}
                <div class="flex justify-between text-gray-900 font-bold text-lg border-t border-gray-200 pt-2 mt-2">
                    <span>Total:</span>
                    <span>$${total.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                </div>
            </div>
        </div>

        <!-- Footer / Terms -->
        <div class="border-t border-gray-200 pt-8 mt-auto">
            <h4 class="font-bold text-gray-900 text-sm mb-2">Terms & Conditions</h4>
            <div class="text-gray-500 text-xs leading-relaxed prose prose-sm max-w-none prose-p:my-1 prose-ul:my-1 prose-li:my-0 prose-gray">
                ${invoice.termsAndConditions || 'Payment is due within the specified terms. Please include the invoice number on your payment.'}
            </div>
            
            ${invoice.paymentTerms ? `
            <div class="mt-4 text-gray-500 text-xs font-semibold">
                 Payment Terms: ${invoice.paymentTerms}
            </div>` : ''}
            
            <div class="mt-6 text-gray-400 text-xs text-center">
                Thank you for your business.
            </div>
        </div>

    </body>
    </html>
    `;

    await page.setContent(htmlContent, { waitUntil: 'networkidle0' });

    const pdfBuffer = await page.pdf({
        format: 'A4',
        printBackground: true,
        margin: { top: '40px', right: '40px', bottom: '40px', left: '40px' }
    });

    await browser.close();
    return pdfBuffer;
}
