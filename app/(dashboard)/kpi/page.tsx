import { auth } from "@/auth";
import { getKPIs } from "@/lib/actions/kpi";
import KPIDashboard from "@/components/kpi/kpi-dashboard-client";

export default async function Page() {
    const session = await auth();
    const kpis = await getKPIs('Daily'); // Default to Daily view

    return <KPIDashboard kpis={kpis} userRole={session?.user?.role || ''} />;
}
