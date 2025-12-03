import { useState } from 'react';

interface DeleteConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  itemName: string;
  itemType?: string;
}

export default function DeleteConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  itemName,
  itemType = 'item',
}: DeleteConfirmationModalProps) {
  const [confirmText, setConfirmText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  if (!isOpen) return null;

  const handleConfirm = async () => {
    if (confirmText !== 'DELETE') return;

    setIsDeleting(true);
    await onConfirm();
    setIsDeleting(false);
    setConfirmText('');
    onClose();
  };

  const handleClose = () => {
    setConfirmText('');
    onClose();
  };

  const isValid = confirmText === 'DELETE';

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 transform transition-all">
          {/* Icon */}
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-4">
            <svg
              className="h-8 w-8 text-red-600"
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
          </div>

          {/* Title */}
          <h3 className="text-xl font-bold text-gray-900 text-center mb-2">
            Delete {itemType}?
          </h3>

          {/* Description */}
          <p className="text-sm text-gray-600 text-center mb-4">
            You are about to delete <span className="font-semibold text-gray-900">"{itemName}"</span>.
            This action cannot be undone.
          </p>

          {/* Confirmation Input */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Type <span className="font-mono font-bold text-red-600">DELETE</span> to confirm:
            </label>
            <input
              type="text"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder="DELETE"
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all font-mono text-center text-lg"
              disabled={isDeleting}
              autoFocus
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={handleClose}
              disabled={isDeleting}
              className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              disabled={!isValid || isDeleting}
              className={`flex-1 px-4 py-3 rounded-lg font-medium transition-all ${
                isValid && !isDeleting
                  ? 'bg-red-600 text-white hover:bg-red-700 shadow-lg'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              {isDeleting ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Deleting...
                </span>
              ) : (
                'Delete Forever'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
