"use client";

import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    LineElement,
    PointElement,
    Title,
    Tooltip,
    Legend
} from 'chart.js';
import { Chart } from 'react-chartjs-2';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    LineElement,
    PointElement,
    Title,
    Tooltip,
    Legend
);

export default function CashflowChart({ data }: { data: any[] }) {
    // Data processing: Group by Month -> { month, Inflow, Outflow, Net }
    const processedData: any = {};

    data.forEach((item: any) => {
        const key = `${item._id.year}-${String(item._id.month).padStart(2, '0')}`;
        if (!processedData[key]) {
            processedData[key] = {
                month: new Date(item._id.year, item._id.month - 1).toLocaleString('default', { month: 'short' }),
                revenue: 0,
                expenses: 0
            };
        }
        if (item._id.type === 'Inflow') {
            processedData[key].revenue += item.total;
        } else if (item._id.type === 'Outflow' || item._id.type === 'Liability') {
            processedData[key].expenses += item.total;
        }
    });

    // Convert to arrays sorted by date
    const sortedKeys = Object.keys(processedData).sort();
    const labels = sortedKeys.map(k => processedData[k].month);
    const revenueData = sortedKeys.map(k => processedData[k].revenue);
    const expenseData = sortedKeys.map(k => processedData[k].expenses);
    const netData = sortedKeys.map(k => processedData[k].revenue - processedData[k].expenses);

    const chartData = {
        labels,
        datasets: [
            {
                type: 'bar' as const,
                label: 'Revenue',
                data: revenueData,
                backgroundColor: 'rgba(34, 197, 94, 0.6)', // Green
                borderColor: 'rgb(34, 197, 94)',
                borderWidth: 1,
            },
            {
                type: 'bar' as const,
                label: 'Expenses',
                data: expenseData,
                backgroundColor: 'rgba(239, 68, 68, 0.6)', // Red
                borderColor: 'rgb(239, 68, 68)',
                borderWidth: 1,
            },
            {
                type: 'line' as const,
                label: 'Net Income',
                data: netData,
                borderColor: 'rgb(59, 130, 246)', // Blue
                borderWidth: 2,
                tension: 0.3,
                fill: false
            }
        ]
    };

    const options = {
        responsive: true,
        plugins: {
            legend: {
                position: 'top' as const,
            },
            title: {
                display: false,
                text: 'Cash Flow',
            },
        },
        scales: {
            y: {
                beginAtZero: true,
                ticks: {
                    callback: function (value: any) {
                        return '$' + value.toLocaleString();
                    }
                }
            }
        }
    };

    return <Chart type='bar' data={chartData} options={options} />;
}
