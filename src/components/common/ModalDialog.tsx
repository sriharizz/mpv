import React from 'react';
import { AlertCircle, CheckCircle2, HelpCircle, Info, X } from 'lucide-react';

export type ModalType = 'error' | 'confirm' | 'info' | 'prompt' | 'yesno';

export interface ModalDialogProps {
  isOpen: boolean;
  type?: ModalType;
  title?: string;
  message: string;
  onConfirm?: () => void;
  onCancel?: () => void;
  confirmLabel?: string; // e.g. "OK", "Yes", "Delete"
  cancelLabel?: string;  // e.g. "Cancel", "No"
  showCancel?: boolean;
  inputValue?: string;
  onInputChange?: (val: string) => void;
  inputLabel?: string;
  inputPlaceholder?: string;
  children?: React.ReactNode;
}

export const ModalDialog: React.FC<ModalDialogProps> = ({
  isOpen,
  type = 'info',
  title,
  message,
  onConfirm,
  onCancel,
  confirmLabel = 'OK',
  cancelLabel = 'Cancel',
  showCancel = false,
  inputValue,
  onInputChange,
  inputLabel,
  inputPlaceholder,
  children,
}) => {
  if (!isOpen) return null;

  const getIcon = () => {
    switch (type) {
      case 'error':
        return <AlertCircle className="w-6 h-6 text-red-500 flex-shrink-0" />;
      case 'confirm':
        return <CheckCircle2 className="w-6 h-6 text-emerald-600 flex-shrink-0" />;
      case 'yesno':
        return <HelpCircle className="w-6 h-6 text-brand-600 flex-shrink-0" />;
      default:
        return <Info className="w-6 h-6 text-brand-500 flex-shrink-0" />;
    }
  };

  const getHeaderColor = () => {
    switch (type) {
      case 'error':
        return 'text-red-700 bg-red-50 border-red-100';
      case 'confirm':
        return 'text-emerald-800 bg-emerald-50 border-emerald-100';
      case 'yesno':
        return 'text-slate-800 bg-slate-50 border-slate-200';
      default:
        return 'text-brand-900 bg-brand-50 border-brand-100';
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-in fade-in duration-150"
    >
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden transform transition-all">
        {/* Header */}
        <div className={`px-5 py-3.5 border-b flex items-center justify-between ${getHeaderColor()}`}>
          <div className="flex items-center space-x-2.5">
            {getIcon()}
            <h3 className="font-semibold text-base tracking-tight">
              {title || (type === 'error' ? 'Validation Error' : type === 'confirm' ? 'Confirmation' : 'Notification')}
            </h3>
          </div>
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="text-slate-400 hover:text-slate-600 rounded-lg p-1 transition-colors"
              aria-label="Close dialog"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Body */}
        <div className="p-5 space-y-4">
          {message && (
            <p className="text-sm text-slate-700 leading-relaxed font-normal">
              {message}
            </p>
          )}

          {inputLabel && (
            <div className="space-y-1.5 pt-1">
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                {inputLabel}
              </label>
              <input
                type="text"
                value={inputValue || ''}
                onChange={(e) => onInputChange && onInputChange(e.target.value)}
                placeholder={inputPlaceholder || `Enter ${inputLabel}`}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 bg-white"
                autoFocus
              />
            </div>
          )}

          {children}
        </div>

        {/* Footer */}
        <div className="px-5 py-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-end space-x-2.5">
          {showCancel && onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-md shadow-sm hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-400 transition-colors"
            >
              {cancelLabel}
            </button>
          )}
          {onConfirm && (
            <button
              type="button"
              onClick={onConfirm}
              className={`px-4 py-2 text-sm font-medium text-white rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-1 transition-colors ${
                type === 'error'
                  ? 'bg-red-600 hover:bg-red-700 focus:ring-red-500'
                  : 'bg-brand-500 hover:bg-brand-600 focus:ring-brand-500'
              }`}
            >
              {confirmLabel}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
