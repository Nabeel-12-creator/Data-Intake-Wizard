import { useState } from 'react';
import { CSVRow, ValidationResult, validateCSVData } from '../utils/csvValidation';
import { AutoFixChangeLog, DetailedChange, UnresolvedIssue } from '../utils/autoFixData';

export function useAutoFix(
  csvData: CSVRow[],
  setCsvData: (data: CSVRow[]) => void,
  setValidationResult: (result: ValidationResult) => void,
  onToast: (type: 'success' | 'error' | 'warning', message: string) => void
) {
  const [preAutoFixData, setPreAutoFixData] = useState<CSVRow[] | null>(null);
  const [hasAutoFix, setHasAutoFix] = useState(false);

  const handleAutoFix = (
    cleanedData: CSVRow[],
    changeLog: AutoFixChangeLog,
    totalIssues: number,
    detailedChanges: DetailedChange[],
    unresolvedIssues: UnresolvedIssue[]
  ) => {
    setPreAutoFixData(JSON.parse(JSON.stringify(csvData)));
    setCsvData(cleanedData);
    setHasAutoFix(true);

    const validation = validateCSVData(cleanedData);
    setValidationResult(validation);

    const unresolvedText = unresolvedIssues.length > 0
      ? ` (${unresolvedIssues.length} issues require manual review)`
      : '';
    onToast('success', `Auto-fix complete - ${totalIssues} issues corrected${unresolvedText}`);
  };

  const handleUndoAutoFix = () => {
    if (preAutoFixData) {
      setCsvData(preAutoFixData);
      const validation = validateCSVData(preAutoFixData);
      setValidationResult(validation);
      setPreAutoFixData(null);
      setHasAutoFix(false);
      onToast('success', 'Auto-fix changes have been reverted');
    }
  };

  const reset = () => {
    setPreAutoFixData(null);
    setHasAutoFix(false);
  };

  return {
    hasAutoFix,
    handleAutoFix,
    handleUndoAutoFix,
    reset
  };
}
