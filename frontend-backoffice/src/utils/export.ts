/**
 * Export/Download Utilities
 * Provides helper functions for exporting application data to various formats.
 * Supports CSV, JSON, Excel (TSV), and PDF exports with automatic file downloads.
 */

/**
 * Triggers a browser file download from a Blob.
 */
export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a   = document.createElement('a');
  a.href     = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Converts an array of objects to a CSV string.
 */
export function jsonToCsv(rows: Record<string, unknown>[]): string {
  if (rows.length === 0) return '';
  const headers = Object.keys(rows[0]);
  const lines = rows.map((row) =>
    headers
      .map((h) => {
        const val = row[h];
        const str = val === null || val === undefined ? '' : String(val);
        return str.includes(',') || str.includes('"')
          ? `"${str.replace(/"/g, '""')}"`
          : str;
      })
      .join(','),
  );
  return [headers.join(','), ...lines].join('\n');
}

/**
 * Downloads an array of objects as a CSV file.
 */
export function exportToCsv(data: Record<string, unknown>[], filename: string): void {
  const csv  = jsonToCsv(data);
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
  downloadBlob(blob, filename);
}

/**
 * Downloads an array of objects as a JSON file.
 */
export function exportToJson(data: unknown, filename: string): void {
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: 'application/json',
  });
  downloadBlob(blob, filename);
}

/**
 * Downloads an array of objects as an Excel-compatible CSV.
 * Uses tab separator for better Excel compatibility.
 */
export function exportToExcel(data: Record<string, unknown>[], filename: string): void {
  if (data.length === 0) return;
  const headers = Object.keys(data[0]);
  const lines = data.map((row) =>
    headers.map((h) => {
      const val = row[h];
      return val === null || val === undefined ? '' : String(val);
    }).join('\t'),
  );
  const content = [headers.join('\t'), ...lines].join('\n');
  const blob = new Blob(['\uFEFF' + content], {
    type: 'application/vnd.ms-excel;charset=utf-8;',
  });
  downloadBlob(blob, filename.endsWith('.xls') ? filename : `${filename}.xls`);
}

/**
 * Generates a printable PDF report by opening a styled print window.
 * Uses the browser's native print dialog — no external library needed.
 */
export function exportToPdf(htmlContent: string, title: string): void {
  const win = window.open('', '_blank');
  if (!win) return;

  win.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8" />
        <title>${title}</title>
        <style>
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body {
            font-family: 'Segoe UI', Arial, sans-serif;
            font-size: 13px;
            color: #111;
            padding: 32px;
            line-height: 1.5;
          }
          h1 { font-size: 22px; margin-bottom: 4px; }
          h2 { font-size: 16px; margin: 24px 0 12px; border-bottom: 1px solid #e0e0e0; padding-bottom: 6px; }
          p  { color: #5c5c5c; margin-bottom: 16px; font-size: 12px; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
          th { text-align: left; padding: 8px 12px; font-size: 11px; text-transform: uppercase;
               letter-spacing: 0.4px; background: #f4f5f7; border-bottom: 2px solid #e0e0e0; }
          td { padding: 8px 12px; border-bottom: 1px solid #f0f0f0; font-size: 12px; }
          .kpi-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 24px; }
          .kpi-card { background: #f9f9f9; border-radius: 8px; padding: 16px; border-left: 4px solid #c1121f; }
          .kpi-value { font-size: 24px; font-weight: 700; }
          .kpi-label { font-size: 11px; color: #5c5c5c; text-transform: uppercase; letter-spacing: 0.4px; }
          @media print {
            body { padding: 0; }
            button { display: none; }
          }
        </style>
      </head>
      <body>${htmlContent}</body>
    </html>
  `);
  win.document.close();
  win.focus();
  setTimeout(() => { win.print(); win.close(); }, 400);
}