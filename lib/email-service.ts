import nodemailer from 'nodemailer';
import path from 'path';
import fs from 'fs';

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
    return null;
};

/**
 * Get logo as base64 data URI for embedding in emails
 */
function getLogoBase64(): string {
    try {
        const logoPath = path.join(process.cwd(), 'public', 'gwdlogonobg.png');
        if (fs.existsSync(logoPath)) {
            const logoBuffer = fs.readFileSync(logoPath);
            return 'data:image/png;base64,' + logoBuffer.toString('base64');
        }
    } catch (e) {
        console.log('Logo not found for email, using text fallback');
    }
    return '';
}

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

        const logoPath = path.join(process.cwd(), 'public', 'gwdlogonobg.png');
        const hasLogo = fs.existsSync(logoPath);

        // Build attachments - always include logo as CID attachment
        const attachments = [...(config.attachments || [])];
        if (hasLogo) {
            attachments.push({
                filename: 'gwdlogo.png',
                path: logoPath,
                cid: 'companylogo@gwd'
            });
        }

        const info = await transporter.sendMail({
            from: process.env.SMTP_FROM || '"GWD ERP" <noreply@getworkdone.com>',
            to: Array.isArray(config.to) ? config.to.join(', ') : config.to,
            subject: config.subject,
            html: config.html,
            text: config.text,
            attachments
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
        clientAddress?: string;
        total: number;
        subtotal?: number;
        tax?: number;
        taxRate?: number;
        discount?: number;
        dueDate: string;
        items?: { description: string; quantity: number; total: number }[];
        notes?: string;
        paymentTerms?: string;
        viewUrl?: string;
    }) => {
        const fmt = (v: number) => '₹' + v.toLocaleString('en-IN');
        const fmtDate = (d: string) => {
            try { return new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }).toUpperCase(); }
            catch { return d; }
        };

        // Use CID reference for logo - this works in all email clients
        const logoHtml = '<img src="cid:companylogo@gwd" alt="Get Work Done" style="max-height:60px;width:auto;" />';

        return {
            subject: 'Invoice ' + data.invoiceNumber + ' from Get Work Done',
            html: '<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><style>'
                + 'body{font-family:Arial,sans-serif;line-height:1.6;color:#333;margin:0;padding:20px;background:#f3f4f6}'
                + '.container{max-width:650px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.1)}'
                + '.header{background:#fff;padding:30px;text-align:center;border-bottom:3px solid #dc2626}'
                + '.logo-text{font-size:28px;font-weight:bold;color:#dc2626;letter-spacing:3px}'
                + '.invoice-title{color:#dc2626;font-size:14px;letter-spacing:5px;margin-top:10px;font-weight:600}'
                + '.content{padding:30px}'
                + '.meta-label{color:#6b7280;font-size:11px;text-transform:uppercase;letter-spacing:1px}'
                + '.meta-value{font-weight:bold;color:#dc2626;font-size:14px}'
                + '.client-info{background:#f9fafb;padding:20px;border-radius:8px;margin-bottom:25px}'
                + '.client-label{font-weight:bold;color:#374151;font-size:11px;letter-spacing:1px;text-transform:uppercase}'
                + '.items-table{width:100%;border-collapse:collapse;margin-bottom:25px}'
                + '.items-table th{background:#1f2937;color:#fff;padding:12px 15px;text-align:left;font-size:12px;text-transform:uppercase;letter-spacing:.5px}'
                + '.items-table td{padding:12px 15px;border-bottom:1px solid #e5e7eb;font-size:14px}'
                + '.totals{width:280px;margin-left:auto}'
                + '.totals-row{padding:8px 0;border-bottom:1px solid #e5e7eb;font-size:14px;overflow:hidden}'
                + '.totals-row .lbl{float:left;color:#6b7280}.totals-row .val{float:right}'
                + '.totals-final{background:#fee2e2;padding:15px;border-radius:8px;margin-top:10px;overflow:hidden}'
                + '.totals-final .lbl{float:left;font-weight:600;font-size:16px}.totals-final .val{float:right;color:#dc2626;font-size:24px;font-weight:bold}'
                + '.bank-details{background:#f9fafb;padding:20px;border-radius:8px;margin-top:25px;border-left:4px solid #dc2626}'
                + '.bank-details h4{margin:0 0 15px;color:#374151;font-size:14px}'
                + '.bank-details p{margin:5px 0;font-size:13px;color:#4b5563}'
                + '.btn{display:inline-block;background:#dc2626;color:#fff!important;padding:14px 30px;text-decoration:none;border-radius:8px;margin-top:25px;font-weight:bold;font-size:14px}'
                + '.footer{background:#1f2937;color:#9ca3af;padding:20px;text-align:center;font-size:12px}'
                + '.footer-brand{color:#fff;font-size:16px;letter-spacing:3px;margin-bottom:10px}'
                + '</style></head><body><div class="container">'
                // Header with CID logo
                + '<div class="header">'
                + logoHtml
                + '<div class="invoice-title">INVOICE</div>'
                + '</div>'
                // Content
                + '<div class="content">'
                // Meta row
                + '<table width="100%" style="margin-bottom:25px;"><tr>'
                + '<td><span class="meta-label">INVOICE #</span><br><strong>' + data.invoiceNumber + '</strong></td>'
                + '<td align="right"><span class="meta-label">DATE</span><br><span class="meta-value">' + fmtDate(new Date().toISOString()) + '</span></td>'
                + '<td align="right"><span class="meta-label">DUE DATE</span><br><span class="meta-value">' + fmtDate(data.dueDate) + '</span></td>'
                + '</tr></table>'
                // Payment terms
                + (data.paymentTerms ? '<div style="margin-bottom:15px;"><span class="meta-label">PAYMENT TERMS</span><br><strong>' + data.paymentTerms + '</strong></div>' : '')
                // Client info
                + '<div class="client-info"><div class="client-label">BILL TO:</div><strong>' + data.clientName + '</strong>'
                + (data.clientEmail ? '<br>' + data.clientEmail : '')
                + (data.clientAddress ? '<br><span style="color:#6b7280;">' + data.clientAddress + '</span>' : '')
                + '</div>'
                // Items table
                + '<table class="items-table"><thead><tr>'
                + '<th>Description</th><th style="text-align:center;width:60px;">Qty</th><th style="text-align:right;width:120px;">Amount</th>'
                + '</tr></thead><tbody>'
                + (data.items && data.items.length > 0
                    ? data.items.map(item => '<tr><td>' + item.description + '</td><td style="text-align:center;">' + item.quantity + '</td><td style="text-align:right;">' + fmt(item.total || 0) + '</td></tr>').join('')
                    : '<tr><td colspan="3" style="text-align:center;">Service charges</td></tr>')
                + '</tbody></table>'
                // Totals
                + '<div class="totals">'
                + '<div class="totals-row"><span class="lbl">Subtotal</span><span class="val">' + fmt(data.subtotal || data.total) + '</span></div>'
                + (data.tax && data.tax > 0 ? '<div class="totals-row"><span class="lbl">Tax (' + (data.taxRate || 0) + '%)</span><span class="val">' + fmt(data.tax) + '</span></div>' : '')
                + (data.discount && data.discount > 0 ? '<div class="totals-row"><span class="lbl">Discount</span><span class="val" style="color:#16a34a;">-' + fmt(data.discount) + '</span></div>' : '')
                + '<div class="totals-final"><span class="lbl">Total Due</span><span class="val">' + fmt(data.total) + '</span></div>'
                + '</div>'
                // Notes
                + (data.notes ? '<div style="margin-top:25px;"><strong>Notes:</strong><p style="color:#6b7280;margin:5px 0;">' + data.notes + '</p></div>' : '')
                // Bank details
                + '<div class="bank-details">'
                + '<h4>Bank Details for Payment</h4>'
                + '<p><strong>Bank:</strong> State Bank of India</p>'
                + '<p><strong>Account Name:</strong> GET WORK DONE TECHNOLOGIES</p>'
                + '<p><strong>Account No:</strong> 37053009951</p>'
                + '<p><strong>IFSC:</strong> SBIN0020951</p>'
                + '</div>'
                // View online button
                + (data.viewUrl ? '<div style="text-align:center;margin-top:30px;"><a href="' + data.viewUrl + '" class="btn">View Invoice Online</a></div>' : '')
                + '</div>'
                // Footer
                + '<div class="footer">'
                + '<div class="footer-brand">GET WORK DONE</div>'
                + '<p>Get Work Done Technologies | Nalgonda, Telangana, India</p>'
                + '<p>Thank you for your business!</p>'
                + '</div>'
                + '</div></body></html>',
            text: 'Invoice ' + data.invoiceNumber + '\n\nDear ' + data.clientName + ',\n\nAmount Due: ' + fmt(data.total) + '\nDue Date: ' + data.dueDate + (data.paymentTerms ? '\nPayment Terms: ' + data.paymentTerms : '') + '\n\n' + (data.items?.map(i => i.description + ': ' + fmt(i.total)).join('\n') || '') + '\n\nBank: State Bank of India\nAccount: 37053009951\nIFSC: SBIN0020951\n\nThank you for your business.\n\n- Get Work Done'
        };
    },

    // Notification Alert Email
    notification: (data: {
        userName: string;
        title: string;
        message: string;
        actionUrl?: string;
    }) => ({
        subject: '[GWD ERP] ' + data.title,
        html: '<!DOCTYPE html><html><head><meta charset="utf-8"><style>'
            + 'body{font-family:Arial,sans-serif;line-height:1.6;color:#333;max-width:600px;margin:0 auto;padding:20px}'
            + '.header{background:#1f2937;color:#fff;padding:20px;border-radius:8px 8px 0 0;text-align:center}'
            + '.content{background:#f9fafb;padding:30px;border-radius:0 0 8px 8px}'
            + '.button{display:inline-block;background:#2563eb;color:#fff;padding:10px 20px;text-decoration:none;border-radius:6px}'
            + '</style></head><body>'
            + '<div class="header"><h2>GWD ERP Notification</h2></div>'
            + '<div class="content">'
            + '<p>Hi ' + data.userName + ',</p>'
            + '<h3>' + data.title + '</h3>'
            + '<p>' + data.message + '</p>'
            + (data.actionUrl ? '<p><a href="' + data.actionUrl + '" class="button">Take Action</a></p>' : '')
            + '</div></body></html>',
        text: 'Hi ' + data.userName + ',\n\n' + data.title + '\n\n' + data.message
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
        subject: 'Leave Request from ' + data.employeeName,
        html: '<!DOCTYPE html><html><head><meta charset="utf-8"><style>'
            + 'body{font-family:Arial,sans-serif;line-height:1.6;color:#333;max-width:600px;margin:0 auto;padding:20px}'
            + '.card{background:#f9fafb;padding:20px;border-radius:8px;border-left:4px solid #2563eb}'
            + 'table{width:100%;margin:20px 0}td{padding:8px 0}'
            + '</style></head><body>'
            + '<h2>Leave Request</h2>'
            + '<div class="card">'
            + '<p>Hi ' + data.approverName + ',</p>'
            + '<p><strong>' + data.employeeName + '</strong> has submitted a leave request:</p>'
            + '<table>'
            + '<tr><td><strong>Leave Type:</strong></td><td>' + data.leaveType + '</td></tr>'
            + '<tr><td><strong>From:</strong></td><td>' + data.startDate + '</td></tr>'
            + '<tr><td><strong>To:</strong></td><td>' + data.endDate + '</td></tr>'
            + '<tr><td><strong>Reason:</strong></td><td>' + data.reason + '</td></tr>'
            + '</table>'
            + '<p>Please log in to the ERP to approve or reject this request.</p>'
            + '</div></body></html>',
        text: 'Leave Request from ' + data.employeeName + '\n\nType: ' + data.leaveType + '\nFrom: ' + data.startDate + '\nTo: ' + data.endDate + '\nReason: ' + data.reason
    })
};

export default { sendEmail, EmailTemplates };
