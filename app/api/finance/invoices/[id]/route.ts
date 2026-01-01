import { auth } from "@/auth";
import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

export async function GET(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await auth();
        if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const resolvedParams = await params;
        const { id } = resolvedParams;

        const { default: dbConnect } = await import("@/lib/db");
        await dbConnect();
        const { default: Invoice } = await import("@/lib/models/Invoice");
        await import("@/lib/models/User");

        const invoice = await Invoice.findById(id)
            .populate('createdBy', 'name');

        if (!invoice) {
            return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
        }

        return NextResponse.json(invoice);
    } catch (e: any) {
        console.error("Invoice GET by ID Error:", e);
        return NextResponse.json({ error: "Server Error" }, { status: 500 });
    }
}
