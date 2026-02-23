import { auth } from "@/auth";
import { redirect } from "next/navigation";

export const dynamic = 'force-dynamic';

/**
 * Dashboard Router - Redirects users to role-specific dashboards
 */
export default async function DashboardPage() {
    const session = await auth();
    const role = session?.user?.role?.toLowerCase() || "";

    // Route to role-specific dashboards
    if (['ceo'].includes(role)) {
        redirect('/dashboard/ceo');
    } else if (['cmo', 'sales manager'].includes(role)) {
        redirect('/sales');
    } else if (['salesperson'].includes(role)) {
        redirect('/dashboard/my-sales');
    } else if (['project manager', 'pm'].includes(role)) {
        redirect('/projects/dashboard');
    } else if (['cfo'].includes(role)) {
        redirect('/dashboard/finance');
    } else if (['hr manager'].includes(role)) {
        redirect('/hr/dashboard');
    } else if (['ops', 'operations manager'].includes(role)) {
        redirect('/operations');
    } else if (['admin'].includes(role)) {
        redirect('/dashboard/admin');
    } else if (['content strategist', 'editor', 'production lead'].includes(role)) {
        redirect('/content');
    }

    // Default: Show generic welcome page
    return (
        <div className="space-y-6">
            <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200">
                <h1 className="text-3xl font-bold text-gray-900">Welcome, {session?.user?.name || "User"}</h1>
                <p className="mt-2 text-gray-600">
                    Role: <span className="font-semibold text-red-600">{session?.user?.role || "User"}</span>
                </p>
            </div>
            <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
                <p className="text-blue-800">Your role-specific dashboard is being configured. Please contact your administrator.</p>
            </div>
        </div>
    );
}
