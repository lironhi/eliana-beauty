import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { toast } from 'react-hot-toast';
import LoadingSpinner from '@/components/LoadingSpinner';
import DeleteConfirmationModal from '@/components/DeleteConfirmationModal';

interface PaymentMethodConfig {
  id: string;
  value: string;
  label: string;
  emoji: string;
  enabled: boolean;
  isDefault?: boolean;
}

export default function More() {
  const [loading, setLoading] = useState(false);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethodConfig[]>([]);
  const [activeSection, setActiveSection] = useState<string>('payment-methods');
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newMethod, setNewMethod] = useState({ value: '', label: '', emoji: '💳' });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [methodToDelete, setMethodToDelete] = useState<PaymentMethodConfig | null>(null);

  // Load payment methods from database
  useEffect(() => {
    loadPaymentMethods();
  }, []);

  const loadPaymentMethods = async () => {
    try {
      setLoading(true);
      const methods = await api.getAllPaymentMethods();
      setPaymentMethods(methods);
    } catch (error) {
      console.error('Error loading payment methods:', error);
      toast.error('Failed to load payment methods');
    } finally {
      setLoading(false);
    }
  };

  const handleTogglePaymentMethod = async (id: string) => {
    const method = paymentMethods.find(m => m.id === id);
    if (!method) return;

    try {
      await api.updatePaymentMethod(id, { enabled: !method.enabled });
      setPaymentMethods(prev =>
        prev.map(m =>
          m.id === id ? { ...m, enabled: !m.enabled } : m
        )
      );
      toast.success('Payment method updated');
    } catch (error) {
      console.error('Error updating payment method:', error);
      toast.error('Failed to update payment method');
    }
  };

  const handleUpdateEmoji = async (id: string, newEmoji: string) => {
    try {
      await api.updatePaymentMethod(id, { emoji: newEmoji });
      setPaymentMethods(prev =>
        prev.map(method =>
          method.id === id ? { ...method, emoji: newEmoji } : method
        )
      );
    } catch (error) {
      console.error('Error updating emoji:', error);
      toast.error('Failed to update emoji');
    }
  };

  const handleUpdateLabel = async (id: string, newLabel: string) => {
    try {
      await api.updatePaymentMethod(id, { label: newLabel });
      setPaymentMethods(prev =>
        prev.map(method =>
          method.id === id ? { ...method, label: newLabel } : method
        )
      );
    } catch (error) {
      console.error('Error updating label:', error);
      toast.error('Failed to update label');
    }
  };

  const handleUpdateValue = async (id: string, newValue: string) => {
    const formattedValue = newValue.toUpperCase().replace(/\s+/g, '_');
    try {
      await api.updatePaymentMethod(id, { value: formattedValue });
      setPaymentMethods(prev =>
        prev.map(method =>
          method.id === id ? { ...method, value: formattedValue } : method
        )
      );
    } catch (error) {
      console.error('Error updating value:', error);
      toast.error('Failed to update value');
    }
  };

  const handleAddMethod = async () => {
    if (!newMethod.label.trim() || !newMethod.value.trim()) {
      toast.error('Please fill in all fields');
      return;
    }

    const value = newMethod.value.toUpperCase().replace(/\s+/g, '_');

    if (paymentMethods.some(m => m.value === value)) {
      toast.error('A payment method with this value already exists');
      return;
    }

    try {
      const created = await api.createPaymentMethod({
        value,
        label: newMethod.label,
        emoji: newMethod.emoji,
        enabled: true,
      });

      setPaymentMethods(prev => [...prev, created]);
      setNewMethod({ value: '', label: '', emoji: '💳' });
      setIsAddingNew(false);
      toast.success('Payment method added');
    } catch (error: any) {
      console.error('Error creating payment method:', error);
      toast.error(error.message || 'Failed to create payment method');
    }
  };

  const handleDeleteMethod = (method: PaymentMethodConfig) => {
    if (method.isDefault) {
      toast.error('Cannot delete default payment methods');
      return;
    }

    setMethodToDelete(method);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!methodToDelete) return;

    try {
      await api.deletePaymentMethod(methodToDelete.id);
      setPaymentMethods(prev => prev.filter(m => m.id !== methodToDelete.id));
      toast.success('Payment method deleted successfully');
    } catch (error) {
      console.error('Error deleting payment method:', error);
      toast.error('Failed to delete payment method');
    }
  };

  const handleCancelAdd = () => {
    setIsAddingNew(false);
    setNewMethod({ value: '', label: '', emoji: '💳' });
  };

  const sections = [
    {
      id: 'payment-methods',
      name: 'Payment Methods',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
        </svg>
      ),
      color: 'from-green-500 to-emerald-500',
    },
    {
      id: 'settings',
      name: 'General Settings',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
      color: 'from-blue-500 to-indigo-500',
    },
    {
      id: 'notifications',
      name: 'Notifications',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
      ),
      color: 'from-purple-500 to-pink-500',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="card-glass p-6 lg:p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-primary-200/30 to-pink-200/30 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>

        <div className="relative flex items-center gap-4">
          <div className="w-14 h-14 bg-gradient-to-br from-primary-500 to-pink-500 rounded-2xl flex items-center justify-center text-white shadow-xl">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">
              More <span className="text-gradient">Settings</span>
            </h1>
            <p className="text-sm text-gray-600 mt-1">Manage additional configurations and options</p>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="card-glass p-2">
        <div className="flex flex-wrap gap-2">
          {sections.map((section) => (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-all duration-200 ${
                activeSection === section.id
                  ? `bg-gradient-to-r ${section.color} text-white shadow-lg`
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <div className={activeSection === section.id ? 'text-white' : 'text-gray-400'}>
                {section.icon}
              </div>
              <span>{section.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Payment Methods Section */}
      {activeSection === 'payment-methods' && (
        <div className="space-y-6">
          {/* Header Card */}
          <div className="relative overflow-hidden bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500 rounded-3xl p-8 shadow-2xl">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

            <div className="relative z-10 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-lg">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-white mb-1">
                    Payment Methods
                  </h2>
                  <p className="text-white/90 text-sm">
                    Manage and customize your payment options
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsAddingNew(true)}
                disabled={loading}
                className="flex items-center gap-2 px-6 py-3 bg-white text-emerald-600 rounded-xl font-semibold hover:shadow-xl hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <span>Add New Method</span>
              </button>
            </div>
          </div>

          {/* Payment Methods Grid */}
          <div className="card-premium p-6 lg:p-8">

            {/* Add New Form */}
            {isAddingNew && (
              <div className="mb-6 p-6 rounded-2xl border-2 border-emerald-300 bg-gradient-to-br from-emerald-50 to-cyan-50 shadow-lg animate-slideDown">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900">Add New Payment Method</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  {/* Emoji Input */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Emoji Icon</label>
                    <div className="w-full h-16 bg-white rounded-xl flex items-center justify-center text-3xl border-2 border-emerald-200 hover:border-emerald-400 transition-colors">
                      <input
                        type="text"
                        value={newMethod.emoji}
                        onChange={(e) => setNewMethod({ ...newMethod, emoji: e.target.value })}
                        className="w-full h-full text-center bg-transparent outline-none"
                        maxLength={2}
                        placeholder="💳"
                      />
                    </div>
                  </div>

                  {/* Label Input */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Display Name</label>
                    <input
                      type="text"
                      value={newMethod.label}
                      onChange={(e) => setNewMethod({ ...newMethod, label: e.target.value })}
                      className="w-full h-16 text-base font-semibold text-gray-900 bg-white border-2 border-emerald-200 rounded-xl px-4 outline-none focus:border-emerald-500 transition-colors"
                      placeholder="e.g., Apple Pay"
                    />
                  </div>

                  {/* Value Input */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Code (Uppercase)</label>
                    <input
                      type="text"
                      value={newMethod.value}
                      onChange={(e) => setNewMethod({ ...newMethod, value: e.target.value.toUpperCase() })}
                      className="w-full h-16 text-sm text-gray-700 bg-white border-2 border-emerald-200 rounded-xl px-4 outline-none focus:border-emerald-500 transition-colors font-mono uppercase"
                      placeholder="APPLE_PAY"
                    />
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3 justify-end">
                  <button
                    onClick={handleCancelAdd}
                    className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-all duration-200"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAddMethod}
                    className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white rounded-xl font-semibold hover:shadow-xl hover:scale-105 transition-all duration-200 flex items-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Save Method
                  </button>
                </div>
              </div>
            )}

            <div className="space-y-3">

              {/* Existing Methods */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {paymentMethods.map((method, index) => (
                  <div
                    key={method.id}
                    className={`relative overflow-hidden rounded-2xl border-2 transition-all duration-300 group ${
                      method.enabled
                        ? 'bg-gradient-to-br from-white to-gray-50 border-gray-200 hover:border-emerald-400 hover:shadow-xl hover:scale-[1.02]'
                        : 'bg-gray-100 border-gray-300 opacity-60'
                    }`}
                    style={{
                      animationDelay: `${index * 50}ms`,
                      animation: 'fadeInUp 0.5s ease-out forwards'
                    }}
                  >
                    {/* Gradient Overlay */}
                    {method.enabled && (
                      <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    )}

                    <div className="relative p-5">
                      {/* Top Section */}
                      <div className="flex items-start justify-between mb-4">
                        {/* Emoji & Info */}
                        <div className="flex items-center gap-4 flex-1">
                          {/* Emoji Input */}
                          <div className={`relative w-16 h-16 rounded-2xl flex items-center justify-center text-3xl flex-shrink-0 shadow-lg ${
                            method.enabled
                              ? 'bg-gradient-to-br from-emerald-100 to-cyan-100 group-hover:scale-110'
                              : 'bg-gray-200'
                          } transition-all duration-300`}>
                            <input
                              type="text"
                              value={method.emoji}
                              onChange={(e) => handleUpdateEmoji(method.id, e.target.value)}
                              className="w-full h-full text-center bg-transparent outline-none cursor-pointer"
                              maxLength={2}
                              disabled={!method.enabled}
                              title="Click to change emoji"
                            />
                          </div>

                          {/* Label & Value */}
                          <div className="flex-1 min-w-0">
                            <input
                              type="text"
                              value={method.label}
                              onChange={(e) => handleUpdateLabel(method.id, e.target.value)}
                              className="text-lg font-bold text-gray-900 bg-transparent border-b-2 border-transparent hover:border-emerald-300 focus:border-emerald-500 outline-none transition-colors w-full mb-1"
                              disabled={!method.enabled}
                              placeholder="Method Name"
                            />
                            <div className="flex items-center gap-2">
                              <input
                                type="text"
                                value={method.value}
                                onChange={(e) => handleUpdateValue(method.id, e.target.value)}
                                className={`text-xs text-gray-600 font-mono bg-gray-100 px-2 py-1 rounded border border-transparent hover:border-emerald-300 focus:border-emerald-500 outline-none transition-colors ${method.isDefault ? 'cursor-not-allowed opacity-50' : ''}`}
                                disabled={method.isDefault || !method.enabled}
                                title={method.isDefault ? 'Default methods cannot be renamed' : 'Click to edit identifier'}
                                placeholder="PAYMENT_CODE"
                              />
                              {method.isDefault && (
                                <span className="inline-flex items-center gap-1 px-2 py-1 bg-emerald-100 text-emerald-700 text-xs font-semibold rounded-full">
                                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                  </svg>
                                  Default
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Toggle Switch */}
                        <button
                          onClick={() => handleTogglePaymentMethod(method.id)}
                          className={`relative inline-flex h-7 w-14 items-center rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 ${
                            method.enabled
                              ? 'bg-gradient-to-r from-emerald-500 to-cyan-500 shadow-lg shadow-emerald-500/50'
                              : 'bg-gray-300'
                          }`}
                        >
                          <span
                            className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition-transform duration-300 ${
                              method.enabled ? 'translate-x-8' : 'translate-x-1'
                            }`}
                          />
                        </button>
                      </div>

                      {/* Bottom Section - Actions */}
                      <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                        <div className="text-xs text-gray-500 flex items-center gap-2">
                          {method.enabled ? (
                            <>
                              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                              <span className="font-medium text-emerald-600">Active</span>
                            </>
                          ) : (
                            <>
                              <div className="w-2 h-2 bg-gray-400 rounded-full" />
                              <span>Disabled</span>
                            </>
                          )}
                        </div>

                        {/* Delete Button (only for non-default) */}
                        {!method.isDefault && (
                          <button
                            onClick={() => handleDeleteMethod(method)}
                            className="flex items-center gap-2 px-4 py-2 text-red-600 bg-red-50 hover:bg-red-100 rounded-xl transition-all duration-200 font-medium text-sm border border-red-200 hover:border-red-300 hover:shadow-md"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                            <span>Delete</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Tips Section */}
            <div className="mt-8 relative overflow-hidden rounded-2xl border-2 border-emerald-200 bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 p-6 shadow-lg">
              {/* Decorative Elements */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-400/10 rounded-full blur-3xl" />
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-cyan-400/10 rounded-full blur-2xl" />

              <div className="relative z-10">
                {/* Header */}
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">Quick Guide</h3>
                </div>

                {/* Tips Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="flex items-start gap-3 p-3 bg-white/60 backdrop-blur-sm rounded-xl border border-emerald-200/50">
                    <div className="w-6 h-6 bg-emerald-500 rounded-lg flex items-center justify-center flex-shrink-0">
                      <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900 mb-0.5">Create Custom Methods</p>
                      <p className="text-xs text-gray-600">Click "Add New Method" to create custom payment types</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 bg-white/60 backdrop-blur-sm rounded-xl border border-emerald-200/50">
                    <div className="w-6 h-6 bg-emerald-500 rounded-lg flex items-center justify-center flex-shrink-0">
                      <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900 mb-0.5">Edit Emojis & Labels</p>
                      <p className="text-xs text-gray-600">Click directly on emojis and labels to modify them</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 bg-white/60 backdrop-blur-sm rounded-xl border border-emerald-200/50">
                    <div className="w-6 h-6 bg-emerald-500 rounded-lg flex items-center justify-center flex-shrink-0">
                      <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900 mb-0.5">Enable/Disable Methods</p>
                      <p className="text-xs text-gray-600">Use the toggle switch to control method availability</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 bg-white/60 backdrop-blur-sm rounded-xl border border-emerald-200/50">
                    <div className="w-6 h-6 bg-emerald-500 rounded-lg flex items-center justify-center flex-shrink-0">
                      <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900 mb-0.5">Default Protection</p>
                      <p className="text-xs text-gray-600">Default methods can be disabled but not deleted</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 bg-white/60 backdrop-blur-sm rounded-xl border border-emerald-200/50">
                    <div className="w-6 h-6 bg-red-500 rounded-lg flex items-center justify-center flex-shrink-0">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900 mb-0.5">Delete Custom Methods</p>
                      <p className="text-xs text-gray-600">Type "DELETE" to confirm removal of custom methods</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 bg-white/60 backdrop-blur-sm rounded-xl border border-emerald-200/50">
                    <div className="w-6 h-6 bg-purple-500 rounded-lg flex items-center justify-center flex-shrink-0">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900 mb-0.5">Real-time Sync</p>
                      <p className="text-xs text-gray-600">All changes are saved automatically to the database</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* General Settings Section (Placeholder) */}
      {activeSection === 'settings' && (
        <div className="card-premium p-6 lg:p-8">
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">General Settings</h3>
            <p className="text-gray-600">This section is coming soon</p>
          </div>
        </div>
      )}

      {/* Notifications Section (Placeholder) */}
      {activeSection === 'notifications' && (
        <div className="card-premium p-6 lg:p-8">
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-pink-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Notification Settings</h3>
            <p className="text-gray-600">This section is coming soon</p>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setMethodToDelete(null);
        }}
        onConfirm={confirmDelete}
        itemName={methodToDelete?.label || ''}
        itemType="Payment Method"
      />
    </div>
  );
}
