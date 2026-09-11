import React from 'react';
import { CheckCircle2, AlertTriangle } from 'lucide-react';

interface ReturnConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  loading: boolean;
  itemName: string;
}

export const ReturnConfirmModal: React.FC<ReturnConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  loading,
  itemName,
}) => {
  if (!isOpen) return null;

  return (
    <div
      id="return-confirm-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150"
    >
      <div
        id="return-confirm-modal"
        className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6"
      >
        <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-4">
          <CheckCircle2 className="w-6 h-6" />
        </div>

        <h3 className="text-lg font-bold text-slate-900 dark:text-white">
          Mark as Returned?
        </h3>
        <p className="mt-2 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
          Are you sure you want to mark <span className="font-semibold text-slate-900 dark:text-white">"{itemName}"</span> as returned to its owner? This updates the public status and closes the report.
        </p>

        <div className="flex items-center justify-end gap-2.5 mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            id="confirm-return-btn"
            onClick={onConfirm}
            disabled={loading}
            className="px-5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-colors shadow-sm disabled:opacity-50"
          >
            {loading ? 'Updating...' : 'Yes, Mark Returned'}
          </button>
        </div>
      </div>
    </div>
  );
};
