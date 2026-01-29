// Validation Summary Component
// Displays a summary of validation results with total rows, valid records, and error breakdown

import { AlertCircle, CheckCircle } from 'lucide-react';

interface ValidationSummaryProps {
  totalRows: number;
  validRows: number;
  errorSummary: {
    email: number;
    donation: number;
    date: number;
    duplicate: number;
  };
}

export function ValidationSummary({ totalRows, validRows, errorSummary }: ValidationSummaryProps) {
  const totalErrors = Object.values(errorSummary).reduce((sum, count) => sum + count, 0);
  const hasErrors = totalErrors > 0;

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <div className="flex items-center gap-2 mb-4">
        {hasErrors ? (
          <AlertCircle className="w-6 h-6 text-amber-500" />
        ) : (
          <CheckCircle className="w-6 h-6 text-green-500" />
        )}
        <h2 className="text-xl font-semibold text-gray-800">Validation Results</h2>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-blue-50 rounded-lg p-4 text-center">
          <div className="text-3xl font-bold text-blue-600">{totalRows}</div>
          <div className="text-sm text-gray-600 mt-1">Total Rows</div>
        </div>

        <div className="bg-green-50 rounded-lg p-4 text-center">
          <div className="text-3xl font-bold text-green-600">{validRows}</div>
          <div className="text-sm text-gray-600 mt-1">Valid Records</div>
        </div>

        <div className={`rounded-lg p-4 text-center ${hasErrors ? 'bg-red-50' : 'bg-gray-50'}`}>
          <div className={`text-3xl font-bold ${hasErrors ? 'text-red-600' : 'text-gray-400'}`}>
            {totalErrors}
          </div>
          <div className="text-sm text-gray-600 mt-1">Total Errors</div>
        </div>
      </div>

      {hasErrors && (
        <div className="border-t pt-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Error Breakdown</h3>
          <div className="space-y-2">
            {errorSummary.email > 0 && (
              <div className="flex justify-between items-center py-2 px-3 bg-red-50 rounded">
                <span className="text-sm text-gray-700">Invalid or Missing Emails</span>
                <span className="font-semibold text-red-600">{errorSummary.email}</span>
              </div>
            )}
            {errorSummary.donation > 0 && (
              <div className="flex justify-between items-center py-2 px-3 bg-red-50 rounded">
                <span className="text-sm text-gray-700">Invalid Donation Amounts</span>
                <span className="font-semibold text-red-600">{errorSummary.donation}</span>
              </div>
            )}
            {errorSummary.date > 0 && (
              <div className="flex justify-between items-center py-2 px-3 bg-red-50 rounded">
                <span className="text-sm text-gray-700">Invalid or Missing Dates</span>
                <span className="font-semibold text-red-600">{errorSummary.date}</span>
              </div>
            )}
            {errorSummary.duplicate > 0 && (
              <div className="flex justify-between items-center py-2 px-3 bg-red-50 rounded">
                <span className="text-sm text-gray-700">Duplicate Records</span>
                <span className="font-semibold text-red-600">{errorSummary.duplicate}</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
