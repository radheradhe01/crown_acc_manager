export function parseCsv(text: string): any[] {
  const lines = text.trim().split('\n').filter(line => line.trim().length > 0);
  if (lines.length === 0) return [];

  // Use proper CSV parsing that handles quoted fields
  const headers = parseCSVLine(lines[0]).map(h => h.trim());
  const data: any[] = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue; // Skip empty lines
    
    const values = parseCSVLine(line);
    if (values.length > 0) {
      const row: any = {};
      headers.forEach((header, index) => {
        // Normalize header names to match expected format
        const normalizedHeader = normalizeHeaderName(header);
        row[normalizedHeader] = values[index] || '';
      });
      data.push(row);
    }
  }

  return data;
}

// Proper CSV line parser that handles quoted fields
function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const nextChar = line[i + 1];
    
    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        // Escaped quote
        current += '"';
        i++; // Skip next quote
      } else {
        // Toggle quote state
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      // Field separator
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  
  // Add final field
  result.push(current.trim());
  
  return result;
}

// Alias for backward compatibility
export const parseCSV = parseCsv;

function normalizeHeaderName(header: string): string {
  const normalized = header.toLowerCase().replace(/[^a-z0-9]/g, '');
  
  // Map common variations to standard field names
  const fieldMap: { [key: string]: string } = {
    'date': 'date',
    'customername': 'customerName',
    'customer': 'customerName',
    'name': 'customerName',
    'revenue': 'revenue',
    'income': 'revenue',
    'sales': 'revenue',
    'cost': 'cost',
    'costs': 'cost',
    'expense': 'cost',
    'expenses': 'cost',
  };

  return fieldMap[normalized] || header;
}

export function validateCsvStructure(data: any[]): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (data.length === 0) {
    errors.push('CSV file is empty');
    return { isValid: false, errors };
  }

  const requiredFields = ['date', 'customerName', 'revenue', 'cost'];
  const firstRow = data[0];
  
  for (const field of requiredFields) {
    if (!firstRow.hasOwnProperty(field)) {
      errors.push(`Missing required field: ${field}`);
    }
  }

  // Validate data types
  for (let i = 0; i < Math.min(data.length, 10); i++) {
    const row = data[i];
    
    // Check if date is valid
    if (row.date && isNaN(Date.parse(row.date))) {
      errors.push(`Invalid date format in row ${i + 1}: ${row.date}`);
    }
    
    // Check if revenue is numeric
    if (row.revenue && isNaN(parseFloat(row.revenue))) {
      errors.push(`Invalid revenue value in row ${i + 1}: ${row.revenue}`);
    }
    
    // Check if cost is numeric
    if (row.cost && isNaN(parseFloat(row.cost))) {
      errors.push(`Invalid cost value in row ${i + 1}: ${row.cost}`);
    }
  }

  return { isValid: errors.length === 0, errors };
}

// Bank statement CSV validation
export function validateCSVHeaders(headers: string[]): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  const normalizedHeaders = headers.map(h => h.toLowerCase().replace(/[^a-z0-9]/g, ''));
  
  // Check for required headers
  if (!normalizedHeaders.includes('date')) {
    errors.push('Missing required header: date');
  }
  
  if (!normalizedHeaders.includes('description')) {
    errors.push('Missing required header: description');
  }
  
  // Check for amount columns - either 'amount' or both 'debit' and 'credit'
  const hasAmount = normalizedHeaders.includes('amount');
  const hasDebit = normalizedHeaders.includes('debit');
  const hasCredit = normalizedHeaders.includes('credit');
  
  if (!hasAmount && !(hasDebit || hasCredit)) {
    errors.push('Missing required amount column: either "amount" or "debit/credit" columns');
  }

  return { isValid: errors.length === 0, errors };
}

// Bank statement CSV parser
export function parseBankStatementCSV(text: string): any[] {
  const lines = text.trim().split('\n');
  if (lines.length === 0) return [];

  const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
  const data: any[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''));
    if (values.length === headers.length) {
      const row: any = {};
      headers.forEach((header, index) => {
        // Normalize header names to match expected format
        const normalizedHeader = normalizeBankStatementHeader(header);
        row[normalizedHeader] = values[index];
      });
      data.push(row);
    }
  }

  return data;
}

function normalizeBankStatementHeader(header: string): string {
  const normalized = header.toLowerCase().replace(/[^a-z0-9]/g, '');
  
  // Map common variations to standard field names
  const fieldMap: { [key: string]: string } = {
    'date': 'date',
    'transactiondate': 'date',
    'valuedate': 'date',
    'description': 'description',
    'particulars': 'description',
    'details': 'description',
    'reference': 'description',
    'amount': 'amount',
    'debit': 'debit',
    'credit': 'credit',
    'balance': 'balance',
    'runningbalance': 'balance',
  };

  return fieldMap[normalized] || header;
}