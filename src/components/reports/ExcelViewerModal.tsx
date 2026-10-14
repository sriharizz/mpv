import React from 'react';
import { AuditHistoryRecord } from '../../types/onepv';
import { FileSpreadsheet, X } from 'lucide-react';

interface ExcelViewerModalProps {
  isOpen: boolean;
  fileName: string;
  records: AuditHistoryRecord[];
  onClose: () => void;
}

export const ExcelViewerModal: React.FC<ExcelViewerModalProps> = ({
  isOpen,
  fileName,
  records,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 animate-in fade-in"
    >
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-4xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header styled like Microsoft Excel / Spreadsheet window */}
        <div className="px-5 py-3.5 bg-emerald-700 text-white flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="p-1.5 bg-emerald-800 rounded">
              <FileSpreadsheet className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-sm tracking-tight">{fileName}</h3>
              <p className="text-[11px] text-emerald-200">Excel Spreadsheet Viewer (Audit History Export)</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="text-emerald-200 hover:text-white p-1 rounded transition-colors"
            aria-label="Close the Excel File"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Spreadsheet Sheet Bar */}
        <div className="bg-slate-100 border-b border-slate-300 px-4 py-1.5 flex items-center space-x-4 text-xs text-slate-600">
          <span className="font-semibold text-emerald-800 border-b-2 border-emerald-600 pb-0.5">Sheet1 - Audit Records</span>
          <span>Read-Only Mode</span>
          <span className="text-slate-400">|</span>
          <span>{records.length} Row(s)</span>
        </div>

        {/* Spreadsheet Grid Body */}
        <div className="flex-1 overflow-auto p-4 bg-slate-50 font-sans text-xs">
          <div className="bg-white border border-slate-300 shadow-sm rounded">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-300 text-[11px]">
                  <th className="border-r border-slate-300 px-3 py-2 w-10 text-center text-slate-400">#</th>
                  <th className="border-r border-slate-300 px-4 py-2">Case Number</th>
                  <th className="border-r border-slate-300 px-4 py-2">Field Name</th>
                  <th className="border-r border-slate-300 px-4 py-2">Old Value</th>
                  <th className="border-r border-slate-300 px-4 py-2">New Value</th>
                  <th className="border-r border-slate-300 px-4 py-2">Updated By</th>
                  <th className="px-4 py-2">Date & Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {records.map((r, idx) => {
                  const isReportedTerm = r.fieldName === 'Reported Term';
                  return (
                    <tr
                      key={r.id || idx}
                      className={isReportedTerm ? 'bg-amber-50/70 hover:bg-amber-100/60' : 'hover:bg-slate-50'}
                    >
                      <td className="border-r border-slate-300 px-3 py-2 text-center text-slate-400 font-mono text-[10px]">
                        {idx + 1}
                      </td>
                      <td className="border-r border-slate-300 px-4 py-2 font-mono font-medium text-slate-800">
                        {r.caseNumber}
                      </td>
                      <td className="border-r border-slate-300 px-4 py-2 font-semibold text-brand-900">
                        {r.fieldName}
                      </td>
                      <td className="border-r border-slate-300 px-4 py-2 text-slate-600">
                        {r.oldValue || '-'}
                      </td>
                      <td className="border-r border-slate-300 px-4 py-2 font-semibold text-emerald-700">
                        {r.newValue || '-'}
                      </td>
                      <td className="border-r border-slate-300 px-4 py-2 text-slate-700">
                        {r.updatedBy}
                      </td>
                      <td className="px-4 py-2 font-mono text-slate-500 text-[11px]">
                        {r.timestamp}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer with Close Button (OQ Test Set #2 Scenario 7: "Close the Excel File") */}
        <div className="px-5 py-3 bg-slate-100 border-t border-slate-200 flex items-center justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50 shadow-sm transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
