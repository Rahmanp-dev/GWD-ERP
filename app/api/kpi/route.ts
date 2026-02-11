"use server";

import { createKPI } from "@/lib/actions/kpi";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        await createKPI(body);
        return NextResponse.json({ success: true });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}

export async function DELETE(req: Request) {
    try {
        const { auth } = await import("@/auth");
        const session = await auth();
        if (!session || !['CEO', 'CFO', 'CMO', 'Admin'].includes(session.user?.role || '')) {
            return NextResponse.json({ error: "Only executives can delete KPIs" }, { status: 403 });
        }

        const { searchParams } = new URL(req.url);
        const id = searchParams.get('id');
        if (!id) return NextResponse.json({ error: "KPI ID required" }, { status: 400 });

        const { default: dbConnect } = await import("@/lib/db");
        await dbConnect();
        const { default: KPI } = await import("@/lib/models/KPI");
        const { default: Task } = await import("@/lib/models/Task");

        // Delete all linked tasks first
        await Task.deleteMany({ linkedKPI: id });
        // Delete the KPI
        await KPI.findByIdAndDelete(id);

        return NextResponse.json({ success: true });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
