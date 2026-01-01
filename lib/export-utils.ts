/**
 * Export utilities for CSV and data export
 */

interface ExportColumn {
    key: string;
    header: string;
    format?: (value: any) => string;
}

/**
 * Convert data array to CSV string
 */
export function toCSV(data: any[], columns: ExportColumn[]): string {
    // Header row
    const headers = columns.map(col => `"${col.header}"`).join(',');

    // Data rows
    const rows = data.map(item => {
        return columns.map(col => {
            let value = item[col.key];

            // Handle nested keys (e.g., "client.name")
            if (col.key.includes('.')) {
                const keys = col.key.split('.');
                value = keys.reduce((obj, key) => obj?.[key], item);
            }

            // Apply format function if provided
            if (col.format) {
                value = col.format(value);
            }

            // Escape quotes and wrap in quotes
            if (value === null || value === undefined) value = '';
            return `"${String(value).replace(/"/g, '""')}"`;
        }).join(',');
    });

    return [headers, ...rows].join('\n');
}

/**
 * Download data as CSV file
 */
export function downloadCSV(data: any[], columns: ExportColumn[], filename: string = 'export') {
    const csv = toCSV(data, columns);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

/**
 * Predefined export configurations
 */
export const ExportConfigs = {
    leads: [
        { key: 'title', header: 'Deal Title' },
        { key: 'accountName', header: 'Account' },
        { key: 'contactPerson', header: 'Contact' },
        { key: 'value', header: 'Value', format: (v: number) => v?.toFixed(2) || '0' },
        { key: 'status', header: 'Status' },
        { key: 'priority', header: 'Priority' },
        { key: 'source', header: 'Source' },
        { key: 'expectedCloseDate', header: 'Expected Close', format: (v: string) => v ? new Date(v).toLocaleDateString() : '' },
        { key: 'createdAt', header: 'Created', format: (v: string) => new Date(v).toLocaleDateString() }
    ],
    invoices: [
        { key: 'invoiceNumber', header: 'Invoice #' },
        { key: 'client.name', header: 'Client' },
        { key: 'subtotal', header: 'Subtotal', format: (v: number) => v?.toFixed(2) || '0' },
        { key: 'tax', header: 'Tax', format: (v: number) => v?.toFixed(2) || '0' },
        { key: 'total', header: 'Total', format: (v: number) => v?.toFixed(2) || '0' },
        { key: 'status', header: 'Status' },
        { key: 'dueDate', header: 'Due Date', format: (v: string) => v ? new Date(v).toLocaleDateString() : '' },
        { key: 'createdAt', header: 'Created', format: (v: string) => new Date(v).toLocaleDateString() }
    ],
    employees: [
        { key: 'name', header: 'Name' },
        { key: 'email', header: 'Email' },
        { key: 'department', header: 'Department' },
        { key: 'position', header: 'Position' },
        { key: 'status', header: 'Status' },
        { key: 'dateOfJoining', header: 'Joined', format: (v: string) => v ? new Date(v).toLocaleDateString() : '' }
    ],
    commissions: [
        { key: 'salesperson.name', header: 'Salesperson' },
        { key: 'deal.title', header: 'Deal' },
        { key: 'dealValue', header: 'Deal Value', format: (v: number) => v?.toFixed(2) || '0' },
        { key: 'commissionRate', header: 'Rate %', format: (v: number) => v?.toFixed(1) || '0' },
        { key: 'amount', header: 'Commission', format: (v: number) => v?.toFixed(2) || '0' },
        { key: 'status', header: 'Status' }
    ]
};
