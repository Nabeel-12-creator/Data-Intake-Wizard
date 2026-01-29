// CSV Data Validation Utilities
// Handles parsing, validation, and cleaning of CSV data for chapter uploads

import * as XLSX from 'xlsx';

export interface CSVRow {
  [key: string]: string;
}

export interface ValidationError {
  row: number;
  type: 'email' | 'donation' | 'date' | 'duplicate';
  field: string;
  value: string;
  message: string;
}

export interface ValidationResult {
  totalRows: number;
  validRows: number;
  errors: ValidationError[];
  invalidRowIndices: Set<number>;
  cellErrors: Map<string, ValidationError>;
}

export interface CellValidationResult {
  isValid: boolean;
  error?: ValidationError;
}

export interface EditedCell {
  rowIndex: number;
  field: string;
  originalValue: string;
  newValue: string;
}

// Parse CSV text into array of objects
export function parseCSV(csvText: string): CSVRow[] {
  const lines = csvText.trim().split('\n');
  if (lines.length < 2) return [];

  const headers = lines[0].split(',').map(h => h.trim());
  const rows: CSVRow[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map(v => v.trim());
    const row: CSVRow = {};
    headers.forEach((header, index) => {
      row[header] = values[index] || '';
    });
    rows.push(row);
  }

  return rows;
}

// Parse Excel file into array of objects
export function parseExcel(file: File): Promise<CSVRow[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { raw: false });

        const rows: CSVRow[] = jsonData.map((row: any) => {
          const csvRow: CSVRow = {};
          Object.keys(row).forEach(key => {
            csvRow[key] = String(row[key] || '').trim();
          });
          return csvRow;
        });

        resolve(rows);
      } catch (error) {
        reject(error);
      }
    };
    reader.onerror = (error) => reject(error);
    reader.readAsBinaryString(file);
  });
}

// Parse file (CSV or Excel) into array of objects
export async function parseFile(file: File): Promise<CSVRow[]> {
  const fileName = file.name.toLowerCase();

  if (fileName.endsWith('.xlsx') || fileName.endsWith('.xls')) {
    return parseExcel(file);
  } else if (fileName.endsWith('.csv')) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const text = e.target?.result as string;
          const rows = parseCSV(text);
          resolve(rows);
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = (error) => reject(error);
      reader.readAsText(file);
    });
  } else {
    throw new Error('Unsupported file format. Please upload a CSV or Excel file.');
  }
}

// Validate email format
function isValidEmail(email: string): boolean {
  if (!email || email.trim() === '') return false;
  return email.includes('@');
}

// Validate donation amount
function isValidDonation(amount: string): boolean {
  if (!amount || amount.trim() === '') return false;
  const num = parseFloat(amount.replace(/[$,]/g, ''));
  return !isNaN(num) && num > 0;
}

// Validate and normalize date
function isValidDate(dateStr: string): boolean {
  if (!dateStr || dateStr.trim() === '') return false;

  // Try YYYY-MM-DD format
  const isoMatch = dateStr.match(/^\d{4}-\d{2}-\d{2}$/);
  if (isoMatch) {
    const date = new Date(dateStr);
    return !isNaN(date.getTime());
  }

  // Try MM/DD/YYYY format
  const usMatch = dateStr.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (usMatch) {
    const [, month, day, year] = usMatch;
    const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    return !isNaN(date.getTime());
  }

  return false;
}

// Convert date to YYYY-MM-DD format
export function normalizeDate(dateStr: string): string {
  if (!dateStr) return dateStr;

  // Already in YYYY-MM-DD format
  if (dateStr.match(/^\d{4}-\d{2}-\d{2}$/)) {
    return dateStr;
  }

  // Convert MM/DD/YYYY to YYYY-MM-DD
  const usMatch = dateStr.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (usMatch) {
    const [, month, day, year] = usMatch;
    const m = month.padStart(2, '0');
    const d = day.padStart(2, '0');
    return `${year}-${m}-${d}`;
  }

  return dateStr;
}

