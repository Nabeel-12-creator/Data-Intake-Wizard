import { Upload } from 'lucide-react';

interface FileUploadZoneProps {
  onFileUpload: (file: File) => void;
  isDragging: boolean;
  onDragOver: (e: React.DragEvent) => void;
  onDragLeave: () => void;
  onDrop: (e: React.DragEvent) => void;
}

export function FileUploadZone({
  onFileUpload,
  isDragging,
  onDragOver,
  onDragLeave,
  onDrop
}: FileUploadZoneProps) {
  return (
    <div
      onDrop={onDrop}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      className={`bg-white rounded-lg shadow-md p-12 text-center border-2 border-dashed transition-colors ${
        isDragging
          ? 'border-blue-500 bg-blue-50'
          : 'border-gray-300 hover:border-blue-400'
      }`}
    >
      <Upload className="w-16 h-16 text-gray-400 mx-auto mb-4" />
      <h2 className="text-xl font-semibold text-gray-700 mb-2">Upload Your File</h2>
      <p className="text-gray-500 mb-6">
        Drag and drop your CSV or Excel file here, or click to browse
      </p>
      <label className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors cursor-pointer">
        <input
          type="file"
          accept=".csv,.xlsx,.xls"
          onChange={(e) => {
            const selectedFile = e.target.files?.[0];
            if (selectedFile) onFileUpload(selectedFile);
          }}
          className="hidden"
        />
        Select File (CSV or Excel)
      </label>
    </div>
  );
}
