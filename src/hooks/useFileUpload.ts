import { useState } from 'react';
import { parseFile, validateCSVData, CSVRow, ValidationResult } from '../utils/csvValidation';

export function useFileUpload(onToast: (type: 'success' | 'error' | 'warning', message: string) => void) {
  const [file, setFile] = useState<File | null>(null);
  const [csvData, setCsvData] = useState<CSVRow[]>([]);
  const [originalCsvData, setOriginalCsvData] = useState<CSVRow[]>([]);
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFileUpload = async (selectedFile: File) => {
    const fileName = selectedFile.name.toLowerCase();
    if (!fileName.endsWith('.csv') && !fileName.endsWith('.xlsx') && !fileName.endsWith('.xls')) {
      onToast('error', 'Please upload a CSV or Excel file');
      return;
    }

    setFile(selectedFile);

    try {
      const rows = await parseFile(selectedFile);
      console.log('Rows loaded:', rows.length);
      setCsvData(rows);
      setOriginalCsvData(JSON.parse(JSON.stringify(rows)));

      const validation = validateCSVData(rows);
      setValidationResult(validation);
    } catch (error) {
      onToast('error', 'Error reading file: ' + (error as Error).message);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      handleFileUpload(droppedFile);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const reset = () => {
    setFile(null);
    setCsvData([]);
    setOriginalCsvData([]);
    setValidationResult(null);
  };

  return {
    file,
    csvData,
    originalCsvData,
    validationResult,
    isDragging,
    setCsvData,
    setValidationResult,
    handleFileUpload,
    handleDrop,
    handleDragOver,
    handleDragLeave,
    reset
  };
}
