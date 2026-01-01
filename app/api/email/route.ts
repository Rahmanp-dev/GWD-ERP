import { auth } from "@/auth";
import { NextResponse } from "next/server";
import { sendEmail, EmailTemplates } from "@/lib/email-service";

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
    try {
        const session = await auth();
        if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const body = await req.json();
        const { type, data } = body;

        if (!type || !data) {
            return NextResponse.json({ error: "Type and data required" }, { status: 400 });
        }

        let emailConfig;

        switch (type) {
            case 'invoice':
                if (!data.to || !data.invoiceNumber || !data.clientName || !data.total || !data.dueDate) {
                    return NextResponse.json({ error: "Missing invoice email data" }, { status: 400 });
                }
                const invoiceTemplate = EmailTemplates.invoice({
                    invoiceNumber: data.invoiceNumber,
                    clientName: data.clientName,
                    total: data.total,
                    dueDate: data.dueDate,
                    viewUrl: data.viewUrl
                });
                emailConfig = {
                    to: data.to,
                    subject: invoiceTemplate.subject,
                    html: invoiceTemplate.html,
                    text: invoiceTemplate.text
                };
                break;

            case 'notification':
                if (!data.to || !data.userName || !data.title || !data.message) {
                    return NextResponse.json({ error: "Missing notification email data" }, { status: 400 });
                }
                const notifTemplate = EmailTemplates.notification({
                    userName: data.userName,
                    title: data.title,
                    message: data.message,
                    actionUrl: data.actionUrl
                });
                emailConfig = {
                    to: data.to,
                    subject: notifTemplate.subject,
                    html: notifTemplate.html,
                    text: notifTemplate.text
                };
                break;

            case 'leave':
                if (!data.to || !data.employeeName || !data.leaveType) {
                    return NextResponse.json({ error: "Missing leave email data" }, { status: 400 });
                }
                const leaveTemplate = EmailTemplates.leaveRequest({
                    employeeName: data.employeeName,
                    leaveType: data.leaveType,
                    startDate: data.startDate,
                    endDate: data.endDate,
                    reason: data.reason,
                    approverName: data.approverName || 'Manager'
                });
                emailConfig = {
                    to: data.to,
                    subject: leaveTemplate.subject,
                    html: leaveTemplate.html,
                    text: leaveTemplate.text
                };
                break;

            default:
                return NextResponse.json({ error: "Unknown email type" }, { status: 400 });
        }

        const result = await sendEmail(emailConfig);

        if (result.success) {
            return NextResponse.json({ success: true, messageId: result.messageId });
        } else {
            return NextResponse.json({ error: result.error }, { status: 500 });
        }
    } catch (e: any) {
        console.error("Email API Error:", e);
        return NextResponse.json({ error: e.message || "Server Error" }, { status: 500 });
    }
}
