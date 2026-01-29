import { CSVRow, ValidationResult, cleanCSVData, convertToCSV, getInvalidRows } from '../utils/csvValidation';

export function useDownloads(
  file: File | null,
  csvData: CSVRow[],
  validationResult: ValidationResult | null,
  onToast: (type: 'success' | 'error' | 'warning', message: string) => void,
  onShowSuccessMessage: () => void
) {
  const handleDownloadCleanedCSV = () => {
    if (!validationResult || csvData.length === 0) return;

    const cleanedData = cleanCSVData(csvData, validationResult.invalidRowIndices);
    const csvText = convertToCSV(cleanedData);

    const blob = new Blob([csvText], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const originalName = file?.name.replace(/\.(csv|xlsx|xls)$/i, '') || 'data';
    a.download = `cleaned_${originalName}.csv`;
    a.click();
    URL.revokeObjectURL(url);

    onShowSuccessMessage();
    onToast('success', 'Cleaned CSV downloaded successfully');
  };

  const handleDownloadFullUpdatedCSV = () => {
    if (csvData.length === 0) return;

    const csvText = convertToCSV(csvData);
    const blob = new Blob([csvText], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const originalName = file?.name.replace(/\.(csv|xlsx|xls)$/i, '') || 'data';
    a.download = `full_updated_${originalName}.csv`;
    a.click();
    URL.revokeObjectURL(url);

    onToast('success', 'Full updated CSV downloaded successfully');
  };

  const handleDownloadErrorReport = () => {
    if (!validationResult || csvData.length === 0) return;

    const invalidData = getInvalidRows(csvData, validationResult.invalidRowIndices);
    const csvText = convertToCSV(invalidData);

    const blob = new Blob([csvText], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const originalName = file?.name.replace(/\.(csv|xlsx|xls)$/i, '') || 'data';
    a.download = `error_report_${originalName}.csv`;
    a.click();
    URL.revokeObjectURL(url);

    onToast('success', 'Error report downloaded successfully');
  };

  return {
    handleDownloadCleanedCSV,
    handleDownloadFullUpdatedCSV,
    handleDownloadErrorReport
  };
}
