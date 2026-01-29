// Sidebar Component
// Provides instructions and guidance for using the Data Intake Wizard

import { FileText, CheckCircle, Download, AlertCircle } from 'lucide-react';

export function Sidebar() {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 sticky top-6">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">How It Works</h2>

      <div className="space-y-4">
        <div className="flex gap-3">
          <div className="flex-shrink-0">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <FileText className="w-4 h-4 text-blue-600" />
            </div>
          </div>
          <div>
            <h3 className="font-medium text-gray-800 text-sm mb-1">Upload CSV File</h3>
            <p className="text-xs text-gray-600">
              Select and upload your chapter's CSV file containing donations or contact data.
            </p>
          </div>
        </div>

        <div className="flex gap-3">
          <div className="flex-shrink-0">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-4 h-4 text-blue-600" />
            </div>
          </div>
          <div>
            <h3 className="font-medium text-gray-800 text-sm mb-1">Review Validation</h3>
            <p className="text-xs text-gray-600">
              The wizard automatically checks for invalid emails, donations, dates, and duplicates.
            </p>
          </div>
        </div>

        <div className="flex gap-3">
          <div className="flex-shrink-0">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <Download className="w-4 h-4 text-blue-600" />
            </div>
          </div>
          <div>
            <h3 className="font-medium text-gray-800 text-sm mb-1">Download Clean Data</h3>
            <p className="text-xs text-gray-600">
              Download a cleaned CSV with invalid rows removed and dates standardized.
            </p>
          </div>
        </div>
      </div>

      <div className="mt-6 pt-6 border-t border-gray-200">
        <div className="flex gap-2 mb-2">
          <AlertCircle className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
          <h3 className="font-medium text-gray-800 text-sm">Validation Rules</h3>
        </div>
        <ul className="text-xs text-gray-600 space-y-1.5 ml-6">
          <li>• Emails must contain "@" symbol</li>
          <li>• Donation amounts must be numbers greater than 0</li>
          <li>• Dates must be in YYYY-MM-DD or MM/DD/YYYY format</li>
          <li>• No duplicate emails or donor IDs allowed</li>
        </ul>
      </div>

      <div className="mt-6 pt-6 border-t border-gray-200">
        <p className="text-xs text-gray-500 leading-relaxed">
          <strong className="text-gray-700">Note:</strong> Cleaned data can be safely uploaded to
          AWS or other systems. Invalid rows are removed, text is trimmed, and dates are
          standardized to YYYY-MM-DD format.
        </p>
      </div>
    </div>
  );
}
