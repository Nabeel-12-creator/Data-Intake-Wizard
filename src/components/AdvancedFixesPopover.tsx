import { useState } from 'react';
import { Settings } from 'lucide-react';
import { AutoFixOptions } from '../utils/autoFixData';

interface AdvancedFixesPopoverProps {
  options: AutoFixOptions;
  onOptionsChange: (options: AutoFixOptions) => void;
}

export function AdvancedFixesPopover({ options, onOptionsChange }: AdvancedFixesPopoverProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleToggle = (key: keyof AutoFixOptions) => {
    onOptionsChange({
      ...options,
      [key]: !options[key]
    });
  };

  return (
    <div className="relative inline-block">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-3 bg-white border-2 border-primary text-primary rounded-button font-medium hover:bg-primary hover:text-white transition-colors"
        title="Advanced Fixes"
      >
        <Settings className="w-4 h-4" />
        Advanced
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          ></div>
          <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-200 z-20 p-4">
            <div className="mb-3">
              <h3 className="text-sm font-semibold flex items-center gap-2">
                <Settings className="w-4 h-4" />
                Advanced Fix Options
              </h3>
              <p className="text-xs text-navy/70 mt-1">
                Configure additional data cleaning rules
              </p>
            </div>

            <div className="space-y-3">
              <label className="flex items-start gap-3 cursor-pointer group">
                <div className="flex items-center h-5">
                  <input
                    type="checkbox"
                    checked={options.flipNegativeAmounts}
                    onChange={() => handleToggle('flipNegativeAmounts')}
                    className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-2 focus:ring-primary cursor-pointer"
                  />
                </div>
                <div className="flex-1">
                  <div className="text-sm font-medium text-navy group-hover:text-primary">
                    Flip negative donation amounts to positive
                  </div>
                  <div className="text-xs text-navy/70 mt-0.5">
                    Convert amounts like -$50 to $50
                  </div>
                </div>
              </label>

              <label className="flex items-start gap-3 cursor-pointer group">
                <div className="flex items-center h-5">
                  <input
                    type="checkbox"
                    checked={options.treatZeroAmountsInvalid}
                    onChange={() => handleToggle('treatZeroAmountsInvalid')}
                    className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-2 focus:ring-primary cursor-pointer"
                  />
                </div>
                <div className="flex-1">
                  <div className="text-sm font-medium text-navy group-hover:text-primary">
                    Treat zero donation amounts as invalid
                  </div>
                  <div className="text-xs text-navy/70 mt-0.5">
                    Flag $0 donations as unresolved issues
                  </div>
                </div>
              </label>

              <label className="flex items-start gap-3 cursor-pointer group">
                <div className="flex items-center h-5">
                  <input
                    type="checkbox"
                    checked={options.tryAmbiguousDateSwaps}
                    onChange={() => handleToggle('tryAmbiguousDateSwaps')}
                    className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-2 focus:ring-primary cursor-pointer"
                  />
                </div>
                <div className="flex-1">
                  <div className="text-sm font-medium text-navy group-hover:text-primary">
                    Try ambiguous date swaps (DD/MM vs MM/DD)
                  </div>
                  <div className="text-xs text-navy/70 mt-0.5">
                    Attempt to fix dates like 13/05/2024 by swapping day and month
                  </div>
                </div>
              </label>
            </div>

            <div className="mt-4 pt-3 border-t border-gray-200">
              <button
                onClick={() => setIsOpen(false)}
                className="w-full px-3 py-2 bg-primary text-white text-sm rounded-button font-medium hover:bg-primary/90 transition-colors"
              >
                Apply Settings
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
