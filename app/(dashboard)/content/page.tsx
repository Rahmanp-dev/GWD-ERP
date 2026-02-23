import { auth } from "@/auth";
import { getActiveModules, getIdeas, getPendingRequests, getProductionUsers } from "@/lib/actions/content-command";
import CommandCenterClient from "@/components/content/command-center-client";

export const dynamic = 'force-dynamic';

export default async function ContentQueuePage() {
    const session = await auth();
    const role = (session?.user as any)?.role || "User";
    const userId = (session?.user as any)?.id || "";

    const modules = await getActiveModules();
    const items = await getIdeas(undefined, userId, role);
    const requests = await getPendingRequests();
    const users = await getProductionUsers();

    return (
        <div className="h-full">
            <CommandCenterClient
                initialModules={modules}
                initialItems={items}
                initialRequests={requests}
                initialUsers={users}
                role={role}
                userId={userId}
            />
        </div>
    );
}
