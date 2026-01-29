interface ValidInvalidChartProps {
  validRows: number;
  invalidRows: number;
  errorSummary?: {
    email: number;
    donation: number;
    date: number;
    duplicate: number;
  };
}

export function ValidInvalidChart({ validRows, invalidRows, errorSummary }: ValidInvalidChartProps) {
  const total = validRows + invalidRows;
  const validPercentage = total > 0 ? (validRows / total) * 100 : 0;
  const invalidPercentage = total > 0 ? (invalidRows / total) * 100 : 0;
  const totalErrors = errorSummary ? Object.values(errorSummary).reduce((sum, count) => sum + count, 0) : 0;

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold mb-4">Data Quality & Validation</h3>

      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="bg-primary/10 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-primary">{total}</div>
          <div className="text-xs text-navy/70 mt-1">Total</div>
        </div>
        <div className="bg-brand-green/10 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-brand-green">{validRows}</div>
          <div className="text-xs text-navy/70 mt-1">Valid</div>
        </div>
        <div className="bg-brand-red/10 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-brand-red">{invalidRows}</div>
          <div className="text-xs text-navy/70 mt-1">Invalid</div>
        </div>
      </div>

      <div className="space-y-3">
        <div>
          <div className="flex justify-between items-center mb-1">
            <span className="text-sm font-medium text-brand-green">Valid Records</span>
            <span className="text-sm font-bold text-brand-green">
              {validPercentage.toFixed(1)}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className="bg-brand-green h-3 rounded-full transition-all duration-500"
              style={{ width: `${validPercentage}%` }}
            ></div>
          </div>
        </div>

        <div>
          <div className="flex justify-between items-center mb-1">
            <span className="text-sm font-medium text-brand-red">Invalid Records</span>
            <span className="text-sm font-bold text-brand-red">
              {invalidPercentage.toFixed(1)}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className="bg-brand-red h-3 rounded-full transition-all duration-500"
              style={{ width: `${invalidPercentage}%` }}
            ></div>
          </div>
        </div>
      </div>

      {errorSummary && totalErrors > 0 && (
        <div className="mt-6 pt-4 border-t border-gray-200">
          <h4 className="text-sm font-semibold mb-3">Error Breakdown</h4>
          <div className="space-y-2">
            {errorSummary.email > 0 && (
              <div className="flex justify-between items-center py-2 px-3 bg-red-50 rounded text-sm">
                <span className="text-navy">Invalid Emails</span>
                <span className="font-semibold text-brand-red">{errorSummary.email}</span>
              </div>
            )}
            {errorSummary.donation > 0 && (
              <div className="flex justify-between items-center py-2 px-3 bg-red-50 rounded text-sm">
                <span className="text-navy">Invalid Donations</span>
                <span className="font-semibold text-brand-red">{errorSummary.donation}</span>
              </div>
            )}
            {errorSummary.date > 0 && (
              <div className="flex justify-between items-center py-2 px-3 bg-red-50 rounded text-sm">
                <span className="text-navy">Invalid Dates</span>
                <span className="font-semibold text-brand-red">{errorSummary.date}</span>
              </div>
            )}
            {errorSummary.duplicate > 0 && (
              <div className="flex justify-between items-center py-2 px-3 bg-red-50 rounded text-sm">
                <span className="text-navy">Duplicates</span>
                <span className="font-semibold text-brand-red">{errorSummary.duplicate}</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
