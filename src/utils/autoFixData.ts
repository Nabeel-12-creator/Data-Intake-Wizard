import { CSVRow, normalizeDate as basicNormalizeDate } from './csvValidation';

export interface AutoFixOptions {
  flipNegativeAmounts: boolean;
  treatZeroAmountsInvalid: boolean;
  tryAmbiguousDateSwaps: boolean;
}

export interface FixResult {
  value: string;
  fixed: boolean;
  reason?: string;
  originalValue?: string;
}

export interface DetailedChange {
  rowIndex: number;
  field: string;
  before: string;
  after: string;
  fixType: string;
}

export interface UnresolvedIssue {
  rowIndex: number;
  field: string;
  value: string;
  reason: string;
}

export interface AutoFixResult {
  cleanedData: CSVRow[];
  changeLog: AutoFixChangeLog;
  totalIssuesFixed: number;
  detailedChanges: DetailedChange[];
  unresolvedIssues: UnresolvedIssue[];
}

export interface AutoFixChangeLog {
  namesCorrected: number;
  emailsLowercased: number;
  emailsCorrected: number;
  datesNormalized: number;
  whitespaceRemoved: number;
  statesNormalized: number;
  columnsRenamed: number;
  currencyNormalized: number;
  negativeAmountsFlipped: number;
}

const STATE_ABBREVIATIONS: Record<string, string> = {
  'alabama': 'AL', 'alaska': 'AK', 'arizona': 'AZ', 'arkansas': 'AR', 'california': 'CA',
  'colorado': 'CO', 'connecticut': 'CT', 'delaware': 'DE', 'florida': 'FL', 'georgia': 'GA',
  'hawaii': 'HI', 'idaho': 'ID', 'illinois': 'IL', 'indiana': 'IN', 'iowa': 'IA',
  'kansas': 'KS', 'kentucky': 'KY', 'louisiana': 'LA', 'maine': 'ME', 'maryland': 'MD',
  'massachusetts': 'MA', 'michigan': 'MI', 'minnesota': 'MN', 'mississippi': 'MS', 'missouri': 'MO',
  'montana': 'MT', 'nebraska': 'NE', 'nevada': 'NV', 'new hampshire': 'NH', 'new jersey': 'NJ',
  'new mexico': 'NM', 'new york': 'NY', 'north carolina': 'NC', 'north dakota': 'ND', 'ohio': 'OH',
  'oklahoma': 'OK', 'oregon': 'OR', 'pennsylvania': 'PA', 'rhode island': 'RI', 'south carolina': 'SC',
  'south dakota': 'SD', 'tennessee': 'TN', 'texas': 'TX', 'utah': 'UT', 'vermont': 'VT',
  'virginia': 'VA', 'washington': 'WA', 'west virginia': 'WV', 'wisconsin': 'WI', 'wyoming': 'WY'
};

const COLUMN_NAME_MAPPINGS: Record<string, string> = {
  'emailaddress': 'email', 'email address': 'email', 'e-mail': 'email',
  'firstname': 'first_name', 'first name': 'first_name',
  'lastname': 'last_name', 'last name': 'last_name',
  'fullname': 'full_name', 'full name': 'full_name',
  'phonenumber': 'phone_number', 'phone number': 'phone_number', 'phone': 'phone_number',
  'donationamount': 'donation_amount', 'donation amount': 'donation_amount', 'amount': 'donation_amount',
  'donationdate': 'donation_date', 'donation date': 'donation_date',
  'donorid': 'donor_id', 'donor id': 'donor_id', 'id': 'donor_id',
  'streetaddress': 'street_address', 'street address': 'street_address', 'address': 'street_address',
  'zipcode': 'zip_code', 'zip code': 'zip_code', 'zip': 'zip_code',
  'postalcode': 'zip_code', 'postal code': 'zip_code'
};

