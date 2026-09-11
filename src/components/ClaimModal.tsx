import React, { useState } from 'react';
import { X, ShieldAlert, CheckCircle } from 'lucide-react';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';

interface ClaimModalProps {
  itemId: number;
  itemName: string;
  isOpen: boolean;
  onClose: () => void;
  onClaimSubmitted: () => void;
}

export const ClaimModal: React.FC<ClaimModalProps> = ({
  itemId,
  itemName,
  isOpen,
  onClose,
  onClaimSubmitted,
}) => {
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const toast = useToast();

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim().length < 10) {
      toast.error('Please provide a detailed verification message (at least 10 characters).');
      return;
    }

    setSubmitting(true);
    try {
      await api.submitClaim(itemId, message.trim());
      toast.success('Your claim has been submitted to the finder for review.');
      setMessage('');
      onClaimSubmitted();
      onClose();
    } catch (err: any) {
      toast.error(err.message || 'Failed to submit claim.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      id="claim-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div
        id="claim-modal"
        className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
          <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
            <ShieldAlert className="w-5 h-5" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Claim Item: {itemName}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 text-xs text-amber-900 dark:text-amber-200 leading-relaxed">
            <span className="font-bold block mb-0.5">Proof of Ownership:</span>
            Describe unique identifying details not visible in photos (e.g., contents, serial numbers, scratches, lock screen photo, brand of case).
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Verification Message *
            </label>
            <textarea
              id="claim-message-input"
              rows={4}
              required
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="e.g. I believe this is my wallet because it has a university transit sticker inside the bill compartment and my student card..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm leading-relaxed"
            />
            <span className="text-[11px] text-slate-400 dark:text-slate-500 mt-1 block">
              Minimum 10 characters.
            </span>
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              id="submit-claim-btn"
              disabled={submitting}
              className="inline-flex items-center gap-2 px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors disabled:opacity-50 shadow-sm"
            >
              {submitting ? 'Submitting Claim...' : 'Submit Claim for Review'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
