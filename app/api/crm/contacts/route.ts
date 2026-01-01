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
        const { default: Contact } = await import("@/lib/models/Contact");
        const { default: Company } = await import("@/lib/models/Company"); // Ensure registered

        const contacts = await Contact.find({}).populate('company').sort({ createdAt: -1 });
        return NextResponse.json(contacts);
    } catch (e: any) {
        console.error("CRM Contacts GET Error:", e);
        return NextResponse.json([]);
    }
}

export async function POST(req: Request) {
    try {
        const session = await auth();
        if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { default: dbConnect } = await import("@/lib/db");
        await dbConnect();
        const { default: Contact } = await import("@/lib/models/Contact");

        const body = await req.json();

        if (!body.name) {
            return NextResponse.json({ error: "Name is required" }, { status: 400 });
        }

        const contact = await Contact.create(body);
        return NextResponse.json(contact, { status: 201 });
    } catch (e: any) {
        console.error("CRM Contacts POST Error:", e);
        return NextResponse.json({ error: "Server Error" }, { status: 500 });
    }
}