const EMAIL_TYPO_CORRECTIONS: Record<string, string> = {
  'gmail.con': 'gmail.com',
  'gmial.com': 'gmail.com',
  'gmai.com': 'gmail.com',
  'yahho.com': 'yahoo.com',
  'yahooo.com': 'yahoo.com',
  'yaho.com': 'yahoo.com',
  'hotmai.com': 'hotmail.com',
  'hotmial.com': 'hotmail.com',
  'hotmail.con': 'hotmail.com',
  'outlook.con': 'outlook.com',
  'aol.con': 'aol.com',
  'icloud.con': 'icloud.com'
};

export function toTitleCase(str: string): FixResult {
  if (!str) return { value: str, fixed: false };

  const titleCased = str
    .toLowerCase()
    .split(' ')
    .map(word => {
      if (word.length === 0) return word;
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(' ');

  return {
    value: titleCased,
    fixed: titleCased !== str,
    reason: titleCased !== str ? 'Converted to Title Case' : undefined,
    originalValue: str
  };
}

export function normalizeEmail(email: string): FixResult {
  if (!email) return { value: email, fixed: false };

  let normalized = email.trim().toLowerCase();
  let fixed = normalized !== email;
  let reason: string | undefined;

  if (!normalized.includes('@')) {
    return {
      value: email,
      fixed: false,
      reason: 'Invalid email (missing @)'
    };
  }

  const parts = normalized.split('@');
  if (parts.length !== 2 || !parts[0] || !parts[1]) {
    return {
      value: email,
      fixed: false,
      reason: 'Invalid email format'
    };
  }

  const domain = parts[1];
  if (EMAIL_TYPO_CORRECTIONS[domain]) {
    normalized = `${parts[0]}@${EMAIL_TYPO_CORRECTIONS[domain]}`;
    fixed = true;
    reason = `Corrected typo: ${domain} → ${EMAIL_TYPO_CORRECTIONS[domain]}`;
  }

  if (fixed && !reason) {
    reason = 'Lowercased and trimmed';
  }

  return {
    value: normalized,
    fixed,
    reason,
    originalValue: email
  };
}

export function normalizeDate(dateStr: string, tryAmbiguousSwaps: boolean = false): FixResult {
  if (!dateStr || dateStr.trim() === '') {
    return { value: dateStr, fixed: false, reason: 'Empty date value' };
  }

  const trimmed = dateStr.trim();

  if (trimmed.match(/^\d{4}-\d{2}-\d{2}$/)) {
    const [year, month, day] = trimmed.split('-').map(Number);
    if (isValidDate(year, month, day)) {
      return { value: trimmed, fixed: false };
    }
    return { value: dateStr, fixed: false, reason: 'Invalid date values (month 13 or day 32)' };
  }

  const formats = [
    { regex: /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/, order: 'MDY' },
    { regex: /^(\d{4})\/(\d{1,2})\/(\d{1,2})$/, order: 'YMD' },
    { regex: /^(\d{1,2})-(\d{1,2})-(\d{4})$/, order: 'DMY' }
  ];

  for (const format of formats) {
    const match = trimmed.match(format.regex);
    if (match) {
      let year: number, month: number, day: number;

      if (format.order === 'MDY') {
        [, month, day, year] = match.map(Number);
      } else if (format.order === 'YMD') {
        [, year, month, day] = match.map(Number);
      } else {
        [, day, month, year] = match.map(Number);
      }

      if (isValidDate(year, month, day)) {
        const normalized = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        return {
          value: normalized,
          fixed: true,
          reason: `Normalized from ${format.order} format`,
          originalValue: dateStr
        };
      }

      if (tryAmbiguousSwaps && format.order === 'MDY') {
        [month, day] = [day, month];
        if (isValidDate(year, month, day)) {
          const normalized = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
          return {
            value: normalized,
            fixed: true,
            reason: 'Normalized with ambiguous date swap (DD/MM)',
            originalValue: dateStr
          };
        }
      }
    }
  }

  return {
    value: dateStr,
    fixed: false,
    reason: 'Unparsable date format'
  };
}

function isValidDate(year: number, month: number, day: number): boolean {
  if (month < 1 || month > 12) return false;
  if (day < 1 || day > 31) return false;
  if (year < 1900 || year > 2100) return false;

  const daysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  if (year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0)) {
    daysInMonth[1] = 29;
  }

  return day <= daysInMonth[month - 1];
}

export function normalizeCurrency(amount: string, options: AutoFixOptions): FixResult {
  if (!amount) return { value: amount, fixed: false };

  let cleaned = amount.trim().replace(/[$,\s]/g, '');
  const num = parseFloat(cleaned);

  if (isNaN(num)) {
    return {
      value: amount,
      fixed: false,
      reason: 'Invalid currency format'
    };
  }

  if (options.treatZeroAmountsInvalid && num === 0) {
    return {
      value: amount,
      fixed: false,
      reason: 'Zero amount treated as invalid'
    };
  }

  if (options.flipNegativeAmounts && num < 0) {
    const positive = Math.abs(num).toString();
    return {
      value: positive,
      fixed: true,
      reason: 'Flipped negative amount to positive',
      originalValue: amount
    };
  }

  if (cleaned !== amount) {
    return {
      value: num.toString(),
      fixed: true,
      reason: 'Removed currency symbols and formatting',
      originalValue: amount
    };
  }

  return { value: num.toString(), fixed: false };
}

export function normalizeStateName(state: string): FixResult {
  if (!state) return { value: state, fixed: false };

  const trimmedState = state.trim();

  if (trimmedState.length === 2 && /^[A-Z]{2}$/.test(trimmedState)) {
    return { value: trimmedState, fixed: false };
  }

  const lowerState = trimmedState.toLowerCase();
  const abbreviation = STATE_ABBREVIATIONS[lowerState];

  if (abbreviation) {
    return {
      value: abbreviation,
      fixed: true,
      reason: `Converted state name to abbreviation`,
      originalValue: state
    };
  }

  return { value: trimmedState, fixed: false };
}

export function standardizeColumnName(columnName: string): string {
  const normalized = columnName.toLowerCase().trim();
  return COLUMN_NAME_MAPPINGS[normalized] || columnName;
}

export function standardizeColumnNames(rows: CSVRow[]): { rows: CSVRow[]; renamedCount: number } {
  if (rows.length === 0) return { rows, renamedCount: 0 };

  const originalHeaders = Object.keys(rows[0]);
  const newHeaders = originalHeaders.map(header => standardizeColumnName(header));

  const renamedCount = originalHeaders.filter((header, index) => header !== newHeaders[index]).length;

  if (renamedCount === 0) {
    return { rows, renamedCount: 0 };
  }

  const standardizedRows = rows.map(row => {
    const newRow: CSVRow = {};
    originalHeaders.forEach((oldHeader, index) => {
      newRow[newHeaders[index]] = row[oldHeader];
    });
    return newRow;
  });

  return { rows: standardizedRows, renamedCount };
}

export function autoFixData(rows: CSVRow[], options: AutoFixOptions): AutoFixResult {
  const changeLog: AutoFixChangeLog = {
    namesCorrected: 0,
    emailsLowercased: 0,
    emailsCorrected: 0,
    datesNormalized: 0,
    whitespaceRemoved: 0,
    statesNormalized: 0,
    columnsRenamed: 0,
    currencyNormalized: 0,
    negativeAmountsFlipped: 0
  };

  const detailedChanges: DetailedChange[] = [];
  const unresolvedIssues: UnresolvedIssue[] = [];

  const { rows: renamedRows, renamedCount } = standardizeColumnNames(rows);
  changeLog.columnsRenamed = renamedCount;

  const cleanedData = renamedRows.map((row, rowIndex) => {
    const cleanedRow: CSVRow = {};

    Object.keys(row).forEach(key => {
      let value = row[key];
      const originalValue = value;
      const lowerKey = key.toLowerCase();

      if (value && typeof value === 'string' && value.trim() !== value) {
        value = value.trim();
        changeLog.whitespaceRemoved++;
        detailedChanges.push({
          rowIndex: rowIndex + 2,
          field: key,
          before: originalValue,
          after: value,
          fixType: 'Whitespace removed'
        });
      }

      if (lowerKey.includes('name') && value && !lowerKey.includes('username')) {
        const result = toTitleCase(value);
        if (result.fixed) {
          value = result.value;
          changeLog.namesCorrected++;
          detailedChanges.push({
            rowIndex: rowIndex + 2,
            field: key,
            before: originalValue,
            after: value,
            fixType: 'Name capitalized'
          });
        }
      }

      if (lowerKey.includes('email') && value) {
        const result = normalizeEmail(value);
        if (result.fixed && result.reason) {
          value = result.value;
          if (result.reason.includes('typo')) {
            changeLog.emailsCorrected++;
          } else {
            changeLog.emailsLowercased++;
          }
          detailedChanges.push({
            rowIndex: rowIndex + 2,
            field: key,
            before: originalValue,
            after: value,
            fixType: result.reason
          });
        } else if (!result.fixed && result.reason) {
          unresolvedIssues.push({
            rowIndex: rowIndex + 2,
            field: key,
            value: originalValue,
            reason: result.reason
          });
        }
      }

      const dateFields = ['date', 'donation_date', 'created_date', 'updated_date', 'birth_date'];
      if (dateFields.includes(lowerKey) && value) {
        const result = normalizeDate(value, options.tryAmbiguousDateSwaps);
        if (result.fixed) {
          value = result.value;
          changeLog.datesNormalized++;
          detailedChanges.push({
            rowIndex: rowIndex + 2,
            field: key,
            before: originalValue,
            after: value,
            fixType: result.reason || 'Date normalized'
          });
        } else if (result.reason) {
          unresolvedIssues.push({
            rowIndex: rowIndex + 2,
            field: key,
            value: originalValue,
            reason: result.reason
          });
        }
      }

      const currencyFields = ['donation_amount', 'amount', 'price', 'cost'];
      if (currencyFields.includes(lowerKey) && value) {
        const result = normalizeCurrency(value, options);
        if (result.fixed) {
          value = result.value;
          if (result.reason?.includes('negative')) {
            changeLog.negativeAmountsFlipped++;
          } else {
            changeLog.currencyNormalized++;
          }
          detailedChanges.push({
            rowIndex: rowIndex + 2,
            field: key,
            before: originalValue,
            after: value,
            fixType: result.reason || 'Currency normalized'
          });
        } else if (result.reason) {
          unresolvedIssues.push({
            rowIndex: rowIndex + 2,
            field: key,
            value: originalValue,
            reason: result.reason
          });
        }
      }

      if (lowerKey === 'state' && value) {
        const result = normalizeStateName(value);
        if (result.fixed) {
          value = result.value;
          changeLog.statesNormalized++;
          detailedChanges.push({
            rowIndex: rowIndex + 2,
            field: key,
            before: originalValue,
            after: value,
            fixType: 'State converted to abbreviation'
          });
        }
      }

      cleanedRow[key] = value;
    });

    return cleanedRow;
  });

  const totalIssuesFixed =
    changeLog.namesCorrected +
    changeLog.emailsLowercased +
    changeLog.emailsCorrected +
    changeLog.datesNormalized +
    changeLog.whitespaceRemoved +
    changeLog.statesNormalized +
    changeLog.columnsRenamed +
    changeLog.currencyNormalized +
    changeLog.negativeAmountsFlipped;

  return {
    cleanedData,
    changeLog,
    totalIssuesFixed,
    detailedChanges,
    unresolvedIssues
  };
}
