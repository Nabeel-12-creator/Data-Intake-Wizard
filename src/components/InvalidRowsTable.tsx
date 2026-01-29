// Invalid Rows Table Component
// Displays a table of all validation errors found in the CSV data

import { AlertCircle } from 'lucide-react';
import type { ValidationError } from '../utils/csvValidation';

interface InvalidRowsTableProps {
  errors: ValidationError[];
}

export function InvalidRowsTable({ errors }: InvalidRowsTableProps) {
  if (errors.length === 0) {
    return null;
  }

  const getErrorTypeColor = (type: ValidationError['type']) => {
    switch (type) {
      case 'email':
        return 'bg-red-100 text-red-800';
      case 'donation':
        return 'bg-orange-100 text-orange-800';
      case 'date':
        return 'bg-yellow-100 text-yellow-800';
      case 'duplicate':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getErrorTypeLabel = (type: ValidationError['type']) => {
    switch (type) {
      case 'email':
        return 'Email';
      case 'donation':
        return 'Donation';
      case 'date':
        return 'Date';
      case 'duplicate':
        return 'Duplicate';
      default:
        return type;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center gap-2 mb-4">
        <AlertCircle className="w-5 h-5 text-red-500" />
        <h2 className="text-xl font-semibold text-gray-800">Invalid Rows</h2>
        <span className="text-sm text-gray-500">({errors.length} issues found)</span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b-2 border-gray-200">
              <th className="text-left py-3 px-4 font-semibold text-gray-700 text-sm">Row</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-700 text-sm">Type</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-700 text-sm">Field</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-700 text-sm">Value</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-700 text-sm">Issue</th>
            </tr>
          </thead>
          <tbody>
            {errors.map((error, index) => (
              <tr
                key={index}
                className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
              >
                <td className="py-3 px-4 text-sm text-gray-900 font-medium">{error.row}</td>
                <td className="py-3 px-4">
                  <span
                    className={`inline-block px-2 py-1 text-xs font-semibold rounded ${getErrorTypeColor(
                      error.type
                    )}`}
                  >
                    {getErrorTypeLabel(error.type)}
                  </span>
                </td>
                <td className="py-3 px-4 text-sm text-gray-700 font-mono">{error.field}</td>
                <td className="py-3 px-4 text-sm text-gray-600 max-w-xs truncate">
                  {error.value || <span className="italic text-gray-400">(empty)</span>}
                </td>
                <td className="py-3 px-4 text-sm text-gray-700">{error.message}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
