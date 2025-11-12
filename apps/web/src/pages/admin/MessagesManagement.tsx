import { useState, useEffect } from 'react';
import { useI18n } from '@/i18n';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import LoadingSpinner from '@/components/LoadingSpinner';

export default function MessagesManagement() {
  const { t } = useI18n();
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMessage, setSelectedMessage] = useState<any | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editSubject, setEditSubject] = useState('');
  const [editContent, setEditContent] = useState('');
  const [filter, setFilter] = useState<'all' | 'direct' | 'broadcast'>('all');

  useEffect(() => {
    loadMessages();
  }, []);

  const loadMessages = async () => {
    try {
      setLoading(true);
      const data = await api.getInbox();
      // Combine direct and broadcast messages
      const allMessages = [
        ...data.direct.map((m: any) => ({ ...m, messageType: 'DIRECT' })),
        ...data.broadcasts.map((m: any) => ({ ...m, messageType: 'BROADCAST' })),
      ].sort((a, b) => new Date(b.sentAt).getTime() - new Date(a.sentAt).getTime());
      setMessages(allMessages);
    } catch (error) {
      console.error('Failed to load messages:', error);
      toast.error('Failed to load messages');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (messageId: string) => {
    if (!confirm('Are you sure you want to delete this message?')) return;

    try {
      await api.deleteMessage(messageId);
      toast.success('Message deleted successfully');
      loadMessages();
    } catch (error: any) {
      console.error('Failed to delete message:', error);
      toast.error(error.message || 'Failed to delete message');
    }
  };

  const openEditModal = (message: any) => {
    setSelectedMessage(message);
    setEditSubject(message.subject || '');
    setEditContent(message.content || '');
    setShowEditModal(true);
  };

  const handleEdit = async () => {
    if (!selectedMessage || !editContent.trim()) return;

    try {
      // Note: You'll need to add this endpoint to the API
      await api.updateMessage(selectedMessage.id, {
        subject: editSubject,
        content: editContent,
      });
      toast.success('Message updated successfully');
      setShowEditModal(false);
      loadMessages();
    } catch (error: any) {
      console.error('Failed to update message:', error);
      toast.error(error.message || 'Failed to update message');
    }
  };

  const filteredMessages = messages.filter((msg) => {
    if (filter === 'all') return true;
    if (filter === 'direct') return msg.messageType === 'DIRECT';
    if (filter === 'broadcast') return msg.messageType === 'BROADCAST';
    return true;
  });

  if (loading) return <LoadingSpinner />;

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center shadow-lg">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Messages Management
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              {filteredMessages.length} messages
            </p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6 flex gap-2">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-xl font-medium text-sm transition-all duration-300 ${
            filter === 'all'
              ? 'bg-gradient-to-r from-purple-500 to-pink-600 text-white shadow-lg'
              : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
          }`}
        >
          All Messages
        </button>
        <button
          onClick={() => setFilter('direct')}
          className={`px-4 py-2 rounded-xl font-medium text-sm transition-all duration-300 ${
            filter === 'direct'
              ? 'bg-gradient-to-r from-purple-500 to-pink-600 text-white shadow-lg'
              : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
          }`}
        >
          Direct Messages
        </button>
        <button
          onClick={() => setFilter('broadcast')}
          className={`px-4 py-2 rounded-xl font-medium text-sm transition-all duration-300 ${
            filter === 'broadcast'
              ? 'bg-gradient-to-r from-purple-500 to-pink-600 text-white shadow-lg'
              : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
          }`}
        >
          Broadcasts
        </button>
      </div>

      {/* Messages List */}
      {filteredMessages.length === 0 ? (
        <div className="bg-white rounded-3xl shadow-lg border border-gray-200 p-12 text-center">
          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center">
            <svg className="w-10 h-10 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">No messages found</h3>
          <p className="text-gray-500">There are no messages to display</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredMessages.map((message) => (
            <div
              key={message.id}
              className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-300"
            >
              <div className="p-6">
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          message.messageType === 'DIRECT'
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-purple-100 text-purple-700'
                        }`}
                      >
                        {message.messageType}
                      </span>
                      {message.readAt && (
                        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">
                          Read
                        </span>
                      )}
                    </div>

                    {message.subject && (
                      <h3 className="text-lg font-bold text-gray-900 mb-2">{message.subject}</h3>
                    )}

                    <p className="text-gray-700 mb-3">{message.content}</p>

                    <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        <span>
                          From: <strong>{message.sender?.name || 'Unknown'}</strong>
                        </span>
                      </div>

                      {message.messageType === 'DIRECT' && message.recipient && (
                        <div className="flex items-center gap-2">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
                          </svg>
                          <span>
                            To: <strong>{message.recipient?.name || 'Unknown'}</strong>
                          </span>
                        </div>
                      )}

                      <div className="flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>{format(new Date(message.sentAt), 'MMM dd, yyyy HH:mm')}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => openEditModal(message)}
                      className="p-2 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 transition-colors"
                      title="Edit message"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleDelete(message.id)}
                      className="p-2 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-colors"
                      title="Delete message"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Edit Message
                </h2>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
                >
                  <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Subject (optional)
                  </label>
                  <input
                    type="text"
                    value={editSubject}
                    onChange={(e) => setEditSubject(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                    placeholder="Message subject..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Content *
                  </label>
                  <textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    rows={6}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                    placeholder="Message content..."
                  />
                </div>

                <div className="flex gap-3 justify-end pt-4">
                  <button
                    onClick={() => setShowEditModal(false)}
                    className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleEdit}
                    disabled={!editContent.trim()}
                    className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-xl hover:from-purple-600 hover:to-pink-700 transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
