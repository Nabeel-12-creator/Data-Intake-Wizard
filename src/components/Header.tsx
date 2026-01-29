import { Download, FileSpreadsheet, FileText, Info, RefreshCw } from 'lucide-react';
import { ValidationResult } from '../utils/csvValidation';

interface HeaderProps {
  file: File | null;
  validationResult: ValidationResult | null;
  editedCellsCount: number;
  onRevalidateAll: () => void;
  onDownloadCleanedCSV: () => void;
  onDownloadFullUpdatedCSV: () => void;
  onDownloadErrorReport: () => void;
  onShowHowItWorks: () => void;
}

export function Header({
  file,
  validationResult,
  editedCellsCount,
  onRevalidateAll,
  onDownloadCleanedCSV,
  onDownloadFullUpdatedCSV,
  onDownloadErrorReport,
  onShowHowItWorks
}: HeaderProps) {
  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-30 shadow-sm">
      <div className="max-w-full mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <FileSpreadsheet className="w-8 h-8 text-primary" />
            <div>
              <h1 className="text-2xl font-bold">Data Intake Wizard for Chapters</h1>
              <p className="text-sm text-navy/70">
                Validate, edit, and clean your chapter's data
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onShowHowItWorks}
              className="flex items-center gap-2 px-3 py-2 text-primary hover:bg-primary/10 rounded-button transition-colors"
              title="How It Works"
            >
              <Info className="w-5 h-5" />
              <span className="text-sm font-medium">How It Works</span>
            </button>

            {file && validationResult && (
              <>
                <button
                  onClick={onRevalidateAll}
                  className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-button font-medium hover:bg-primary/90 transition-colors text-sm"
                >
                  <RefreshCw className="w-4 h-4" />
                  Re-Validate All
                </button>

                {validationResult.validRows > 0 && (
                  <button
                    onClick={onDownloadCleanedCSV}
                    className="flex items-center gap-2 px-4 py-2 bg-brand-green text-white rounded-button font-medium hover:bg-brand-green/90 transition-colors text-sm"
                  >
                    <Download className="w-4 h-4" />
                    Cleaned CSV
                  </button>
                )}

                <button
                  onClick={onDownloadFullUpdatedCSV}
                  className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-button font-medium hover:bg-primary/90 transition-colors text-sm"
                >
                  <Download className="w-4 h-4" />
                  Full CSV
                </button>

                {validationResult.errors.length > 0 && (
                  <button
                    onClick={onDownloadErrorReport}
                    className="flex items-center gap-2 px-4 py-2 bg-brand-red text-white rounded-button font-medium hover:bg-brand-red/90 transition-colors text-sm"
                  >
                    <FileText className="w-4 h-4" />
                    Error Report
                  </button>
                )}
              </>
            )}
          </div>
        </div>

        {file && validationResult && (
          <div className="mt-3 flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <span className="font-medium text-navy/70">Total Rows:</span>
              <span className="font-semibold text-navy">{validationResult.totalRows}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-medium text-navy/70">Valid:</span>
              <span className="font-semibold text-brand-green">{validationResult.validRows}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-medium text-navy/70">Invalid:</span>
              <span className="font-semibold text-brand-red">{validationResult.totalRows - validationResult.validRows}</span>
            </div>
            {editedCellsCount > 0 && (
              <div className="flex items-center gap-2">
                <span className="font-medium text-navy/70">Edited:</span>
                <span className="font-semibold text-primary">{editedCellsCount} cells</span>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
