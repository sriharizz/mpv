import React from 'react';
import { FileSpreadsheet, ArrowDownCircle, X } from 'lucide-react';

interface DownloadNotificationProps {
  isOpen: boolean;
  fileName: string;
  onOpenViewer: () => void;
  onClose: () => void;
}

export const DownloadNotification: React.FC<DownloadNotificationProps> = ({
  isOpen,
  fileName,
  onOpenViewer,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div
      role="region"
      aria-label="Download notification"
      className="fixed bottom-16 right-4 z-40 max-w-sm bg-white rounded-xl shadow-2xl border border-emerald-300 p-4 animate-in slide-in-from-bottom-2 fade-in"
    >
      <div className="flex items-start justify-between space-x-3">
        <div className="flex items-start space-x-3">
          <div className="p-2 bg-emerald-100 text-emerald-700 rounded-lg">
            <ArrowDownCircle className="w-5 h-5" />
          </div>

          <div className="space-y-1">
            <p className="text-xs font-bold text-slate-800">Download Complete</p>
            <p className="text-[11px] text-slate-500">File exported successfully to your device:</p>

            {/* Clickable file link to open Excel Viewer Modal (OQ Test Set #2 Scenario 7) */}
            <button
              type="button"
              onClick={onOpenViewer}
              className="text-xs font-semibold text-emerald-700 hover:text-emerald-900 underline flex items-center space-x-1 mt-1 text-left"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 flex-shrink-0" />
              <span>{fileName}</span>
            </button>
            <p className="text-[10px] text-slate-400">Click filename above to preview spreadsheet in-app</p>
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="text-slate-400 hover:text-slate-600 p-1 rounded"
          aria-label="Dismiss download notification"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
