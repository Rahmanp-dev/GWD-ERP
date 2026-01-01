"use client";

import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { useEffect, useState } from 'react';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
);

export const options = {
    responsive: true,
    plugins: {
        legend: {
            position: 'top' as const,
        },
        title: {
            display: true,
            text: 'Revenue vs Expenses',
        },
    },
};

export default function FinanceChart() {
    const [data, setData] = useState<any>(null);

    useEffect(() => {
        // Fetch aggregated data
        // For MVP, handling basic simulation or fetching raw transactions and aggregating on client
        // In production, use an aggregation API endpoint
        fetchData();
    }, []);

    const fetchData = async () => {
        const res = await fetch('/api/finance/transactions');
        const transactions = await res.json();

        // Simple client-side aggregation for demo
        const revenue = transactions.filter((t: any) => t.type === 'Revenue').reduce((acc: number, t: any) => acc + t.amount, 0);
        const expenses = transactions.filter((t: any) => t.type === 'Expense').reduce((acc: number, t: any) => acc + t.amount, 0);

        setData({
            labels: ['Current Period'],
            datasets: [
                {
                    label: 'Revenue',
                    data: [revenue],
                    backgroundColor: 'rgba(53, 162, 235, 0.5)',
                },
                {
                    label: 'Expenses',
                    data: [expenses],
                    backgroundColor: 'rgba(255, 99, 132, 0.5)',
                },
            ],
        });
    }

    if (!data) return <div>Loading Chart...</div>;

    return <Bar options={options} data={data} />;
}
