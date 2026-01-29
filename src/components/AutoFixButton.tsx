import { useState } from 'react';
import { Sparkles, Loader2, Undo2 } from 'lucide-react';
import { CSVRow } from '../utils/csvValidation';
import {
  autoFixData,
  AutoFixOptions,
  AutoFixChangeLog,
  DetailedChange,
  UnresolvedIssue
} from '../utils/autoFixData';
import { AdvancedFixesPopover } from './AdvancedFixesPopover';
import { ResultsSummaryModal } from './ResultsSummaryModal';

interface AutoFixButtonProps {
  data: CSVRow[];
  onAutoFix: (
    cleanedData: CSVRow[],
    changeLog: AutoFixChangeLog,
    totalIssues: number,
    detailedChanges: DetailedChange[],
    unresolvedIssues: UnresolvedIssue[]
  ) => void;
  onUndoAutoFix: () => void;
  hasAutoFix: boolean;
}

export function AutoFixButton({ data, onAutoFix, onUndoAutoFix, hasAutoFix }: AutoFixButtonProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [lastChangeLog, setLastChangeLog] = useState<AutoFixChangeLog | null>(null);
  const [lastTotalIssues, setLastTotalIssues] = useState(0);
  const [lastDetailedChanges, setLastDetailedChanges] = useState<DetailedChange[]>([]);
  const [lastUnresolvedIssues, setLastUnresolvedIssues] = useState<UnresolvedIssue[]>([]);

  const [options, setOptions] = useState<AutoFixOptions>({
    flipNegativeAmounts: false,
    treatZeroAmountsInvalid: false,
    tryAmbiguousDateSwaps: false
  });

  const handleAutoFix = async () => {
    setIsProcessing(true);

    await new Promise(resolve => setTimeout(resolve, 1200));

    const result = autoFixData(data, options);
    setLastChangeLog(result.changeLog);
    setLastTotalIssues(result.totalIssuesFixed);
    setLastDetailedChanges(result.detailedChanges);
    setLastUnresolvedIssues(result.unresolvedIssues);

    onAutoFix(
      result.cleanedData,
      result.changeLog,
      result.totalIssuesFixed,
      result.detailedChanges,
      result.unresolvedIssues
    );

    setIsProcessing(false);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  return (
    <>
      <div className="flex flex-wrap gap-3 items-center">
        <button
          onClick={handleAutoFix}
          disabled={isProcessing || data.length === 0}
          className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-button font-semibold hover:bg-primary/90 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isProcessing ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Cleaning your data...
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5" />
              Auto-Fix Invalid Data
            </>
          )}
        </button>

        <AdvancedFixesPopover options={options} onOptionsChange={setOptions} />

        {hasAutoFix && (
          <button
            onClick={onUndoAutoFix}
            className="flex items-center gap-2 px-4 py-3 bg-gray-400 text-white rounded-button font-medium hover:bg-gray-500 transition-colors shadow-md"
          >
            <Undo2 className="w-4 h-4" />
            Undo Auto-Fix
          </button>
        )}
      </div>

      {lastChangeLog && (
        <ResultsSummaryModal
          isOpen={showModal}
          onClose={handleCloseModal}
          changeLog={lastChangeLog}
          totalIssuesFixed={lastTotalIssues}
          detailedChanges={lastDetailedChanges}
          unresolvedIssues={lastUnresolvedIssues}
        />
      )}
    </>
  );
}
