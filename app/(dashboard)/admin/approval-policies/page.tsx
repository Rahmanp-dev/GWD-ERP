import { getAllApprovalPolicies, getEligibleDelegates } from "@/lib/actions/approval-policy";
import ApprovalPolicyClient from "./client";

export const dynamic = 'force-dynamic';

export default async function ApprovalPoliciesPage() {
    const policies = JSON.parse(JSON.stringify(await getAllApprovalPolicies()));
    const delegates = JSON.parse(JSON.stringify(await getEligibleDelegates()));

    return (
        <div className="p-6 space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Content Approval Policies</h1>
                    <p className="text-gray-500">Configure vertical-specific escalation and delegation rules.</p>
                </div>
            </div>

            <ApprovalPolicyClient initialPolicies={policies} delegates={delegates} />
        </div>
    );
}
