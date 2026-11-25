import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

function ConfirmationModal({
  isOpen,
  title = 'Confirm Action',
  message = 'Are you sure you want to proceed?',
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'danger',
  loading = false,
  onConfirm,
  onCancel,
}) {
  if (!isOpen) return null;

  const confirmBtnClass =
    variant === 'danger'
      ? 'bg-[#B94A48] hover:bg-[#9c3b39] text-white'
      : 'bg-[#172B4D] hover:bg-[#10213A] text-white';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#10213A]/50 px-4"
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-white border border-[#E5E1D8] rounded-lg shadow-xl max-w-md w-full overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#E5E1D8] bg-[#F7F4EC]">
          <div className="flex items-center gap-2.5">
            <AlertTriangle
              className={`w-5 h-5 ${
                variant === 'danger' ? 'text-[#B94A48]' : 'text-[#C49A45]'
              }`}
            />
            <h3 className="font-serif font-bold text-base text-[#172B4D]">{title}</h3>
          </div>
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="text-[#6B7280] hover:text-[#172B4D] p-1 rounded"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5">
          <p className="text-sm text-[#374151] leading-relaxed">{message}</p>
        </div>

        <div className="px-5 py-3.5 bg-[#F7F4EC] border-t border-[#E5E1D8] flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-[#172B4D] bg-white border border-[#E5E1D8] rounded-md hover:bg-[#F1F3F5] transition"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className={`px-4 py-2 text-sm font-semibold rounded-md transition disabled:opacity-60 ${confirmBtnClass}`}
          >
            {loading ? 'Processing...' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmationModal;
