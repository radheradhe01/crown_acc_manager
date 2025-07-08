export interface CSVTransaction {
  date: string;
  description: string;
  amount: number;
  type: 'debit' | 'credit';
  reference?: string;
}

export function parseCSV(csvText: string): CSVTransaction[] {
  const lines = csvText.split('\n');
  const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
  
  const transactions: CSVTransaction[] = [];
  
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    
    const values = line.split(',').map(v => v.trim());
    
    try {
      const transaction: CSVTransaction = {
        date: values[headers.indexOf('date')] || '',
        description: values[headers.indexOf('description')] || '',
        amount: parseFloat(values[headers.indexOf('amount')] || '0'),
        type: parseFloat(values[headers.indexOf('amount')] || '0') < 0 ? 'debit' : 'credit',
        reference: values[headers.indexOf('reference')] || '',
      };
      
      if (transaction.date && transaction.description && transaction.amount !== 0) {
        transactions.push(transaction);
      }
    } catch (error) {
      console.error(`Error parsing line ${i + 1}:`, error);
    }
  }
  
  return transactions;
}

export function validateCSVHeaders(csvText: string): boolean {
  const lines = csvText.split('\n');
  if (lines.length < 2) return false;
  
  const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
  const requiredHeaders = ['date', 'description', 'amount'];
  
  return requiredHeaders.every(header => headers.includes(header));
}
