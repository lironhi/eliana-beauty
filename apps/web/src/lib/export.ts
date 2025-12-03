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

  // Create HTML content for PDF with beautiful design
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>${title || filename}</title>
      <style>
        @page {
          margin: 15mm;
          size: A4 landscape;
        }

        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          color: #1f2937;
          background: linear-gradient(135deg, #fdf2f8 0%, #fce7f3 100%);
          padding: 20px;
        }

        .container {
          background: white;
          border-radius: 16px;
          box-shadow: 0 10px 40px rgba(236, 72, 153, 0.1);
          overflow: hidden;
        }

        .header {
          background: linear-gradient(135deg, #ec4899 0%, #db2777 100%);
          padding: 25px 30px;
          color: white;
          position: relative;
          overflow: hidden;
        }

        .header::before {
          content: '';
          position: absolute;
          top: -50%;
          right: -10%;
          width: 300px;
          height: 300px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 50%;
        }

        .header::after {
          content: '';
          position: absolute;
          bottom: -30%;
          left: -5%;
          width: 200px;
          height: 200px;
          background: rgba(255, 255, 255, 0.08);
          border-radius: 50%;
        }

        .header-content {
          position: relative;
          z-index: 1;
        }

        .logo-container {
          display: flex;
          align-items: center;
          gap: 15px;
          margin-bottom: 10px;
        }

        .logo {
          height: 45px;
          width: auto;
        }

        .brand-name {
          font-size: 28px;
          font-weight: 800;
          letter-spacing: -0.5px;
        }

        .subtitle {
          font-size: 14px;
          opacity: 0.95;
          font-weight: 300;
          margin-bottom: 12px;
        }

        .report-title {
          font-size: 20px;
          font-weight: 700;
          padding-top: 12px;
          border-top: 2px solid rgba(255, 255, 255, 0.3);
        }

        .content {
          padding: 25px 30px;
        }

        .meta-info {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
          padding: 20px;
          background: linear-gradient(135deg, #fdf2f8 0%, #fce7f3 100%);
          border-radius: 12px;
          border-left: 4px solid #ec4899;
        }

        .meta-item {
          display: flex;
          flex-direction: column;
        }

        .meta-label {
          font-size: 11px;
          color: #9ca3af;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          font-weight: 600;
          margin-bottom: 4px;
        }

        .meta-value {
          font-size: 14px;
          color: #1f2937;
          font-weight: 600;
        }

        table {
          width: 100%;
          border-collapse: separate;
          border-spacing: 0;
          margin-top: 10px;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
        }

        thead {
          background: linear-gradient(135deg, #1f2937 0%, #374151 100%);
        }

        th {
          color: white;
          font-weight: 600;
          text-align: left;
          padding: 10px 8px;
          font-size: 9px;
          text-transform: uppercase;
          letter-spacing: 0.3px;
        }

        th:first-child {
          border-top-left-radius: 12px;
        }

        th:last-child {
          border-top-right-radius: 12px;
        }

        tbody tr {
          border-bottom: 1px solid #f3f4f6;
          transition: all 0.3s ease;
        }

        tbody tr:last-child {
          border-bottom: none;
        }

        tbody tr:nth-child(odd) {
          background-color: #ffffff;
        }

        tbody tr:nth-child(even) {
          background-color: #fafafa;
        }

        td {
          padding: 8px;
          font-size: 10px;
          color: #374151;
          max-width: 150px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        td:first-child {
          font-weight: 600;
          color: #ec4899;
        }

        .footer {
          margin-top: 40px;
          padding: 30px;
          background: linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%);
          border-top: 3px solid #ec4899;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .footer-left {
          flex: 1;
        }

        .footer-brand {
          font-size: 18px;
          font-weight: 700;
          color: #1f2937;
          margin-bottom: 4px;
        }

        .footer-tagline {
          font-size: 12px;
          color: #6b7280;
          font-style: italic;
        }

        .footer-right {
          text-align: right;
          color: #6b7280;
          font-size: 12px;
        }

        .generated-date {
          font-weight: 600;
          color: #374151;
        }

        .summary {
          display: flex;
          gap: 20px;
          margin-bottom: 30px;
        }

        .summary-card {
          flex: 1;
          padding: 20px;
          background: white;
          border-radius: 12px;
          border: 2px solid #fce7f3;
          text-align: center;
        }

        .summary-value {
          font-size: 28px;
          font-weight: 800;
          color: #ec4899;
          margin-bottom: 8px;
        }

        .summary-label {
          font-size: 12px;
          color: #6b7280;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          font-weight: 600;
        }

        @media print {
          body {
            background: white;
            padding: 0;
          }

          .container {
            box-shadow: none;
          }

          @page {
            margin: 15mm;
          }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="header-content">
            <div class="logo-container">
              <img src="/logo.png" alt="Eliana Beauty" class="logo" />
              <div class="brand-name">Eliana Beauty</div>
            </div>
            <div class="subtitle">Professional Beauty & Spa Services</div>
            <div class="report-title">${title || filename}</div>
          </div>
        </div>

        <div class="content">
          <div class="meta-info">
            <div class="meta-item">
              <span class="meta-label">Generated On</span>
              <span class="meta-value">${new Date().toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}</span>
            </div>
            <div class="meta-item">
              <span class="meta-label">Time</span>
              <span class="meta-value">${new Date().toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
                hour12: true
              })}</span>
            </div>
            <div class="meta-item">
              <span class="meta-label">Total Records</span>
              <span class="meta-value">${rows.length}</span>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                ${headers.map(h => `<th>${h}</th>`).join('')}
              </tr>
            </thead>
            <tbody>
              ${rows.map(row => `
                <tr>
                  ${row.map((cell, idx) => `<td>${cell || (idx === 10 ? '-' : 'N/A')}</td>`).join('')}
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>

        <div class="footer">
          <div class="footer-left">
            <div class="footer-brand">Eliana Beauty</div>
            <div class="footer-tagline">Where Beauty Meets Excellence</div>
          </div>
          <div class="footer-right">
            <div>Document generated automatically</div>
            <div class="generated-date">${new Date().toLocaleString()}</div>
          </div>
        </div>
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
    'Payment',
    'Status',
    'Notes'
  ];

  const getPaymentMethodLabel = (method: string | null) => {
    if (!method) return 'Not Set';
    const labels: Record<string, string> = {
      'CASH': '💵 Cash',
      'CREDIT_CARD': '💳 Credit Card',
      'DEBIT_CARD': '💳 Debit Card',
      'BIT': '📱 Bit',
      'PAYBOX': '💰 PayBox',
      'BANK_TRANSFER': '🏦 Bank Transfer',
      'OTHER': '💼 Other',
      'NOT_PAID': '⏳ Not Paid'
    };
    return labels[method] || method;
  };

  const rows = appointments.map(apt => [
    apt.id.substring(0, 8),
    apt.client?.name || 'N/A',
    apt.client?.email || 'N/A',
    apt.service?.name || 'N/A',
    apt.staff?.name || 'Any',
    new Date(apt.startsAt).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }),
    new Date(apt.startsAt).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    }),
    `${apt.service?.durationMin || 0} min`,
    `₪${apt.priceIls || apt.service?.priceIls || 0}`,
    getPaymentMethodLabel(apt.paymentMethod),
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
