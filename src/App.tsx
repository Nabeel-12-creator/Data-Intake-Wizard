import { useState } from 'react';
import { validateCSVData } from './utils/csvValidation';
import { ToastContainer, ToastMessage } from './components/Toast';
import { Header } from './components/Header';
import { FileUploadZone } from './components/FileUploadZone';
import { MainDataView } from './components/MainDataView';
import { SidePanel } from './components/SidePanel';
import { HowItWorksModal } from './components/HowItWorksModal';
import { Footer } from './components/Footer';
import { useFileUpload } from './hooks/useFileUpload';
import { useCellEditing } from './hooks/useCellEditing';
import { useDownloads } from './hooks/useDownloads';
import { useAutoFix } from './hooks/useAutoFix';

type TabType = 'original' | 'cleaned';

function App() {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [activeTab, setActiveTab] = useState<TabType>('original');
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [showOnlyInvalid, setShowOnlyInvalid] = useState(false);
  const [showHowItWorksModal, setShowHowItWorksModal] = useState(false);

  const addToast = (type: ToastMessage['type'], message: string) => {
    const newToast: ToastMessage = {
      id: `${Date.now()}-${Math.random()}`,
      type,
      message
    };
    setToasts(prev => [...prev, newToast]);
  };

  const dismissToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const {
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
    reset: resetFileUpload
  } = useFileUpload(addToast);

  const {
    editedCells,
    correctedCells,
    handleCellEdit,
    handleResetChanges,
    reset: resetCellEditing
  } = useCellEditing(
    csvData,
    originalCsvData,
    validationResult,
    setCsvData,
    setValidationResult,
    addToast
  );

  const {
    hasAutoFix,
    handleAutoFix,
    handleUndoAutoFix,
    reset: resetAutoFix
  } = useAutoFix(csvData, setCsvData, setValidationResult, addToast);

  const showSuccessMessageWithTimeout = () => {
    setShowSuccessMessage(true);
    setTimeout(() => setShowSuccessMessage(false), 5000);
  };

  const {
    handleDownloadCleanedCSV,
    handleDownloadFullUpdatedCSV,
    handleDownloadErrorReport
  } = useDownloads(file, csvData, validationResult, addToast, showSuccessMessageWithTimeout);

  const handleRevalidateAll = () => {
    const validation = validateCSVData(csvData);
    setValidationResult(validation);
    addToast('success', 'Re-validation complete');
  };

  const handleReset = () => {
    resetFileUpload();
    resetCellEditing();
    resetAutoFix();
    setActiveTab('original');
    setShowSuccessMessage(false);
    setShowOnlyInvalid(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />

      <Header
        file={file}
        validationResult={validationResult}
        editedCellsCount={editedCells.size}
        onRevalidateAll={handleRevalidateAll}
        onDownloadCleanedCSV={handleDownloadCleanedCSV}
        onDownloadFullUpdatedCSV={handleDownloadFullUpdatedCSV}
        onDownloadErrorReport={handleDownloadErrorReport}
        onShowHowItWorks={() => setShowHowItWorksModal(true)}
      />

      <div className="flex-grow flex">
        {!file ? (
          <div className="flex-1 px-6 py-6">
            <FileUploadZone
              onFileUpload={handleFileUpload}
              isDragging={isDragging}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            />
          </div>
        ) : (
          <>
            {validationResult && (
              <MainDataView
                file={file}
                csvData={csvData}
                validationResult={validationResult}
                activeTab={activeTab}
                showSuccessMessage={showSuccessMessage}
                showOnlyInvalid={showOnlyInvalid}
                editedCells={editedCells}
                correctedCells={correctedCells}
                onTabChange={setActiveTab}
                onReset={handleReset}
                onToggleInvalidFilter={() => setShowOnlyInvalid(!showOnlyInvalid)}
                onResetChanges={handleResetChanges}
                onCellEdit={handleCellEdit}
              />
            )}

            {validationResult && (
              <SidePanel
                csvData={csvData}
                validationResult={validationResult}
                hasAutoFix={hasAutoFix}
                onAutoFix={handleAutoFix}
                onUndoAutoFix={handleUndoAutoFix}
              />
            )}
          </>
        )}
      </div>

      {showHowItWorksModal && (
        <HowItWorksModal onClose={() => setShowHowItWorksModal(false)} />
      )}

      <Footer />
    </div>
  );
}

export default App;
