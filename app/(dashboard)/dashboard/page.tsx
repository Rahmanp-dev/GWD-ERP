import { auth } from "@/auth";

export default async function DashboardPage() {
    const session = await auth();
    const role = session?.user?.role || "User";

    return (
        <div className="space-y-6">
            <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200">
                <h1 className="text-3xl font-bold text-gray-900">Welcome back, {session?.user?.name || "User"}</h1>
                <p className="mt-2 text-gray-600">
                    You are logged in as <span className="font-semibold text-blue-600">{role}</span>.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Placeholder Stats Cards */}
                {['CEO', 'Admin', 'admin'].includes(role) && (
                    <>
                        <StatCard title="Total Revenue" value="$1.2M" trend="+12%" />
                        <StatCard title="Active Projects" value="8" trend="+2" />
                        <StatCard title="Employees" value="124" trend="+4" />
                        <StatCard title="Open Leads" value="45" trend="-5%" />
                    </>
                )}
                {['Sales Manager', 'Salesperson'].includes(role) && (
                    <>
                        <StatCard title="Pipeline Value" value="$450k" trend="+8%" />
                        <StatCard title="New Leads" value="12" trend="+12%" />
                        <StatCard title="Deals Closed" value="4" trend="+1" />
                    </>
                )}
                {!['CEO', 'Sales Manager', 'Admin', 'admin', 'Salesperson'].includes(role) && (
                    <div className="col-span-4 bg-blue-50 p-4 rounded text-blue-800">
                        Custom dashboard for {role} role coming soon.
                    </div>
                )}
            </div>
        </div>
    );
}

function StatCard({ title, value, trend }: { title: string, value: string, trend: string }) {
    const isPositive = trend.startsWith('+');
    return (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-sm font-medium text-gray-500 uppercase">{title}</h3>
            <div className="mt-2 flex items-baseline">
                <p className="text-3xl font-semibold text-gray-900">{value}</p>
                <p className={`ml-2 text-sm font-medium ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                    {trend}
                </p>
            </div>
        </div>
    )
}
