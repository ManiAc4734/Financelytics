import type { Transaction } from "@shared/schema";

export function parseCSV(file: File): Promise<any[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const lines = text.split('\n');
        const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
        const transactions = [];

        for (let i = 1; i < lines.length; i++) {
          const line = lines[i].trim();
          if (!line) continue;

          const values = line.split(',').map(v => v.trim().replace(/"/g, ''));
          const transaction: any = {};

          headers.forEach((header, index) => {
            const value = values[index];
            if (value) {
              switch (header.toLowerCase()) {
                case 'date':
                  transaction.date = new Date(value);
                  break;
                case 'amount':
                  transaction.amount = value;
                  break;
                case 'description':
                case 'original_description':
                case 'originaldescription':
                  transaction.originalDescription = value;
                  break;
                case 'current_description':
                case 'currentdescription':
                  transaction.currentDescription = value;
                  break;
                case 'transactor':
                  transaction.transactor = value;
                  break;
                default:
                  transaction[header] = value;
              }
            }
          });

          if (transaction.date && transaction.amount && transaction.originalDescription) {
            transactions.push(transaction);
          }
        }

        resolve(transactions);
      } catch (error) {
        reject(error);
      }
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
}

export function exportToCSV(transactions: Transaction[], filename: string) {
  const headers = [
    'id',
    'date',
    'amount',
    'originalDescription',
    'currentDescription',
    'transactor',
    'classification',
    'paymentMedium',
    'processType',
    'schedule',
    'statutoryType',
    'accountId',
    'isDeleted',
    'isActual',
    'isBudgetItem',
    'isInteraccount',
    'isIncomeStatement'
  ];

  const csvContent = [
    headers.join(','),
    ...transactions.map(transaction => 
      headers.map(header => {
        const value = transaction[header as keyof Transaction];
        if (value instanceof Date) {
          return `"${value.toISOString()}"`;
        }
        if (typeof value === 'string' && value.includes(',')) {
          return `"${value}"`;
        }
        return value ?? '';
      }).join(',')
    )
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}