// Validate all rows and return results
export function validateCSVData(rows: CSVRow[]): ValidationResult {
  const errors: ValidationError[] = [];
  const invalidRowIndices = new Set<number>();
  const seenEmails = new Map<string, number>();
  const seenDonorIds = new Map<string, number>();

  rows.forEach((row, index) => {
    const rowNum = index + 2; // +2 because of header row and 0-indexing

    // Check email fields
    const emailFields = ['email', 'Email', 'EMAIL', 'donor_email'];
    emailFields.forEach(field => {
      if (field in row) {
        const email = row[field];
        if (!isValidEmail(email)) {
          errors.push({
            row: rowNum,
            type: 'email',
            field,
            value: email,
            message: `Invalid or missing email`
          });
          invalidRowIndices.add(index);
        } else {
          // Check for duplicate emails
          const lowerEmail = email.toLowerCase();
          if (seenEmails.has(lowerEmail)) {
            errors.push({
              row: rowNum,
              type: 'duplicate',
              field,
              value: email,
              message: `Duplicate email (also in row ${seenEmails.get(lowerEmail)})`
            });
            invalidRowIndices.add(index);
          } else {
            seenEmails.set(lowerEmail, rowNum);
          }
        }
      }
    });

    // Check donation amount fields
    const donationFields = ['donation_amount', 'amount', 'Amount', 'AMOUNT', 'donation'];
    donationFields.forEach(field => {
      if (field in row) {
        const amount = row[field];
        if (!isValidDonation(amount)) {
          errors.push({
            row: rowNum,
            type: 'donation',
            field,
            value: amount,
            message: `Invalid donation amount (must be a number > 0)`
          });
          invalidRowIndices.add(index);
        }
      }
    });

    // Check date fields
    const dateFields = ['date', 'Date', 'DATE', 'donation_date', 'created_date'];
    dateFields.forEach(field => {
      if (field in row) {
        const date = row[field];
        if (!isValidDate(date)) {
          errors.push({
            row: rowNum,
            type: 'date',
            field,
            value: date,
            message: `Invalid or missing date (use YYYY-MM-DD or MM/DD/YYYY)`
          });
          invalidRowIndices.add(index);
        }
      }
    });

    // Check for duplicate donor_id
    const donorIdFields = ['donor_id', 'DonorID', 'DONOR_ID', 'id'];
    donorIdFields.forEach(field => {
      if (field in row && row[field]) {
        const donorId = row[field].toLowerCase();
        if (seenDonorIds.has(donorId)) {
          errors.push({
            row: rowNum,
            type: 'duplicate',
            field,
            value: row[field],
            message: `Duplicate donor ID (also in row ${seenDonorIds.get(donorId)})`
          });
          invalidRowIndices.add(index);
        } else {
          seenDonorIds.set(donorId, rowNum);
        }
      }
    });
  });

  const cellErrors = new Map<string, ValidationError>();
  errors.forEach(error => {
    const cellKey = getCellKey(error.row - 2, error.field);
    cellErrors.set(cellKey, error);
  });

  return {
    totalRows: rows.length,
    validRows: rows.length - invalidRowIndices.size,
    errors,
    invalidRowIndices,
    cellErrors
  };
}

// Clean CSV data by removing invalid rows and normalizing values
export function cleanCSVData(rows: CSVRow[], invalidIndices: Set<number>): CSVRow[] {
  return rows
    .filter((_, index) => !invalidIndices.has(index))
    .map(row => {
      const cleanedRow: CSVRow = {};

      Object.keys(row).forEach(key => {
        let value = row[key].trim();

        // Normalize dates
        const dateFields = ['date', 'Date', 'DATE', 'donation_date', 'created_date'];
        if (dateFields.includes(key)) {
          value = normalizeDate(value);
        }

        cleanedRow[key] = value;
      });

      return cleanedRow;
    });
}

