import nodemailer from 'nodemailer';

// Email configuration types
interface EmailConfig {
    to: string | string[];
    subject: string;
    html: string;
    text?: string;
    attachments?: any[];
}

// Create transporter based on environment - created fresh each time
const getTransporter = () => {
    const host = process.env.SMTP_HOST;
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;

    // For production, use SMTP settings from env
    if (host && user && pass) {
        console.log('📧 Email service: Using SMTP -', host);
        return nodemailer.createTransport({
            host: host,
            port: parseInt(process.env.SMTP_PORT || '587'),
            secure: process.env.SMTP_SECURE === 'true',
            auth: {
                user: user,
                pass: pass,
            },
        });
    }

    // For development, use console logging
    console.log('📧 Email service: No SMTP configured, emails will be logged only');
    console.log('   SMTP_HOST:', host || 'not set');
    return null;
};

/**
 * Send an email
 */
export async function sendEmail(config: EmailConfig): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
        const transporter = getTransporter();

        if (!transporter) {
            // Log email in development
            console.log('📧 [DEV EMAIL]', {
                to: config.to,
                subject: config.subject,
                preview: config.text?.substring(0, 100) || config.html.substring(0, 100)
            });
            return { success: true, messageId: 'dev-' + Date.now() };
        }

        const info = await transporter.sendMail({
            from: process.env.SMTP_FROM || '"GWD ERP" <noreply@getworkdone.com>',
            to: Array.isArray(config.to) ? config.to.join(', ') : config.to,
            subject: config.subject,
            html: config.html,
            text: config.text,
            attachments: config.attachments
        });

        return { success: true, messageId: info.messageId };
    } catch (error: any) {
        console.error('Email Error:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Email Templates
 */
export const EmailTemplates = {
    // Invoice Email Template with full content embedded
    invoice: (data: {
        invoiceNumber: string;
        clientName: string;
        clientEmail?: string;
        total: number;
        subtotal?: number;
        tax?: number;
        taxRate?: number;
        discount?: number;
        dueDate: string;
        items?: { description: string; quantity: number; total: number }[];
        notes?: string;
        viewUrl?: string;
    }) => ({
        subject: `Invoice ${data.invoiceNumber} from Get Work Done`,
        html: `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 20px; background: #f3f4f6; }
        .container { max-width: 650px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
        .header { background: white; padding: 30px; text-align: center; border-bottom: 3px solid #dc2626; }
        .logo { font-size: 36px; font-weight: bold; }
        .logo-g { color: #dc2626; }
        .logo-w { color: #eab308; }
        .logo-d { color: #16a34a; }
        .invoice-title { color: #dc2626; font-size: 14px; letter-spacing: 5px; margin-top: 10px; }
        .content { padding: 30px; }
        .invoice-meta { display: flex; justify-content: space-between; margin-bottom: 30px; }
        .meta-item { text-align: right; }
        .meta-label { color: #6b7280; font-size: 12px; }
        .meta-value { font-weight: bold; color: #dc2626; }
        .client-info { background: #f9fafb; padding: 20px; border-radius: 8px; margin-bottom: 25px; }
        .client-label { font-weight: bold; color: #374151; font-size: 12px; letter-spacing: 1px; margin-bottom: 5px; }
        .items-table { width: 100%; border-collapse: collapse; margin-bottom: 25px; }
        .items-table th { background: #1f2937; color: white; padding: 12px 15px; text-align: left; font-size: 13px; }
        .items-table td { padding: 12px 15px; border-bottom: 1px solid #e5e7eb; }
        .items-table tr:nth-child(even) { background: #f9fafb; }
        .totals { margin-left: auto; width: 250px; }
        .totals-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e5e7eb; }
        .totals-final { background: #fee2e2; padding: 15px; border-radius: 8px; margin-top: 10px; }
        .totals-final span:last-child { color: #dc2626; font-size: 24px; font-weight: bold; }
        .bank-details { background: #f9fafb; padding: 20px; border-radius: 8px; margin-top: 25px; border-left: 4px solid #dc2626; }
        .bank-details h4 { margin: 0 0 15px 0; color: #374151; }
        .bank-details p { margin: 5px 0; font-size: 13px; }
        .button { display: inline-block; background: #dc2626; color: white; padding: 14px 30px; text-decoration: none; border-radius: 8px; margin-top: 25px; font-weight: bold; }
        .footer { background: #1f2937; color: #9ca3af; padding: 20px; text-align: center; font-size: 12px; }
        .footer-brand { color: white; font-size: 16px; letter-spacing: 3px; margin-bottom: 10px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">[<span class="logo-g">G</span><span class="logo-w">W</span><span class="logo-d">D</span>]</div>
            <div class="invoice-title">INVOICE</div>
        </div>
        <div class="content">
            <table width="100%" style="margin-bottom: 25px;">
                <tr>
                    <td>
                        <span class="meta-label">INVOICE #</span><br>
                        <strong>${data.invoiceNumber}</strong>
                    </td>
                    <td align="right">
                        <span class="meta-label">DATE</span><br>
                        <span class="meta-value">${new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }).toUpperCase()}</span>
                    </td>
                    <td align="right">
                        <span class="meta-label">DUE DATE</span><br>
                        <span class="meta-value">${new Date(data.dueDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }).toUpperCase()}</span>
                    </td>
                </tr>
            </table>
            
            <div class="client-info">
                <div class="client-label">BILL TO:</div>
                <strong>${data.clientName}</strong>
                ${data.clientEmail ? `<br>${data.clientEmail}` : ''}
            </div>

            <table class="items-table">
                <thead>
                    <tr>
                        <th>Description</th>
                        <th style="text-align: center; width: 60px;">Qty</th>
                        <th style="text-align: right; width: 120px;">Amount</th>
                    </tr>
                </thead>
                <tbody>
                    ${data.items?.map(item => `
                        <tr>
                            <td>${item.description}</td>
                            <td style="text-align: center;">${item.quantity}</td>
                            <td style="text-align: right;">₹${item.total?.toLocaleString('en-IN')}</td>
                        </tr>
                    `).join('') || `
                        <tr>
                            <td colspan="3" style="text-align: center;">Service charges</td>
                        </tr>
                    `}
                </tbody>
            </table>

            <div class="totals">
                <div class="totals-row">
                    <span>Subtotal</span>
                    <span>₹${(data.subtotal || data.total).toLocaleString('en-IN')}</span>
                </div>
                ${data.tax && data.tax > 0 ? `
                <div class="totals-row">
                    <span>Tax (${data.taxRate || 0}%)</span>
                    <span>₹${data.tax.toLocaleString('en-IN')}</span>
                </div>` : ''}
                ${data.discount && data.discount > 0 ? `
                <div class="totals-row">
                    <span>Discount</span>
                    <span style="color: #16a34a;">-₹${data.discount.toLocaleString('en-IN')}</span>
                </div>` : ''}
                <div class="totals-final">
                    <span>Total Due</span>
                    <span>₹${data.total.toLocaleString('en-IN')}</span>
                </div>
            </div>

            ${data.notes ? `
            <div style="margin-top: 25px;">
                <strong>Notes:</strong>
                <p style="color: #6b7280; margin: 5px 0;">${data.notes}</p>
            </div>
            ` : ''}

            <div class="bank-details">
                <h4>💳 Bank Details for Payment</h4>
                <p><strong>Bank:</strong> State Bank of India</p>
                <p><strong>Account Name:</strong> GET WORK DONE TECHNOLOGIES</p>
                <p><strong>Account No:</strong> 37053009951</p>
                <p><strong>IFSC:</strong> SBIN0020951</p>
            </div>

            ${data.viewUrl ? `
            <div style="text-align: center; margin-top: 30px;">
                <a href="${data.viewUrl}" class="button">View Invoice Online</a>
            </div>
            ` : ''}
        </div>
        <div class="footer">
            <div class="footer-brand">GET WORK DONE</div>
            <p>Get Work Done Technologies | Nalgonda, Telangana, India</p>
            <p>Thank you for your business!</p>
        </div>
    </div>
</body>
</html>`,
        text: `Invoice ${data.invoiceNumber}\n\nDear ${data.clientName},\n\nAmount Due: ₹${data.total.toLocaleString('en-IN')}\nDue Date: ${data.dueDate}\n\n${data.items?.map(i => `${i.description}: ₹${i.total}`).join('\n') || ''}\n\nBank: State Bank of India\nAccount: 37053009951\nIFSC: SBIN0020951\n\nThank you for your business.\n\n- Get Work Done`
    }),

    // Notification Alert Email
    notification: (data: {
        userName: string;
        title: string;
        message: string;
        actionUrl?: string;
    }) => ({
        subject: `[GWD ERP] ${data.title}`,
        html: `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #1f2937; color: white; padding: 20px; border-radius: 8px 8px 0 0; text-align: center; }
        .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
        .button { display: inline-block; background: #2563eb; color: white; padding: 10px 20px; text-decoration: none; border-radius: 6px; }
    </style>
</head>
<body>
    <div class="header">
        <h2>GWD ERP Notification</h2>
    </div>
    <div class="content">
        <p>Hi ${data.userName},</p>
        <h3>${data.title}</h3>
        <p>${data.message}</p>
        ${data.actionUrl ? `<p><a href="${data.actionUrl}" class="button">Take Action</a></p>` : ''}
    </div>
</body>
</html>`,
        text: `Hi ${data.userName},\n\n${data.title}\n\n${data.message}`
    }),

    // Leave Request Email
    leaveRequest: (data: {
        employeeName: string;
        leaveType: string;
        startDate: string;
        endDate: string;
        reason: string;
        approverName: string;
    }) => ({
        subject: `Leave Request from ${data.employeeName}`,
        html: `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
        .card { background: #f9fafb; padding: 20px; border-radius: 8px; border-left: 4px solid #2563eb; }
        table { width: 100%; margin: 20px 0; }
        td { padding: 8px 0; }
    </style>
</head>
<body>
    <h2>Leave Request</h2>
    <div class="card">
        <p>Hi ${data.approverName},</p>
        <p><strong>${data.employeeName}</strong> has submitted a leave request:</p>
        <table>
            <tr><td><strong>Leave Type:</strong></td><td>${data.leaveType}</td></tr>
            <tr><td><strong>From:</strong></td><td>${data.startDate}</td></tr>
            <tr><td><strong>To:</strong></td><td>${data.endDate}</td></tr>
            <tr><td><strong>Reason:</strong></td><td>${data.reason}</td></tr>
        </table>
        <p>Please log in to the ERP to approve or reject this request.</p>
    </div>
</body>
</html>`,
        text: `Leave Request from ${data.employeeName}\n\nType: ${data.leaveType}\nFrom: ${data.startDate}\nTo: ${data.endDate}\nReason: ${data.reason}`
    })
};

export default { sendEmail, EmailTemplates };
