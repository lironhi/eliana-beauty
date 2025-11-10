import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { api } from '@/lib/api';

interface TimeOff {
  id: string;
  type: 'SICK_LEAVE' | 'VACATION' | 'OTHER';
  startsAt: string;
  endsAt: string;
  reason?: string;
  createdAt: string;
}

interface TimeOffListProps {
  staffId: string;
  refreshTrigger?: number;
  onEdit?: (timeOff: TimeOff) => void;
  onDelete?: () => void;
}

export default function TimeOffList({ staffId, refreshTrigger, onEdit, onDelete }: TimeOffListProps) {
  const [timeOffs, setTimeOffs] = useState<TimeOff[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTimeOffs();
  }, [staffId, refreshTrigger]);

  const loadTimeOffs = async () => {
    try {
      const data = await api.getStaffTimeOffs(staffId);
      setTimeOffs(data);
    } catch (error: any) {
      console.error('Error loading time offs:', error);
      toast.error(error.message || 'Failed to load time offs');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = async (id: string) => {
    if (!confirm('Are you sure you want to delete this time off?')) {
      return;
    }

    try {
      await api.deleteTimeOff(id);
      toast.success('Time off deleted successfully');
      loadTimeOffs();
      if (onDelete) {
        onDelete();
      }
    } catch (error: any) {
      console.error('Error deleting time off:', error);
      toast.error(error.message || 'Failed to delete time off');
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'SICK_LEAVE':
        return '🤒';
      case 'VACATION':
        return '🏖️';
      default:
        return '📋';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'SICK_LEAVE':
        return 'Sick Leave';
      case 'VACATION':
        return 'Vacation';
      default:
        return 'Other';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'SICK_LEAVE':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'VACATION':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-purple-100 text-purple-800 border-purple-200';
    }
  };

  const isPast = (endsAt: string) => {
    return new Date(endsAt) < new Date();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (timeOffs.length === 0) {
    return (
      <div className="text-center py-12">
        <svg
          className="w-16 h-16 text-gray-400 mx-auto mb-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
        <p className="text-gray-500 text-lg font-medium">No time offs scheduled</p>
        <p className="text-gray-400 text-sm mt-2">
          Click "Add Time Off" to schedule sick leave or vacation
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {timeOffs.map((timeOff) => (
        <div
          key={timeOff.id}
          className={`border rounded-lg p-4 transition-all ${
            isPast(timeOff.endsAt) ? 'bg-gray-50 opacity-60' : 'bg-white hover:shadow-md'
          }`}
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl">{getTypeIcon(timeOff.type)}</span>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold border ${getTypeColor(
                    timeOff.type
                  )}`}
                >
                  {getTypeLabel(timeOff.type)}
                </span>
                {isPast(timeOff.endsAt) && (
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-gray-200 text-gray-600">
                    Past
                  </span>
                )}
              </div>

              <div className="space-y-1 text-sm">
                <div className="flex items-center gap-2 text-gray-600">
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  <span>
                    <strong>From:</strong>{' '}
                    {format(new Date(timeOff.startsAt), 'MMM dd, yyyy')}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  <span>
                    <strong>To:</strong> {format(new Date(timeOff.endsAt), 'MMM dd, yyyy')}
                  </span>
                </div>
              </div>

              {timeOff.reason && (
                <div className="mt-2 text-sm text-gray-600 bg-gray-50 p-2 rounded">
                  <strong>Reason:</strong> {timeOff.reason}
                </div>
              )}
            </div>

            <div className="ml-4 flex gap-2">
              {onEdit && !isPast(timeOff.endsAt) && (
                <button
                  onClick={() => onEdit(timeOff)}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  title="Edit time off"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                    />
                  </svg>
                </button>
              )}
              <button
                onClick={() => handleDeleteClick(timeOff.id)}
                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                title="Delete time off"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
