import { ValidInvalidChart } from './ValidInvalidChart';
import { AutoFixButton } from './AutoFixButton';
import { CSVRow, ValidationResult, getErrorSummary } from '../utils/csvValidation';
import { AutoFixChangeLog, DetailedChange, UnresolvedIssue } from '../utils/autoFixData';

interface SidePanelProps {
  csvData: CSVRow[];
  validationResult: ValidationResult;
  hasAutoFix: boolean;
  onAutoFix: (
    cleanedData: CSVRow[],
    changeLog: AutoFixChangeLog,
    totalIssues: number,
    detailedChanges: DetailedChange[],
    unresolvedIssues: UnresolvedIssue[]
  ) => void;
  onUndoAutoFix: () => void;
}

export function SidePanel({
  csvData,
  validationResult,
  hasAutoFix,
  onAutoFix,
  onUndoAutoFix
}: SidePanelProps) {
  const errorSummary = getErrorSummary(validationResult.errors);

  return (
    <div className="bg-white border-l border-gray-200" style={{ width: '35%' }}>
      <div className="sticky top-[120px] overflow-y-auto" style={{ maxHeight: 'calc(100vh - 140px)' }}>
        <div className="p-6">
          <h2 className="text-xl font-bold mb-6">Auto-Fix & Analysis</h2>

          <div className="mb-8">
            <h3 className="text-sm font-semibold text-navy/70 uppercase tracking-wide mb-4">
              Auto-Fix Invalid Data
            </h3>
            <AutoFixButton
              data={csvData}
              onAutoFix={onAutoFix}
              onUndoAutoFix={onUndoAutoFix}
              hasAutoFix={hasAutoFix}
            />
          </div>

          {errorSummary && (
            <div className="mb-8">
              <ValidInvalidChart
                validRows={validationResult.validRows}
                invalidRows={validationResult.totalRows - validationResult.validRows}
                errorSummary={errorSummary}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
