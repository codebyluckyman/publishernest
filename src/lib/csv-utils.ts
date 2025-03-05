
/**
 * Converts an array of objects to a CSV string
 */
export function objectsToCSV<T extends Record<string, any>>(
  data: T[],
  columns: { key: keyof T; label: string }[]
): string {
  if (!data.length) return '';
  
  // Create header row
  const header = columns.map(col => `"${col.label}"`).join(',');
  
  // Create data rows
  const rows = data.map(item => {
    return columns.map(col => {
      const value = item[col.key];
      // Handle different value types
      if (value === null || value === undefined) return '""';
      if (typeof value === 'string') return `"${value.replace(/"/g, '""')}"`;
      return `"${value}"`;
    }).join(',');
  });
  
  // Combine header and rows
  return [header, ...rows].join('\n');
}

/**
 * Downloads data as a CSV file
 */
export function downloadCSV(csvContent: string, filename: string): void {
  // Create CSV content with BOM for Excel compatibility
  const csv = '\ufeff' + csvContent;
  
  // Create a blob with the data
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  
  // Create a download link
  const link = document.createElement('a');
  
  // Handle different browser supports
  if (navigator.msSaveBlob) {
    // IE 10+
    navigator.msSaveBlob(blob, filename);
    return;
  }
  
  // Create a URL for the blob
  const url = URL.createObjectURL(blob);
  
  // Set link properties
  link.href = url;
  link.download = filename;
  link.style.visibility = 'hidden';
  
  // Append to document, trigger click, and clean up
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
