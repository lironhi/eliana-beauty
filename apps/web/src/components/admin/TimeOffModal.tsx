import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import TimeOffList from './TimeOffList';

interface TimeOffModalProps {
  isOpen: boolean;
  onClose: () => void;
  staffId: string;
  staffName: string;
  onSuccess: () => void;
}

export default function TimeOffModal({
  isOpen,
  onClose,
  staffId,
  staffName,
  onSuccess,
}: TimeOffModalProps) {
  const [type, setType] = useState<'SICK_LEAVE' | 'VACATION' | 'OTHER'>('VACATION');
  const [startsAt, setStartsAt] = useState('');
  const [endsAt, setEndsAt] = useState('');
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    if (isOpen) {
      resetForm();
      setShowForm(false);
    }
  }, [isOpen]);

  const resetForm = () => {
    setType('VACATION');
    setStartsAt('');
    setEndsAt('');
    setReason('');
    setEditingId(null);
  };

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const url = editingId
        ? `http://localhost:3001/staff/time-off/${editingId}`
        : `http://localhost:3001/staff/${staffId}/time-off`;

      const response = await fetch(url, {
        method: editingId ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        credentials: 'include',
        body: JSON.stringify({
          type,
          startsAt,
          endsAt,
          reason: reason || null,
        }),
      });

      if (!response.ok) {
        throw new Error(editingId ? 'Failed to update time off' : 'Failed to create time off');
      }

      const result = await response.json();

      if (!editingId && result.affectedAppointments > 0) {
        toast.success(
          `Time off created. ${result.affectedAppointments} appointment(s) marked for rescheduling.`
        );
      } else {
        toast.success(editingId ? 'Time off updated successfully' : 'Time off created successfully');
      }

      onSuccess();
      resetForm();
      setShowForm(false);
      setRefreshTrigger(prev => prev + 1);
    } catch (error: any) {
      console.error('Error saving time off:', error);
      toast.error(error.message || 'Failed to save time off');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (timeOff: any) => {
    setEditingId(timeOff.id);
    setType(timeOff.type);
    setStartsAt(timeOff.startsAt.split('T')[0]);
    setEndsAt(timeOff.endsAt.split('T')[0]);
    setReason(timeOff.reason || '');
    setShowForm(true);
  };

  const handleDelete = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  const handleClose = () => {
    resetForm();
    setShowForm(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Time Off Management</h2>
              <p className="text-sm text-gray-500 mt-1">For {staffName}</p>
            </div>
            <button
              onClick={handleClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
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
        </div>

        {/* Content */}
        <div className="p-6">
          {!showForm ? (
            <div className="space-y-4">
              <button
                onClick={() => setShowForm(true)}
                className="w-full px-4 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg hover:from-pink-600 hover:to-purple-700 transition-all font-medium shadow-lg hover:shadow-xl"
              >
                + Add New Time Off
              </button>
              <TimeOffList
                staffId={staffId}
                refreshTrigger={refreshTrigger}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
          {/* Type Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Type <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => setType('SICK_LEAVE')}
                className={`px-4 py-3 rounded-lg border-2 text-sm font-medium transition-all ${
                  type === 'SICK_LEAVE'
                    ? 'border-red-500 bg-red-50 text-red-700'
                    : 'border-gray-200 text-gray-700 hover:border-gray-300'
                }`}
              >
                🤒 Sick Leave
              </button>
              <button
                type="button"
                onClick={() => setType('VACATION')}
                className={`px-4 py-3 rounded-lg border-2 text-sm font-medium transition-all ${
                  type === 'VACATION'
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 text-gray-700 hover:border-gray-300'
                }`}
              >
                🏖️ Vacation
              </button>
              <button
                type="button"
                onClick={() => setType('OTHER')}
                className={`px-4 py-3 rounded-lg border-2 text-sm font-medium transition-all ${
                  type === 'OTHER'
                    ? 'border-purple-500 bg-purple-50 text-purple-700'
                    : 'border-gray-200 text-gray-700 hover:border-gray-300'
                }`}
              >
                📋 Other
              </button>
            </div>
          </div>

          {/* Start Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Start Date <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              value={startsAt}
              onChange={(e) => setStartsAt(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              required
            />
          </div>

          {/* End Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              End Date <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              value={endsAt}
              onChange={(e) => setEndsAt(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              required
            />
          </div>

          {/* Reason */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Reason (Optional)
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
              placeholder="Add any additional notes..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
            />
          </div>

          {/* Warning Box */}
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
                <p className="text-sm font-medium text-yellow-800">
                  Appointments will be affected
                </p>
                <p className="text-sm text-yellow-700 mt-1">
                  Any confirmed or pending appointments during this period will be marked
                  as "Reschedule Pending" and clients will need to be notified.
                </p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={() => {
                resetForm();
                setShowForm(false);
              }}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading}
            >
              {loading ? (editingId ? 'Updating...' : 'Creating...') : (editingId ? 'Update Time Off' : 'Create Time Off')}
            </button>
          </div>
        </form>
          )}
        </div>
      </div>
    </div>
  );
}
