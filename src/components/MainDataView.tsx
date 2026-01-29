import { CheckCircle, FileSpreadsheet, X, Filter, RotateCcw } from 'lucide-react';
import { DataTable } from './DataTable';
import { EditableDataTable } from './EditableDataTable';
import { InvalidRowsTable } from './InvalidRowsTable';
import { CSVRow, ValidationResult, cleanCSVData } from '../utils/csvValidation';

type TabType = 'original' | 'cleaned';

interface MainDataViewProps {
  file: File;
  csvData: CSVRow[];
  validationResult: ValidationResult;
  activeTab: TabType;
  showSuccessMessage: boolean;
  showOnlyInvalid: boolean;
  editedCells: Map<string, string>;
  correctedCells: Set<string>;
  onTabChange: (tab: TabType) => void;
  onReset: () => void;
  onToggleInvalidFilter: () => void;
  onResetChanges: () => void;
  onCellEdit: (rowIndex: number, field: string, newValue: string) => void;
}

export function MainDataView({
  file,
  csvData,
  validationResult,
  activeTab,
  showSuccessMessage,
  showOnlyInvalid,
  editedCells,
  correctedCells,
  onTabChange,
  onReset,
  onToggleInvalidFilter,
  onResetChanges,
  onCellEdit
}: MainDataViewProps) {
  const cleanedData = cleanCSVData(csvData, validationResult.invalidRowIndices);
  const filteredData = showOnlyInvalid
    ? csvData.filter((_, index) => validationResult.invalidRowIndices.has(index))
    : csvData;

  return (
    <div className="flex-1" style={{ width: '65%' }}>
      <div className="px-6 py-6">
        {showSuccessMessage && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6 flex items-center gap-3">
            <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0" />
            <div>
              <p className="font-semibold text-green-800">File cleaned successfully!</p>
              <p className="text-sm text-green-700">
                You can now upload your cleaned data to AWS or Breakthrough T1D systems.
              </p>
            </div>
          </div>
        )}

        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <FileSpreadsheet className="w-6 h-6 text-blue-600" />
              <div>
                <h2 className="text-lg font-semibold text-gray-800">{file.name}</h2>
                <p className="text-sm text-gray-500">
                  {csvData.length} rows • {(file.size / 1024).toFixed(1)} KB
                </p>
              </div>
            </div>
            <button
              onClick={onReset}
              className="text-gray-500 hover:text-gray-700 transition-colors"
              title="Upload a different file"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex gap-2 mb-4 border-b">
            <button
              onClick={() => onTabChange('original')}
              className={`px-4 py-2 font-medium transition-colors ${
                activeTab === 'original'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Original Data
            </button>
            <button
              onClick={() => onTabChange('cleaned')}
              className={`px-4 py-2 font-medium transition-colors ${
                activeTab === 'cleaned'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Cleaned Data ({validationResult.validRows} rows)
            </button>
          </div>

          {activeTab === 'original' && (
            <>
              <div className="flex items-center gap-2 mb-4">
                <button
                  onClick={onToggleInvalidFilter}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                    showOnlyInvalid
                      ? 'bg-red-100 text-red-700 hover:bg-red-200'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <Filter className="w-4 h-4" />
                  {showOnlyInvalid ? 'Show All Rows' : 'Show Only Invalid Rows'}
                </button>
                {validationResult.errors.length > 0 && (
                  <span className="text-sm text-gray-600">
                    ({validationResult.invalidRowIndices.size} invalid rows)
                  </span>
                )}
                {editedCells.size > 0 && (
                  <button
                    onClick={onResetChanges}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg font-medium hover:bg-gray-700 transition-colors ml-auto"
                  >
                    <RotateCcw className="w-4 h-4" />
                    Reset Changes
                  </button>
                )}
              </div>
              <EditableDataTable
                data={filteredData}
                cellErrors={validationResult.cellErrors}
                editedCells={editedCells}
                correctedCells={correctedCells}
                onCellEdit={onCellEdit}
                maxRows={500}
              />
            </>
          )}

          {activeTab === 'cleaned' && (
            <DataTable data={cleanedData} maxRows={500} />
          )}
        </div>

        {validationResult.errors.length > 0 && (
          <InvalidRowsTable errors={validationResult.errors} />
        )}
      </div>
    </div>
  );
}
