"use client";

import { useState } from "react";
import { updateApprovalPolicy } from "@/lib/actions/approval-policy";
import { Save } from "lucide-react";

export default function ApprovalPolicyClient({ initialPolicies, delegates }: { initialPolicies: any[], delegates: any[] }) {
    const [policies, setPolicies] = useState(initialPolicies);
    const [savingId, setSavingId] = useState<string | null>(null);

    const handleChange = (policyId: string, field: string, value: any) => {
        setPolicies(policies.map(p =>
            p._id === policyId ? { ...p, [field]: value } : p
        ));
    };

    const handleSave = async (policy: any) => {
        setSavingId(policy._id);
        try {
            await updateApprovalPolicy(policy._id, {
                require_ceo_signoff: policy.require_ceo_signoff,
                allow_strategist_publish: policy.allow_strategist_publish,
                auto_escalate: policy.auto_escalate,
                delegated_userId: policy.delegated_userId === "none" ? null : policy.delegated_userId
            });
            alert("Policy updated successfully");
        } catch (e) {
            console.error(e);
            alert("Failed to update policy");
        } finally {
            setSavingId(null);
        }
    };

    return (
        <div className="bg-white rounded-xl border overflow-hidden shadow-sm">
            <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 border-b">
                    <tr>
                        <th className="p-4 font-semibold text-gray-900">Content Vertical</th>
                        <th className="p-4 font-semibold text-gray-900">Require CEO Signoff</th>
                        <th className="p-4 font-semibold text-gray-900">Auto-Escalate (L1 -&gt; L2)</th>
                        <th className="p-4 font-semibold text-gray-900">Strategist Can Publish</th>
                        <th className="p-4 font-semibold text-gray-900">Delegated CEO Authority</th>
                        <th className="p-4 font-semibold text-gray-900">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                    {policies.map(policy => (
                        <tr key={policy._id} className="hover:bg-gray-50/50">
                            <td className="p-4 font-medium text-gray-900">
                                {policy.vertical}
                            </td>
                            <td className="p-4">
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        className="sr-only peer"
                                        checked={policy.require_ceo_signoff}
                                        onChange={(e) => handleChange(policy._id, 'require_ceo_signoff', e.target.checked)}
                                    />
                                    <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                                </label>
                            </td>
                            <td className="p-4">
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        className="sr-only peer"
                                        checked={policy.auto_escalate}
                                        onChange={(e) => handleChange(policy._id, 'auto_escalate', e.target.checked)}
                                    />
                                    <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-purple-600"></div>
                                </label>
                            </td>
                            <td className="p-4">
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        className="sr-only peer"
                                        checked={policy.allow_strategist_publish}
                                        onChange={(e) => handleChange(policy._id, 'allow_strategist_publish', e.target.checked)}
                                    />
                                    <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-green-600"></div>
                                </label>
                            </td>
                            <td className="p-4">
                                <select
                                    className="border rounded-lg text-sm px-2 py-1 focus:ring-2 focus:ring-blue-500 w-full max-w-[200px]"
                                    value={policy.delegated_userId || "none"}
                                    onChange={(e) => handleChange(policy._id, 'delegated_userId', e.target.value)}
                                    disabled={!policy.require_ceo_signoff}
                                >
                                    <option value="none">-- No Delegation --</option>
                                    {delegates.map(d => (
                                        <option key={d._id} value={d._id}>{d.name}</option>
                                    ))}
                                </select>
                            </td>
                            <td className="p-4">
                                <button
                                    onClick={() => handleSave(policy)}
                                    disabled={savingId === policy._id}
                                    className="text-white bg-blue-600 hover:bg-blue-700 px-3 py-1.5 rounded-lg text-xs font-medium flex items-center transition-colors disabled:opacity-50"
                                >
                                    <Save className="w-3 h-3 mr-1" />
                                    {savingId === policy._id ? 'Saving...' : 'Save'}
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
