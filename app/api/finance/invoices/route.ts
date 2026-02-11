import { auth } from "@/auth";
import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(req: Request) {
    try {
        const session = await auth();
        if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { default: dbConnect } = await import("@/lib/db");
        await dbConnect();
        const { default: Invoice } = await import("@/lib/models/Invoice");
        await import("@/lib/models/User");
        await import("@/lib/models/Lead");

        const { searchParams } = new URL(req.url);
        const status = searchParams.get('status');

        let query: any = {};
        if (status) query.status = status;

        const invoices = await Invoice.find(query)
            .populate('createdBy', 'name')
            .populate('deal', 'title accountName')
            .sort({ createdAt: -1 });

        // Calculate totals
        const totals = {
            draft: 0,
            sent: 0,
            paid: 0,
            overdue: 0
        };

        invoices.forEach((inv: any) => {
            if (inv.status === 'Draft') totals.draft += inv.total;
            else if (inv.status === 'Sent') totals.sent += inv.total;
            else if (inv.status === 'Paid') totals.paid += inv.total;
            else if (inv.status === 'Overdue') totals.overdue += inv.total;
        });

        return NextResponse.json({ invoices, totals });
    } catch (e: any) {
        console.error("Invoice GET Error:", e);
        return NextResponse.json({ error: "Server Error" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const session = await auth();
        if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { default: dbConnect } = await import("@/lib/db");
        await dbConnect();
        const { default: Invoice } = await import("@/lib/models/Invoice");

        const body = await req.json();
        const { client, items, taxRate = 0, discount = 0, dueDate, notes, deal, paymentTerms, termsAndConditions } = body;

        if (!client?.name || !items?.length || !dueDate) {
            return NextResponse.json({ error: "Client, items, and due date required" }, { status: 400 });
        }

        // Calculate totals
        const subtotal = items.reduce((acc: number, item: any) => {
            item.total = item.quantity * item.unitPrice;
            return acc + item.total;
        }, 0);

        const tax = subtotal * (taxRate / 100);
        const total = subtotal + tax - discount;

        // Generate invoice number
        const count = await Invoice.countDocuments();
        const invoiceNumber = `INV-${String(count + 1).padStart(5, '0')}`;

        const invoice = await Invoice.create({
            invoiceNumber,
            deal,
            client,
            items,
            subtotal,
            tax,
            taxRate,
            discount,
            total,
            dueDate,
            notes,
            paymentTerms,
            termsAndConditions,
            createdBy: session.user?.id
        });

        return NextResponse.json(invoice, { status: 201 });
    } catch (e: any) {
        console.error("Invoice POST Error:", e);
        return NextResponse.json({ error: e.message || "Server Error" }, { status: 500 });
    }
}

export async function PUT(req: Request) {
    try {
        const session = await auth();
        if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { default: dbConnect } = await import("@/lib/db");
        await dbConnect();
        const { default: Invoice } = await import("@/lib/models/Invoice");

        const body = await req.json();
        const { id, status } = body;

        if (!id || !status) {
            return NextResponse.json({ error: "ID and status required" }, { status: 400 });
        }

        const updateData: any = { status };
        if (status === 'Paid') {
            updateData.paidAt = new Date();
        }

        const invoice = await Invoice.findByIdAndUpdate(id, updateData, { new: true });
        return NextResponse.json(invoice);
    } catch (e: any) {
        console.error("Invoice PUT Error:", e);
        return NextResponse.json({ error: "Server Error" }, { status: 500 });
    }
}
