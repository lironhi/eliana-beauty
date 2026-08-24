import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { api } from '@/lib/api';
import DeleteConfirmationModal from './DeleteConfirmationModal';

interface HourBlock {
  id: string;
  date: string;
  startHhmm: string;
  endHhmm: string;
  reason: string | null;
  createdAt: string;
}

interface HourBlockListProps {
  staffId: string;
  refreshTrigger?: number;
  onEdit?: (hourBlock: HourBlock) => void;
  onDelete?: () => void;
}

export default function HourBlockList({
  staffId,
  refreshTrigger,
  onEdit,
  onDelete,
}: HourBlockListProps) {
  const [hourBlocks, setHourBlocks] = useState<HourBlock[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [blockToDelete, setBlockToDelete] = useState<HourBlock | null>(null);

  useEffect(() => {
    loadHourBlocks();
  }, [staffId, refreshTrigger]);

  const loadHourBlocks = async () => {
    try {
      setLoading(true);
      const data = await api.getHourBlocks(staffId);
      setHourBlocks(data);
    } catch (error: any) {
      console.error('Failed to load hour blocks:', error);
      toast.error('Failed to load hour blocks');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (block: HourBlock) => {
    setBlockToDelete(block);
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!blockToDelete) return;

    try {
      await api.deleteHourBlock(blockToDelete.id);
      toast.success('Hour block deleted successfully');
      setDeleteModalOpen(false);
      setBlockToDelete(null);
      loadHourBlocks();
      if (onDelete) onDelete();
    } catch (error: any) {
      console.error('Failed to delete hour block:', error);
      toast.error(error.message || 'Failed to delete hour block');
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-pink-600"></div>
      </div>
    );
  }

  if (hourBlocks.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-pink-100 to-purple-100 flex items-center justify-center">
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
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <p className="text-gray-500 text-sm">No blocked hours yet</p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-3">
        {hourBlocks.map((block) => {
          const blockDate = new Date(block.date);
          const isPast = blockDate < new Date(new Date().setHours(0, 0, 0, 0));
          const isToday = blockDate.toDateString() === new Date().toDateString();

          return (
            <div
              key={block.id}
              className={`border-2 rounded-xl p-5 transition-all duration-200 hover:shadow-lg ${
                isPast
                  ? 'bg-gray-50 border-gray-200 opacity-60'
                  : isToday
                    ? 'bg-gradient-to-r from-blue-50 to-cyan-50 border-blue-300'
                    : 'bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200'
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  {/* Date Badge */}
                  <div className="flex items-center gap-2 mb-3">
                    <div
                      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border-2 text-sm font-bold ${
                        isPast
                          ? 'bg-gray-100 border-gray-300 text-gray-600'
                          : isToday
                            ? 'bg-blue-100 border-blue-400 text-blue-700'
                            : 'bg-purple-100 border-purple-300 text-purple-700'
                      }`}
                    >
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
                      {formatDate(block.date)}
                    </div>
                    {isToday && (
                      <span className="px-2 py-1 bg-blue-600 text-white text-xs font-bold rounded-md">
                        TODAY
                      </span>
                    )}
                    {isPast && (
                      <span className="px-2 py-1 bg-gray-400 text-white text-xs font-bold rounded-md">
                        PAST
                      </span>
                    )}
                  </div>

                  {/* Time Range */}
                  <div className="flex items-center gap-3 mb-3">
                    <div className="flex items-center gap-2 bg-white rounded-lg px-3 py-2 border border-gray-200 shadow-sm">
                      <svg
                        className="w-4 h-4 text-green-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      <span className="font-bold text-gray-900">{block.startHhmm}</span>
                    </div>
                    <svg
                      className="w-5 h-5 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 7l5 5m0 0l-5 5m5-5H6"
                      />
                    </svg>
                    <div className="flex items-center gap-2 bg-white rounded-lg px-3 py-2 border border-gray-200 shadow-sm">
                      <svg
                        className="w-4 h-4 text-red-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      <span className="font-bold text-gray-900">{block.endHhmm}</span>
                    </div>
                  </div>

                  {/* Reason */}
                  {block.reason && (
                    <div className="bg-white rounded-lg p-3 border border-gray-200 shadow-sm">
                      <div className="flex items-start gap-2">
                        <svg
                          className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        <div>
                          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                            Reason
                          </p>
                          <p className="text-sm text-gray-700">{block.reason}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  {onEdit && (
                    <button
                      onClick={() => onEdit(block)}
                      className="p-2.5 text-blue-600 hover:bg-blue-100 rounded-xl transition-all shadow-sm hover:shadow-md border border-transparent hover:border-blue-200"
                      title="Edit hour block"
                    >
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
                          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                        />
                      </svg>
                    </button>
                  )}
                  <button
                    onClick={() => handleDeleteClick(block)}
                    className="p-2.5 text-red-600 hover:bg-red-100 rounded-xl transition-all shadow-sm hover:shadow-md border border-transparent hover:border-red-200"
                    title="Delete hour block"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
          );
        })}
      </div>

      {blockToDelete && (
        <DeleteConfirmationModal
          isOpen={deleteModalOpen}
          onClose={() => {
            setDeleteModalOpen(false);
            setBlockToDelete(null);
          }}
          onConfirm={handleDeleteConfirm}
          title="Delete Hour Block"
          itemName={`${formatDate(blockToDelete.date)} (${blockToDelete.startHhmm} - ${blockToDelete.endHhmm})`}
          itemType="hour block"
          warningMessage="This hour block will be permanently deleted. This action cannot be undone."
        />
      )}
    </>
  );
}
