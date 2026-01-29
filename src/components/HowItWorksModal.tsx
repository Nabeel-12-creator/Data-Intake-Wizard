import { X, FileText, CheckCircle, Download, AlertCircle } from 'lucide-react';

interface HowItWorksModalProps {
  onClose: () => void;
}

export function HowItWorksModal({ onClose }: HowItWorksModalProps) {
  return (
    <div className="modal-overlay flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black bg-opacity-50" onClick={onClose}></div>
      <div className="modal-content bg-white rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between" style={{ zIndex: 1 }}>
          <h2 className="text-2xl font-bold text-gray-900">How It Works</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6">
          <div className="space-y-6">
            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <FileText className="w-6 h-6 text-blue-600" />
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-gray-800 text-lg mb-2">Upload CSV File</h3>
                <p className="text-gray-600">
                  Select and upload your chapter's CSV file containing donations or contact data.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-blue-600" />
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-gray-800 text-lg mb-2">Review Validation</h3>
                <p className="text-gray-600">
                  The wizard automatically checks for invalid emails, donations, dates, and duplicates.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <Download className="w-6 h-6 text-blue-600" />
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-gray-800 text-lg mb-2">Download Clean Data</h3>
                <p className="text-gray-600">
                  Download a cleaned CSV with invalid rows removed and dates standardized.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-gray-200">
            <h3 className="font-semibold text-gray-800 text-lg mb-3 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-blue-600" />
              Validation Rules
            </h3>
            <ul className="text-gray-600 space-y-2 ml-7">
              <li>• Emails must contain "@" symbol</li>
              <li>• Donation amounts must be numbers greater than 0</li>
              <li>• Dates must be in YYYY-MM-DD or MM/DD/YYYY format</li>
              <li>• No duplicate emails or donor IDs allowed</li>
            </ul>
          </div>

          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-600 leading-relaxed">
              <strong className="text-gray-800">Note:</strong> Cleaned data can be safely uploaded to
              AWS or other systems. Invalid rows are removed, text is trimmed, and dates are
              standardized to YYYY-MM-DD format.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
