"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import {
    Target,
    TrendingUp,
    DollarSign,
    Clock,
    CheckCircle,
    Phone,
    Calendar,
    ArrowRight
} from "lucide-react";

export default function SalespersonDashboard() {
    const { data: session } = useSession();
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchMyData();
    }, []);

    const fetchMyData = async () => {
        try {
            const [leadsRes, commissionsRes] = await Promise.all([
                fetch("/api/crm/leads"),
                fetch("/api/finance/commissions")
            ]);

            const leads = await leadsRes.json();
            const commissions = await commissionsRes.json();

            setData({ leads, commissions });
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (val: number) =>
        new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val || 0);

    if (loading) return <div className="p-8 text-center text-gray-500">Loading your dashboard...</div>;

    // Calculate stats from my deals
    const myDeals = data?.leads || [];
    const openDeals = myDeals.filter((d: any) => !['Closed Won', 'Closed Lost'].includes(d.status));
    const wonDeals = myDeals.filter((d: any) => d.status === 'Closed Won');
    const totalPipeline = openDeals.reduce((acc: number, d: any) => acc + (d.value || 0), 0);
    const totalWon = wonDeals.reduce((acc: number, d: any) => acc + (d.value || 0), 0);
    const commissionsEarned = data?.commissions?.totals?.totalPaid || 0;

    // Target simulation (in real app, fetch from targets API)
    const monthlyTarget = 100000;
    const targetProgress = Math.min(100, Math.round((totalWon / monthlyTarget) * 100));

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">My Sales Dashboard</h1>
                    <p className="text-sm text-gray-500">What do I do next?</p>
                </div>
                <div className="text-right">
                    <div className="text-sm text-gray-500">{new Date().toLocaleDateString()}</div>
                    <div className="text-sm font-medium text-red-600">Good {new Date().getHours() < 12 ? 'morning' : 'afternoon'}, {session?.user?.name?.split(' ')[0]}!</div>
                </div>
            </div>

            {/* Target Progress */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 rounded-xl text-white shadow-lg">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                        <Target className="w-6 h-6 mr-2" />
                        <span className="font-medium">Monthly Target Progress</span>
                    </div>
                    <span className="text-2xl font-bold">{targetProgress}%</span>
                </div>
                <div className="w-full bg-white/20 rounded-full h-3 mb-2">
                    <div className="bg-white h-3 rounded-full transition-all duration-500" style={{ width: `${targetProgress}%` }}></div>
                </div>
                <div className="flex justify-between text-sm opacity-80">
                    <span>{formatCurrency(totalWon)} achieved</span>
                    <span>{formatCurrency(monthlyTarget)} target</span>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white p-5 rounded-xl shadow-sm border">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="text-sm text-gray-500">My Pipeline</div>
                            <div className="text-2xl font-bold text-gray-900">{formatCurrency(totalPipeline)}</div>
                        </div>
                        <div className="p-3 bg-red-100 rounded-lg">
                            <TrendingUp className="w-6 h-6 text-red-600" />
                        </div>
                    </div>
                    <div className="text-sm text-gray-500 mt-2">{openDeals.length} open deals</div>
                </div>

                <div className="bg-white p-5 rounded-xl shadow-sm border">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="text-sm text-gray-500">Closed This Month</div>
                            <div className="text-2xl font-bold text-green-600">{formatCurrency(totalWon)}</div>
                        </div>
                        <div className="p-3 bg-green-100 rounded-lg">
                            <CheckCircle className="w-6 h-6 text-green-600" />
                        </div>
                    </div>
                    <div className="text-sm text-gray-500 mt-2">{wonDeals.length} deals won</div>
                </div>

                <div className="bg-white p-5 rounded-xl shadow-sm border">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="text-sm text-gray-500">Commission Earned</div>
                            <div className="text-2xl font-bold text-purple-600">{formatCurrency(commissionsEarned)}</div>
                        </div>
                        <div className="p-3 bg-purple-100 rounded-lg">
                            <DollarSign className="w-6 h-6 text-purple-600" />
                        </div>
                    </div>
                    <div className="text-sm text-gray-500 mt-2">Paid commissions</div>
                </div>

                <div className="bg-white p-5 rounded-xl shadow-sm border">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="text-sm text-gray-500">Follow-ups Due</div>
                            <div className="text-2xl font-bold text-orange-600">0</div>
                        </div>
                        <div className="p-3 bg-orange-100 rounded-lg">
                            <Clock className="w-6 h-6 text-orange-600" />
                        </div>
                    </div>
                    <div className="text-sm text-gray-500 mt-2">Due today</div>
                </div>
            </div>

            {/* Main Content */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* My Open Deals */}
                <div className="bg-white rounded-xl shadow-sm border p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold text-gray-800">My Open Deals</h3>
                        <a href="/crm/pipeline" className="text-sm text-red-600 hover:underline flex items-center">
                            View All <ArrowRight className="w-4 h-4 ml-1" />
                        </a>
                    </div>
                    <div className="space-y-3">
                        {openDeals.slice(0, 5).map((deal: any) => (
                            <div key={deal._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition cursor-pointer">
                                <div>
                                    <div className="font-medium text-gray-900">{deal.title}</div>
                                    <div className="text-sm text-gray-500">{deal.accountName || 'No Account'}</div>
                                </div>
                                <div className="text-right">
                                    <div className="font-semibold text-gray-900">{formatCurrency(deal.value)}</div>
                                    <span className={`text-xs px-2 py-1 rounded ${deal.status === 'Negotiation' ? 'bg-purple-100 text-purple-700' :
                                            deal.status === 'Proposal' ? 'bg-red-100 text-blue-700' :
                                                'bg-gray-100 text-gray-700'
                                        }`}>{deal.status}</span>
                                </div>
                            </div>
                        ))}
                        {openDeals.length === 0 && (
                            <div className="text-center py-8 text-gray-500">
                                No open deals. <a href="/crm/pipeline/new" className="text-red-600 hover:underline">Add one!</a>
                            </div>
                        )}
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="bg-white rounded-xl shadow-sm border p-6">
                    <h3 className="font-semibold text-gray-800 mb-4">Quick Actions</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <a href="/crm/pipeline/new" className="flex flex-col items-center justify-center p-6 bg-blue-50 rounded-xl hover:bg-red-100 transition">
                            <TrendingUp className="w-8 h-8 text-red-600 mb-2" />
                            <span className="font-medium text-gray-800">New Deal</span>
                        </a>
                        <a href="/crm/contacts/new" className="flex flex-col items-center justify-center p-6 bg-green-50 rounded-xl hover:bg-green-100 transition">
                            <Phone className="w-8 h-8 text-green-600 mb-2" />
                            <span className="font-medium text-gray-800">Add Contact</span>
                        </a>
                        <a href="/crm/pipeline" className="flex flex-col items-center justify-center p-6 bg-purple-50 rounded-xl hover:bg-purple-100 transition">
                            <Calendar className="w-8 h-8 text-purple-600 mb-2" />
                            <span className="font-medium text-gray-800">My Pipeline</span>
                        </a>
                        <a href="/finance/commissions" className="flex flex-col items-center justify-center p-6 bg-orange-50 rounded-xl hover:bg-orange-100 transition">
                            <DollarSign className="w-8 h-8 text-orange-600 mb-2" />
                            <span className="font-medium text-gray-800">Incentives</span>
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
}
