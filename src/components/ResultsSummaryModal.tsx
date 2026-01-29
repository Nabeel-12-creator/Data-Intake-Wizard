import { useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, AlertTriangle, X, Download, ChevronRight, ChevronDown } from 'lucide-react';
import {
  AutoFixChangeLog,
  DetailedChange,
  UnresolvedIssue
} from '../utils/autoFixData';

interface ResultsSummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  changeLog: AutoFixChangeLog;
  totalIssuesFixed: number;
  detailedChanges: DetailedChange[];
  unresolvedIssues: UnresolvedIssue[];
}

export function ResultsSummaryModal({
  isOpen,
  onClose,
  changeLog,
  totalIssuesFixed,
  detailedChanges,
  unresolvedIssues
}: ResultsSummaryModalProps) {
  const [showDetailedChanges, setShowDetailedChanges] = useState(false);
  const [showUnresolvedIssues, setShowUnresolvedIssues] = useState(false);

  if (!isOpen) return null;

  const handleDownloadChangeLog = () => {
    const csvContent = [
      ['Row', 'Field', 'Before', 'After', 'Fix Type'],
      ...detailedChanges.map(change => [
        change.rowIndex.toString(),
        change.field,
        change.before,
        change.after,
        change.fixType
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `auto-fix-changelog-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const groupedUnresolvedByReason: Record<string, UnresolvedIssue[]> = {};
  unresolvedIssues.forEach(issue => {
    if (!groupedUnresolvedByReason[issue.reason]) {
      groupedUnresolvedByReason[issue.reason] = [];
    }
    groupedUnresolvedByReason[issue.reason].push(issue);
  });

  return (
    <div className="modal-overlay flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black bg-opacity-50" onClick={onClose}></div>
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="modal-content bg-white rounded-xl shadow-2xl max-w-3xl w-full h-[75vh] flex flex-col"
      >
        <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="bg-brand-green/20 p-2 rounded-full">
              <CheckCircle className="w-6 h-6 text-brand-green" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">Auto-Fix Results</h2>
              <p className="text-sm text-navy/70">{totalIssuesFixed} issues corrected</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6 overflow-y-auto flex-1">
          <div>
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-brand-green" />
              Fixed Issues Summary
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {changeLog.columnsRenamed > 0 && (
                <div className="bg-primary/10 rounded-lg p-3">
                  <div className="text-2xl font-bold text-primary">{changeLog.columnsRenamed}</div>
                  <div className="text-sm text-navy">Columns standardized</div>
                </div>
              )}
              {changeLog.namesCorrected > 0 && (
                <div className="bg-primary/10 rounded-lg p-3">
                  <div className="text-2xl font-bold text-primary">{changeLog.namesCorrected}</div>
                  <div className="text-sm text-navy">Names reformatted</div>
                </div>
              )}
              {changeLog.emailsLowercased > 0 && (
                <div className="bg-brand-green/10 rounded-lg p-3">
                  <div className="text-2xl font-bold text-brand-green">{changeLog.emailsLowercased}</div>
                  <div className="text-sm text-navy">Emails lowercased</div>
                </div>
              )}
              {changeLog.emailsCorrected > 0 && (
                <div className="bg-brand-green/10 rounded-lg p-3">
                  <div className="text-2xl font-bold text-brand-green">{changeLog.emailsCorrected}</div>
                  <div className="text-sm text-navy">Email typos fixed</div>
                </div>
              )}
              {changeLog.datesNormalized > 0 && (
                <div className="bg-primary/10 rounded-lg p-3">
                  <div className="text-2xl font-bold text-primary">{changeLog.datesNormalized}</div>
                  <div className="text-sm text-navy">Dates normalized</div>
                </div>
              )}
              {changeLog.statesNormalized > 0 && (
                <div className="bg-primary/10 rounded-lg p-3">
                  <div className="text-2xl font-bold text-primary">{changeLog.statesNormalized}</div>
                  <div className="text-sm text-navy">States abbreviated</div>
                </div>
              )}
              {changeLog.currencyNormalized > 0 && (
                <div className="bg-brand-green/10 rounded-lg p-3">
                  <div className="text-2xl font-bold text-brand-green">{changeLog.currencyNormalized}</div>
                  <div className="text-sm text-navy">Currency normalized</div>
                </div>
              )}
              {changeLog.negativeAmountsFlipped > 0 && (
                <div className="bg-brand-red/10 rounded-lg p-3">
                  <div className="text-2xl font-bold text-brand-red">{changeLog.negativeAmountsFlipped}</div>
                  <div className="text-sm text-navy">Negative amounts flipped</div>
                </div>
              )}
              {changeLog.whitespaceRemoved > 0 && (
                <div className="bg-gray-100 rounded-lg p-3">
                  <div className="text-2xl font-bold text-navy">{changeLog.whitespaceRemoved}</div>
                  <div className="text-sm text-navy">Whitespace trimmed</div>
                </div>
              )}
            </div>
          </div>

          {unresolvedIssues.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-500" />
                Unresolved Issues ({unresolvedIssues.length})
              </h3>
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-3">
                <p className="text-sm text-amber-800">
                  Some issues could not be automatically fixed. Review them in the table and edit manually if needed.
                </p>
              </div>

              <button
                onClick={() => setShowUnresolvedIssues(!showUnresolvedIssues)}
                className="flex items-center gap-2 text-amber-600 font-medium hover:text-amber-700 transition-colors mb-2"
              >
                {showUnresolvedIssues ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                {showUnresolvedIssues ? 'Hide' : 'Show'} Unresolved Issues
              </button>

              {showUnresolvedIssues && (
                <div className="space-y-3 max-h-64 overflow-y-auto border border-gray-200 rounded-lg p-3">
                  {Object.entries(groupedUnresolvedByReason).map(([reason, issues]) => (
                    <div key={reason} className="bg-white rounded-lg p-3 border border-amber-200">
                      <div className="font-semibold text-amber-800 text-sm mb-2">{reason} ({issues.length})</div>
                      <div className="space-y-1">
                        {issues.slice(0, 5).map((issue, idx) => (
                          <div key={idx} className="text-xs text-gray-600 flex gap-2">
                            <span className="font-mono text-amber-700">Row {issue.rowIndex}:</span>
                            <span className="font-medium">{issue.field}</span>
                            <span className="text-gray-500">=</span>
                            <span className="italic">{issue.value}</span>
                          </div>
                        ))}
                        {issues.length > 5 && (
                          <div className="text-xs text-gray-500 italic">
                            ... and {issues.length - 5} more
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {detailedChanges.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold">Detailed Change Log</h3>
                <button
                  onClick={handleDownloadChangeLog}
                  className="flex items-center gap-2 px-3 py-1.5 bg-primary text-white text-sm rounded-button hover:bg-primary/90 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  Download CSV
                </button>
              </div>

              <button
                onClick={() => setShowDetailedChanges(!showDetailedChanges)}
                className="flex items-center gap-2 text-primary font-medium hover:text-primary/80 transition-colors mb-2"
              >
                {showDetailedChanges ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                {showDetailedChanges ? 'Hide' : 'Show'} All Changes ({detailedChanges.length})
              </button>

              {showDetailedChanges && (
                <div className="border border-gray-200 rounded-lg overflow-hidden max-h-64 overflow-y-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 sticky top-0">
                      <tr>
                        <th className="text-left px-3 py-2 font-semibold text-navy">Row</th>
                        <th className="text-left px-3 py-2 font-semibold text-navy">Field</th>
                        <th className="text-left px-3 py-2 font-semibold text-navy">Before</th>
                        <th className="text-left px-3 py-2 font-semibold text-navy">After</th>
                        <th className="text-left px-3 py-2 font-semibold text-navy">Fix Type</th>
                      </tr>
                    </thead>
                    <tbody>
                      {detailedChanges.map((change, idx) => (
                        <tr key={idx} className="border-t border-gray-100">
                          <td className="px-3 py-2 font-mono text-navy">{change.rowIndex}</td>
                          <td className="px-3 py-2 font-medium text-navy">{change.field}</td>
                          <td className="px-3 py-2 text-navy/70 truncate max-w-xs">{change.before}</td>
                          <td className="px-3 py-2 text-brand-green font-medium truncate max-w-xs">{change.after}</td>
                          <td className="px-3 py-2 text-xs text-navy/60">{change.fixType}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="border-t border-gray-200 px-6 py-4 bg-white flex-shrink-0">
          <button
            onClick={onClose}
            className="w-full px-4 py-3 bg-primary text-white rounded-button font-semibold hover:bg-primary/90 transition-all"
          >
            Continue
          </button>
        </div>
      </motion.div>
    </div>
  );
}
