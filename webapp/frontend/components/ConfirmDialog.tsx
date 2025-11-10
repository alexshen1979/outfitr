'use client';

import { useI18n } from '@/lib/i18n';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  type?: 'danger' | 'warning' | 'info';
}

export default function ConfirmDialog({
  isOpen,
  title,
  message,
  confirmText,
  cancelText,
  onConfirm,
  onCancel,
  type = 'danger',
}: ConfirmDialogProps) {
  const { t } = useI18n();

  if (!isOpen) return null;

  const confirmButtonClass = type === 'danger'
    ? 'border border-gray-900 bg-gray-900 text-white hover:bg-white hover:text-gray-900'
    : 'border border-gray-300 bg-white text-gray-900 hover:border-gray-900';

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onCancel}
    >
      <div 
        className="w-full max-w-md border border-gray-200 bg-white"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-8 py-6">
          <h2 className="mb-4 text-lg font-light tracking-wide text-gray-900">
            {title}
          </h2>
          <p className="mb-8 text-sm font-light leading-relaxed text-gray-600">
            {message}
          </p>
          
          <div className="flex items-center justify-end gap-4">
            <button
              onClick={onCancel}
              className="border border-gray-300 bg-white px-6 py-2 text-xs font-light uppercase tracking-widest text-gray-900 transition-all hover:border-gray-900"
            >
              {cancelText || t('common.cancel')}
            </button>
            <button
              onClick={onConfirm}
              className={`px-6 py-2 text-xs font-light uppercase tracking-widest transition-all ${confirmButtonClass}`}
            >
              {confirmText || t('common.confirm')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

