import { useState, useEffect } from 'react';

interface IconPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectIcon: (iconPath: string) => void;
  currentIcon?: string;
}

export default function IconPickerModal({
  isOpen,
  onClose,
  onSelectIcon,
  currentIcon,
}: IconPickerModalProps) {
  const [availableIcons, setAvailableIcons] = useState<string[]>([]);
  const [selectedIcon, setSelectedIcon] = useState<string>(currentIcon || '');
  const [loading, setLoading] = useState(false);

  // Comprehensive list of potential payment icons
  // The system will check which ones actually exist
  const iconList = [
    // User's current icons
    'Bit_logo.png',
    'cash_logo.png',
    'credit-card_logo.png',
    'default_logo.png',
    'no-paid_logo.png',
    'paybox_logo.png',
    'transfer_logo.png',
    // Standard naming conventions
    'cash.png',
    'credit-card.png',
    'debit-card.png',
    'bit.png',
    'paybox.png',
    'bank-transfer.png',
    'apple-pay.png',
    'google-pay.png',
    'paypal.png',
    'stripe.png',
    'venmo.png',
    'zelle.png',
    'western-union.png',
    'money-order.png',
    'check.png',
    'cryptocurrency.png',
    'bitcoin.png',
    'ethereum.png',
    'other.png',
    'not-paid.png',
  ];

  useEffect(() => {
    // Check which icons actually exist
    const checkIcons = async () => {
      setLoading(true);

      // Check each icon to see if it exists
      const checkPromises = iconList.map(async (icon) => {
        try {
          const img = new Image();
          const promise = new Promise<boolean>((resolve) => {
            img.onload = () => resolve(true);
            img.onerror = () => resolve(false);
            // Set a timeout to avoid hanging
            setTimeout(() => resolve(false), 1000);
          });
          img.src = `/payment-icons/${icon}`;
          const exists = await promise;
          return exists ? icon : null;
        } catch {
          return null;
        }
      });

      const results = await Promise.all(checkPromises);
      const filtered = results.filter((icon): icon is string => icon !== null);
      setAvailableIcons(filtered);
      setLoading(false);
    };

    if (isOpen) {
      checkIcons();
    }
  }, [isOpen]);

  const handleSelect = () => {
    if (selectedIcon) {
      onSelectIcon(`/payment-icons/${selectedIcon}`);
      onClose();
    }
  };

  const handleClose = () => {
    setSelectedIcon(currentIcon || '');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white rounded-2xl shadow-2xl max-w-4xl w-full p-6 max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-cyan-500 rounded-xl flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Choose Payment Icon</h2>
                <p className="text-sm text-gray-600">Select an icon for your payment method</p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors"
            >
              <svg
                className="w-6 h-6 text-gray-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Icon Grid */}
          {loading ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto mb-4">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-emerald-500"></div>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Loading icons...</h3>
              <p className="text-sm text-gray-600">Checking available payment icons</p>
            </div>
          ) : availableIcons.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Icons Found</h3>
              <p className="text-gray-600 mb-4">
                Place your PNG icons in the{' '}
                <code className="bg-gray-100 px-2 py-1 rounded font-mono text-sm">
                  public/payment-icons/
                </code>{' '}
                folder
              </p>
              <p className="text-sm text-gray-500">
                Supported files: cash.png, credit-card.png, bit.png, etc.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 gap-3 mb-6">
              {availableIcons.map((icon) => {
                const isSelected = selectedIcon === icon;
                const iconName = icon.replace('.png', '').replace(/-/g, ' ');

                return (
                  <button
                    key={icon}
                    onClick={() => setSelectedIcon(icon)}
                    className={`relative group aspect-square rounded-xl border-2 transition-all duration-200 hover:scale-105 ${
                      isSelected
                        ? 'border-emerald-500 bg-emerald-50 shadow-lg'
                        : 'border-gray-200 hover:border-emerald-300 hover:shadow-md'
                    }`}
                    title={iconName}
                  >
                    {/* Selected Checkmark */}
                    {isSelected && (
                      <div className="absolute -top-2 -right-2 w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center shadow-lg z-10">
                        <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                    )}

                    {/* Icon Image */}
                    <div className="w-full h-full p-2 flex items-center justify-center">
                      <img
                        src={`/payment-icons/${icon}`}
                        alt={iconName}
                        className="max-w-full max-h-full object-contain"
                        onError={(e) => {
                          // Fallback if image fails to load
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    </div>

                    {/* Icon Name Tooltip */}
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none capitalize">
                      {iconName}
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {/* Footer Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-200">
            <p className="text-sm text-gray-600">
              {availableIcons.length} icon{availableIcons.length !== 1 ? 's' : ''} available
            </p>
            <div className="flex gap-3">
              <button
                onClick={handleClose}
                className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-all duration-200"
              >
                Cancel
              </button>
              <button
                onClick={handleSelect}
                disabled={!selectedIcon}
                className={`px-6 py-3 rounded-xl font-semibold transition-all duration-200 flex items-center gap-2 ${
                  selectedIcon
                    ? 'bg-gradient-to-r from-emerald-500 to-cyan-500 text-white hover:shadow-xl hover:scale-105'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                Select Icon
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
