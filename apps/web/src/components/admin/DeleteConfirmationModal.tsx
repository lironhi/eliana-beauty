import { useState } from 'react';

interface DeleteConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  title: string;
  itemName: string;
  itemType: string;
  warningMessage?: string;
}

export default function DeleteConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  itemName,
  itemType,
  warningMessage,
}: DeleteConfirmationModalProps) {
  const [confirmText, setConfirmText] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleConfirm = async () => {
    if (confirmText !== 'DELETE') {
      return;
    }

    setLoading(true);
    try {
      await onConfirm();
      handleClose();
    } catch (error) {
      console.error('Delete failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setConfirmText('');
    setLoading(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
      <div className="card-premium max-w-md w-full animate-scaleIn shadow-2xl">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-red-50 to-orange-50">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">{title}</h2>
              <p className="text-sm text-gray-600 mt-1">This action cannot be undone</p>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex gap-3">
              <svg
                className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
              <div>
                <p className="text-sm font-medium text-yellow-800">Warning</p>
                <p className="text-sm text-yellow-700 mt-1">
                  {warningMessage ||
                    `You are about to permanently delete this ${itemType}. This action cannot be undone.`}
                </p>
              </div>
            </div>
          </div>

          <div>
            <p className="text-sm text-gray-700 mb-2">
              You are about to delete:{' '}
              <span className="font-semibold text-gray-900">{itemName}</span>
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Type <span className="font-bold text-red-600">DELETE</span> to confirm
            </label>
            <input
              type="text"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder="DELETE"
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:outline-none transition-all ${
                confirmText === 'DELETE'
                  ? 'border-green-300 focus:ring-green-500 focus:border-green-500 bg-green-50'
                  : confirmText.length > 0
                  ? 'border-red-300 focus:ring-red-500 focus:border-red-500 bg-red-50'
                  : 'border-gray-300 focus:ring-gray-500 focus:border-gray-500'
              }`}
              autoFocus
            />
            {confirmText.length > 0 && confirmText !== 'DELETE' && (
              <p className="text-xs text-red-600 mt-1">
                Please type exactly "DELETE" (in uppercase)
              </p>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 flex flex-col sm:flex-row justify-end gap-3 bg-gray-50">
          <button
            onClick={handleClose}
            className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={confirmText !== 'DELETE' || loading}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
          >
            {loading ? 'Deleting...' : `Delete ${itemType}`}
          </button>
        </div>
      </div>
    </div>
  );
}
