
/**
 * Parses a CSV string with ISBNs into an array of ISBN values
 * Handles multiple formats (with/without headers, different delimiters)
 */
export function parseISBNsFromCSV(csvContent: string): string[] {
  // Split by new line
  const lines = csvContent.split(/\r?\n/);
  if (lines.length === 0) return [];
  
  // Try to detect if the file has a header
  const hasHeader = lines[0].toLowerCase().includes('isbn');
  
  // Start from the appropriate line (skip header if it exists)
  const startLine = hasHeader ? 1 : 0;
  
  // Collect all potential ISBN values
  const isbns: string[] = [];
  
  for (let i = startLine; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    
    // Try to handle both CSV with columns and simple lists
    if (line.includes(',')) {
      // Assume it's a CSV with multiple columns
      const columns = line.split(',');
      // Try to find a column that looks like an ISBN (13 digits after cleaning)
      for (const column of columns) {
        const cleaned = column.trim().replace(/[-\s]/g, '');
        if (/^\d{13}$/.test(cleaned)) {
          isbns.push(cleaned);
          break; // Found an ISBN in this line, move to next line
        }
      }
    } else {
      // Assume it's a simple list of ISBNs
      const cleaned = line.replace(/[-\s]/g, '');
      if (/^\d{13}$/.test(cleaned)) {
        isbns.push(cleaned);
      }
    }
  }
  
  // Return unique ISBNs only
  return [...new Set(isbns)];
}

/**
 * Creates a sample CSV content for ISBN import
 */
export function createSampleCSVContent(): string {
  return 'ISBN-13\n9781234567890\n9780987654321\n9782468013579';
}
