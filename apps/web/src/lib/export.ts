// Export utilities for CSV and PDF generation
import toast from 'react-hot-toast';

interface ExportData {
  headers: string[];
  rows: string[][];
  title?: string;
}

/**
 * Export data to CSV format
 */
export function exportToCSV(data: ExportData, filename: string) {
  const { headers, rows } = data;

  // Create CSV content
  const csvContent = [
    headers.join(','),
    ...rows.map(row =>
      row.map(cell => {
        // Escape quotes and wrap in quotes if contains comma
        const escaped = String(cell).replace(/"/g, '""');
        return escaped.includes(',') ? `"${escaped}"` : escaped;
      }).join(',')
    )
  ].join('\n');

  // Create blob and download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  link.style.visibility = 'hidden';

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
}

/**
 * Export data to PDF format using simple HTML-based approach
 */
export function exportToPDF(data: ExportData, filename: string) {
  const { headers, rows, title } = data;

  // Create HTML content for PDF
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>${title || filename}</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          padding: 20px;
          color: #333;
        }
        h1 {
          color: #1f2937;
          border-bottom: 2px solid #ec4899;
          padding-bottom: 10px;
          margin-bottom: 20px;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 20px;
        }
        th {
          background-color: #f3f4f6;
          color: #1f2937;
          font-weight: 600;
          text-align: left;
          padding: 12px;
          border: 1px solid #d1d5db;
        }
        td {
          padding: 10px 12px;
          border: 1px solid #d1d5db;
        }
        tr:nth-child(even) {
          background-color: #f9fafb;
        }
        .footer {
          margin-top: 30px;
          padding-top: 10px;
          border-top: 1px solid #d1d5db;
          text-align: center;
          color: #6b7280;
          font-size: 12px;
        }
      </style>
    </head>
    <body>
      <h1>${title || filename}</h1>
      <table>
        <thead>
          <tr>
            ${headers.map(h => `<th>${h}</th>`).join('')}
          </tr>
        </thead>
        <tbody>
          ${rows.map(row => `
            <tr>
              ${row.map(cell => `<td>${cell}</td>`).join('')}
            </tr>
          `).join('')}
        </tbody>
      </table>
      <div class="footer">
        <p>Generated on ${new Date().toLocaleString()}</p>
        <p>Eliana Beauty - Booking System</p>
      </div>
    </body>
    </html>
  `;

  // Open print dialog
  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.write(htmlContent);
    printWindow.document.close();

    // Wait for content to load, then trigger print
    printWindow.onload = () => {
      printWindow.focus();
      printWindow.print();
      // Note: User can choose "Save as PDF" in the print dialog
    };
  } else {
    toast.error('Please allow popups to export to PDF');
  }
}

/**
 * Format appointment data for export
 */
export function formatAppointmentsForExport(appointments: any[]) {
  const headers = [
    'ID',
    'Client Name',
    'Client Email',
    'Service',
    'Staff',
    'Date',
    'Time',
    'Duration',
    'Price',
    'Status',
    'Notes'
  ];

  const rows = appointments.map(apt => [
    apt.id.substring(0, 8),
    apt.user?.name || 'N/A',
    apt.user?.email || 'N/A',
    apt.service?.name || 'N/A',
    apt.staff?.name || 'Any',
    new Date(apt.startsAt).toLocaleDateString(),
    new Date(apt.startsAt).toLocaleTimeString(),
    `${apt.service?.durationMin || 0} min`,
    `₪${apt.service?.priceIls || 0}`,
    apt.status,
    apt.notes || ''
  ]);

  return { headers, rows, title: 'Appointments Report' };
}

/**
 * Format client data for export
 */
export function formatClientsForExport(clients: any[]) {
  const headers = [
    'ID',
    'Name',
    'Email',
    'Phone',
    'Total Appointments',
    'Active',
    'Joined Date'
  ];

  const rows = clients.map(client => [
    client.id.substring(0, 8),
    client.name || 'N/A',
    client.email || 'N/A',
    client.phone || 'N/A',
    String(client._count?.appointments || 0),
    client.active ? 'Yes' : 'No',
    new Date(client.createdAt).toLocaleDateString()
  ]);

  return { headers, rows, title: 'Clients Report' };
}

/**
 * Format services data for export
 */
export function formatServicesForExport(services: any[]) {
  const headers = [
    'ID',
    'Name',
    'Category',
    'Duration (min)',
    'Price (₪)',
    'Active',
    'Created Date'
  ];

  const rows = services.map(service => [
    service.id.substring(0, 8),
    service.name || 'N/A',
    service.category?.name || 'N/A',
    String(service.durationMin || 0),
    String(service.priceIls || 0),
    service.active ? 'Yes' : 'No',
    new Date(service.createdAt).toLocaleDateString()
  ]);

  return { headers, rows, title: 'Services Report' };
}

/**
 * Format staff data for export
 */
export function formatStaffForExport(staff: any[]) {
  const headers = [
    'ID',
    'Name',
    'Bio',
    'Services Count',
    'Total Appointments',
    'Active',
    'Joined Date'
  ];

  const rows = staff.map(member => [
    member.id.substring(0, 8),
    member.name || 'N/A',
    member.bio || 'N/A',
    String(member.staffServices?.length || 0),
    String(member._count?.appointments || 0),
    member.active ? 'Yes' : 'No',
    new Date(member.createdAt).toLocaleDateString()
  ]);

  return { headers, rows, title: 'Staff Report' };
}