// Convert array of objects back to CSV string
export function convertToCSV(rows: CSVRow[]): string {
  if (rows.length === 0) return '';

  const headers = Object.keys(rows[0]);
  const csvRows = [headers.join(',')];

  rows.forEach(row => {
    const values = headers.map(header => {
      const value = row[header] || '';
      // Escape commas and quotes
      if (value.includes(',') || value.includes('"')) {
        return `"${value.replace(/"/g, '""')}"`;
      }
      return value;
    });
    csvRows.push(values.join(','));
  });

  return csvRows.join('\n');
}

// Generate error summary grouped by type
export function getErrorSummary(errors: ValidationError[]) {
  const summary = {
    email: 0,
    donation: 0,
    date: 0,
    duplicate: 0
  };

  errors.forEach(error => {
    summary[error.type]++;
  });

  return summary;
}

// Get invalid rows only for error report
export function getInvalidRows(rows: CSVRow[], invalidIndices: Set<number>): CSVRow[] {
  return rows.filter((_, index) => invalidIndices.has(index));
}

// Get cell key for error mapping
export function getCellKey(rowIndex: number, field: string): string {
  return `${rowIndex}-${field}`;
}

// Validate a single cell value
export function validateSingleCell(
  field: string,
  value: string,
  rowIndex: number,
  allRows: CSVRow[],
  currentRowData: CSVRow
): CellValidationResult {
  const rowNum = rowIndex + 2;
  const emailFields = ['email', 'Email', 'EMAIL', 'donor_email'];
  const donationFields = ['donation_amount', 'amount', 'Amount', 'AMOUNT', 'donation'];
  const dateFields = ['date', 'Date', 'DATE', 'donation_date', 'created_date'];
  const donorIdFields = ['donor_id', 'DonorID', 'DONOR_ID', 'id'];

  if (emailFields.includes(field)) {
    if (!isValidEmail(value)) {
      return {
        isValid: false,
        error: {
          row: rowNum,
          type: 'email',
          field,
          value,
          message: 'Invalid or missing email'
        }
      };
    }

    const lowerEmail = value.toLowerCase();
    const duplicateIndex = allRows.findIndex((r, idx) => {
      if (idx === rowIndex) return false;
      const rowEmailFields = emailFields.filter(f => f in r);
      return rowEmailFields.some(f => r[f].toLowerCase() === lowerEmail);
    });

    if (duplicateIndex !== -1) {
      return {
        isValid: false,
        error: {
          row: rowNum,
          type: 'duplicate',
          field,
          value,
          message: `Duplicate email (also in row ${duplicateIndex + 2})`
        }
      };
    }
  }

  if (donationFields.includes(field)) {
    if (!isValidDonation(value)) {
      return {
        isValid: false,
        error: {
          row: rowNum,
          type: 'donation',
          field,
          value,
          message: 'Invalid donation amount (must be a number > 0)'
        }
      };
    }
  }

  if (dateFields.includes(field)) {
    if (!isValidDate(value)) {
      return {
        isValid: false,
        error: {
          row: rowNum,
          type: 'date',
          field,
          value,
          message: 'Invalid or missing date (use YYYY-MM-DD or MM/DD/YYYY)'
        }
      };
    }
  }

  if (donorIdFields.includes(field) && value) {
    const lowerDonorId = value.toLowerCase();
    const duplicateIndex = allRows.findIndex((r, idx) => {
      if (idx === rowIndex) return false;
      const rowDonorIdFields = donorIdFields.filter(f => f in r && r[f]);
      return rowDonorIdFields.some(f => r[f].toLowerCase() === lowerDonorId);
    });

    if (duplicateIndex !== -1) {
      return {
        isValid: false,
        error: {
          row: rowNum,
          type: 'duplicate',
          field,
          value,
          message: `Duplicate donor ID (also in row ${duplicateIndex + 2})`
        }
      };
    }
  }

  return { isValid: true };
}
