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
        const { default: Employee } = await import("@/lib/models/Employee");

        const employees = await Employee.find({}).sort({ name: 1 });
        return NextResponse.json(employees);
    } catch (e: any) {
        console.error("HR Employees GET Error:", e);
        return NextResponse.json([]);
    }
}

export async function POST(req: Request) {
    try {
        const session = await auth();
        if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { default: dbConnect } = await import("@/lib/db");
        await dbConnect();
        const { default: Employee } = await import("@/lib/models/Employee");

        const body = await req.json();

        if (!body.name || !body.email) {
            return NextResponse.json({ error: "Name and Email are required" }, { status: 400 });
        }

        const employee = await Employee.create(body);
        return NextResponse.json(employee, { status: 201 });
    } catch (e: any) {
        console.error("HR Employees POST Error:", e);
        return NextResponse.json({ error: "Server Error" }, { status: 500 });
    }
}
