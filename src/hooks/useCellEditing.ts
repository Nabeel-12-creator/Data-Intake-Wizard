import { useState } from 'react';
import { CSVRow, ValidationResult, validateCSVData, validateSingleCell, getCellKey } from '../utils/csvValidation';

export function useCellEditing(
  csvData: CSVRow[],
  originalCsvData: CSVRow[],
  validationResult: ValidationResult | null,
  setCsvData: (data: CSVRow[]) => void,
  setValidationResult: (result: ValidationResult) => void,
  onToast: (type: 'success' | 'error' | 'warning', message: string) => void
) {
  const [editedCells, setEditedCells] = useState<Map<string, string>>(new Map());
  const [correctedCells, setCorrectedCells] = useState<Set<string>>(new Set());

  const handleCellEdit = (rowIndex: number, field: string, newValue: string) => {
    const cellKey = getCellKey(rowIndex, field);
    const currentRow = csvData[rowIndex];
    const oldValue = currentRow[field];

    if (oldValue === newValue) {
      return;
    }

    const updatedData = [...csvData];
    updatedData[rowIndex] = { ...updatedData[rowIndex], [field]: newValue };

    const cellValidation = validateSingleCell(field, newValue, rowIndex, updatedData, updatedData[rowIndex]);

    const newEditedCells = new Map(editedCells);
    newEditedCells.set(cellKey, newValue);
    setEditedCells(newEditedCells);

    setCsvData(updatedData);

    if (cellValidation.isValid) {
      const hadError = validationResult?.cellErrors.has(cellKey);
      if (hadError) {
        const newCorrectedCells = new Set(correctedCells);
        newCorrectedCells.add(cellKey);
        setCorrectedCells(newCorrectedCells);
        onToast('success', 'Cell updated successfully');
      }
    } else {
      onToast('warning', 'Invalid format - please check entry');
    }

    const newValidation = validateCSVData(updatedData);
    setValidationResult(newValidation);
  };

  const handleResetChanges = () => {
    if (editedCells.size === 0) {
      onToast('warning', 'No changes to reset');
      return;
    }

    if (confirm('Are you sure you want to reset all changes? This cannot be undone.')) {
      setCsvData(JSON.parse(JSON.stringify(originalCsvData)));
      setEditedCells(new Map());
      setCorrectedCells(new Set());
      const validation = validateCSVData(originalCsvData);
      setValidationResult(validation);
      onToast('success', 'All changes have been reset');
    }
  };

  const reset = () => {
    setEditedCells(new Map());
    setCorrectedCells(new Set());
  };

  return {
    editedCells,
    correctedCells,
    handleCellEdit,
    handleResetChanges,
    reset
  };
}
