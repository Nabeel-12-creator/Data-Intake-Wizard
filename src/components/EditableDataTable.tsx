import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, AlertCircle, Edit3 } from 'lucide-react';
import { CSVRow, getCellKey, ValidationError } from '../utils/csvValidation';

interface EditableDataTableProps {
  data: CSVRow[];
  cellErrors: Map<string, ValidationError>;
  editedCells: Map<string, string>;
  correctedCells: Set<string>;
  onCellEdit: (rowIndex: number, field: string, newValue: string) => void;
  maxRows?: number;
  showRowNumbers?: boolean;
}

export function EditableDataTable({
  data,
  cellErrors,
  editedCells,
  correctedCells,
  onCellEdit,
  maxRows = 500,
  showRowNumbers = true
}: EditableDataTableProps) {
  const [editingCell, setEditingCell] = useState<{ rowIndex: number; field: string } | null>(null);
  const [editValue, setEditValue] = useState('');
  const [originalValue, setOriginalValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editingCell && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editingCell]);

  if (data.length === 0) return null;

  const headers = Object.keys(data[0]);
  const displayData = maxRows ? data.slice(0, maxRows) : data;

  const handleCellClick = (rowIndex: number, field: string, currentValue: string) => {
    setEditingCell({ rowIndex, field });
    setEditValue(currentValue);
    setOriginalValue(currentValue);
  };

  const handleSave = () => {
    if (editingCell && editValue !== originalValue) {
      onCellEdit(editingCell.rowIndex, editingCell.field, editValue);
    }
    setEditingCell(null);
  };

  const handleCancel = () => {
    setEditingCell(null);
    setEditValue(originalValue);
  };

  const handleKeyDown = (e: React.KeyboardEvent, rowIndex: number, field: string) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSave();

      const currentFieldIndex = headers.indexOf(field);
      const nextInvalidCell = findNextInvalidCell(rowIndex, currentFieldIndex);

      if (nextInvalidCell) {
        setTimeout(() => {
          handleCellClick(nextInvalidCell.rowIndex, nextInvalidCell.field, data[nextInvalidCell.rowIndex][nextInvalidCell.field]);
        }, 50);
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      handleCancel();
    } else if (e.key === 'Tab') {
      e.preventDefault();
      handleSave();

      const currentFieldIndex = headers.indexOf(field);
      const nextInvalidCell = findNextInvalidCell(rowIndex, currentFieldIndex);

      if (nextInvalidCell) {
        setTimeout(() => {
          handleCellClick(nextInvalidCell.rowIndex, nextInvalidCell.field, data[nextInvalidCell.rowIndex][nextInvalidCell.field]);
        }, 50);
      }
    }
  };

  const findNextInvalidCell = (currentRowIndex: number, currentFieldIndex: number): { rowIndex: number; field: string } | null => {
    for (let i = currentRowIndex; i < displayData.length; i++) {
      const startFieldIndex = i === currentRowIndex ? currentFieldIndex + 1 : 0;

      for (let j = startFieldIndex; j < headers.length; j++) {
        const cellKey = getCellKey(i, headers[j]);
        if (cellErrors.has(cellKey) && !correctedCells.has(cellKey)) {
          return { rowIndex: i, field: headers[j] };
        }
      }
    }

    return null;
  };

  const getCellStatus = (rowIndex: number, field: string) => {
    const cellKey = getCellKey(rowIndex, field);
    const hasError = cellErrors.has(cellKey);
    const isCorrected = correctedCells.has(cellKey);
    const isEdited = editedCells.has(cellKey);

    return { hasError, isCorrected, isEdited };
  };

  return (
    <div className="space-y-2">
      <div className="overflow-x-auto max-h-[600px] overflow-y-auto border rounded">
        <table className="w-full border-collapse text-sm">
          <thead className="bg-gray-50">
            <tr>
              {showRowNumbers && (
                <th className="text-left py-2 px-3 font-semibold text-gray-700 border-b">
                  #
                </th>
              )}
              {headers.map((header) => (
                <th
                  key={header}
                  className="text-left py-2 px-3 font-semibold text-gray-700 border-b whitespace-nowrap"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {displayData.map((row, rowIndex) => {
              const hasAnyError = headers.some(field => getCellStatus(rowIndex, field).hasError);
              const rowClass = hasAnyError ? 'bg-red-50' : 'bg-white';

              return (
                <tr key={rowIndex} className={`${rowClass} hover:bg-gray-100 transition-colors`}>
                  {showRowNumbers && (
                    <td className={`py-2 px-3 border-b font-medium ${
                      hasAnyError ? 'text-red-600' : 'text-gray-600'
                    }`}>
                      {rowIndex + 1}
                    </td>
                  )}
                  {headers.map((field) => {
                    const { hasError, isCorrected } = getCellStatus(rowIndex, field);
                    const cellKey = getCellKey(rowIndex, field);
                    const isEditing = editingCell?.rowIndex === rowIndex && editingCell?.field === field;
                    const cellValue = row[field];
                    const error = cellErrors.get(cellKey);

                    let cellBgClass = '';
                    if (isCorrected) {
                      cellBgClass = 'bg-green-100';
                    } else if (hasError) {
                      cellBgClass = 'bg-red-100';
                    }

                    return (
                      <td
                        key={field}
                        className={`py-2 px-3 border-b relative group ${cellBgClass}`}
                        title={error ? error.message : ''}
                      >
                        <AnimatePresence mode="wait">
                          {isEditing ? (
                            <motion.div
                              key="editing"
                              initial={{ opacity: 0, y: -5 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: 5 }}
                              transition={{ duration: 0.15 }}
                            >
                              <input
                                ref={inputRef}
                                type="text"
                                value={editValue}
                                onChange={(e) => setEditValue(e.target.value)}
                                onBlur={handleSave}
                                onKeyDown={(e) => handleKeyDown(e, rowIndex, field)}
                                className="w-full px-2 py-1 border-2 border-blue-500 rounded focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white shadow-sm"
                              />
                            </motion.div>
                          ) : (
                            <motion.div
                              key="display"
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              exit={{ opacity: 0 }}
                              transition={{ duration: 0.15 }}
                              className="flex items-center justify-between gap-2"
                            >
                              <span className="text-gray-700 flex-grow">{cellValue}</span>
                              <div className="flex items-center gap-1 flex-shrink-0">
                                {isCorrected && (
                                  <Check className="w-4 h-4 text-green-600" title="Fixed" />
                                )}
                                {hasError && !isCorrected && (
                                  <>
                                    <AlertCircle className="w-4 h-4 text-red-600" title={error?.message} />
                                    <button
                                      onClick={() => handleCellClick(rowIndex, field, cellValue)}
                                      className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-gray-200 rounded"
                                      title="Edit cell"
                                    >
                                      <Edit3 className="w-3.5 h-3.5 text-gray-600" />
                                    </button>
                                  </>
                                )}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {maxRows && data.length > maxRows && (
        <p className="text-xs text-gray-500">
          Showing first {maxRows} rows of {data.length}
        </p>
      )}
    </div>
  );
}
