import { getKPIs } from "@/lib/actions/kpi";
import ProjectorClient from "@/components/kpi/projector-view"; // Use the client component we built!

export const dynamic = 'force-dynamic';

export default async function ProjectorPage() {
    // We can fetch initial data here if needed, or let the client component handle the "Live" polling.
    // The client component already fetches /api/kpi/stats.
    // Let's rely on the client component for the full experience + auto-refresh,
    // as it handles the "Team Stats" and "Recent Tasks" which are the requested features.

    return <ProjectorClient />;
}
