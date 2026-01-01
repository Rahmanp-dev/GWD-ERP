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
    // Invoice Email Template
    invoice: (data: {
        invoiceNumber: string;
        clientName: string;
        total: number;
        dueDate: string;
        viewUrl?: string;
    }) => ({
        subject: `Invoice ${data.invoiceNumber} from Get Work Done`,
        html: `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { text-align: center; margin-bottom: 30px; }
        .logo { font-size: 32px; font-weight: bold; }
        .logo-g { color: #dc2626; }
        .logo-w { color: #eab308; }
        .logo-d { color: #16a34a; }
        .content { background: #f9fafb; padding: 30px; border-radius: 8px; }
        .amount { font-size: 28px; color: #dc2626; font-weight: bold; margin: 20px 0; }
        .button { display: inline-block; background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 20px; }
        .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 12px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">[<span class="logo-g">G</span><span class="logo-w">W</span><span class="logo-d">D</span>]</div>
            <div style="color: #dc2626; letter-spacing: 3px; font-size: 12px;">GET WORK DONE</div>
        </div>
        <div class="content">
            <h2>Invoice ${data.invoiceNumber}</h2>
            <p>Dear ${data.clientName},</p>
            <p>Thank you for your business. Please find your invoice details below:</p>
            <div class="amount">₹${data.total.toLocaleString('en-IN')}</div>
            <p><strong>Due Date:</strong> ${new Date(data.dueDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
            ${data.viewUrl ? `<a href="${data.viewUrl}" class="button">View Invoice</a>` : ''}
        </div>
        <div class="footer">
            <p>Get Work Done Technologies | Nalgonda, India</p>
            <p>This is an automated email. Please do not reply directly.</p>
        </div>
    </div>
</body>
</html>`,
        text: `Invoice ${data.invoiceNumber}\n\nDear ${data.clientName},\n\nAmount Due: ₹${data.total.toLocaleString('en-IN')}\nDue Date: ${data.dueDate}\n\nThank you for your business.\n\n- Get Work Done`
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
