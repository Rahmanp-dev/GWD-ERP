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
        const { default: Transaction } = await import("@/lib/models/Transaction");

        // Fetch latest transactions
        const transactions = await Transaction.find({}).sort({ date: -1 }).limit(100);
        return NextResponse.json(transactions);
    } catch (e: any) {
        console.error("Finance Transactions GET Error:", e);
        return NextResponse.json([]);
    }
}

export async function POST(req: Request) {
    try {
        const session = await auth();
        if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { default: dbConnect } = await import("@/lib/db");
        await dbConnect();
        const { default: Transaction } = await import("@/lib/models/Transaction");

        const body = await req.json();

        if (!body.amount || !body.type) return NextResponse.json({ error: "Invalid data" }, { status: 400 });

        const transaction = await Transaction.create(body);
        return NextResponse.json(transaction, { status: 201 });
    } catch (e: any) {
        console.error("Finance Transactions POST Error:", e);
        return NextResponse.json({ error: "Server Error" }, { status: 500 });
    }
}
