import { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import { api } from '@/lib/api';
import { useI18n } from '@/i18n';
import { useUnreadMessages } from '@/hooks/useUnreadMessages';
import { format } from 'date-fns';

export default function Messages() {
  const { t } = useI18n();
  const user = useAuthStore((state) => state.user);
  const [inbox, setInbox] = useState<{ direct: any[]; broadcasts: any[] }>({ direct: [], broadcasts: [] });
  const [selectedConversation, setSelectedConversation] = useState<any | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [showBroadcastModal, setShowBroadcastModal] = useState(false);
  const [showClientListModal, setShowClientListModal] = useState(false);
  const [broadcastSubject, setBroadcastSubject] = useState('');
  const [broadcastContent, setBroadcastContent] = useState('');
  const [allClients, setAllClients] = useState<any[]>([]);
  const [loadingClients, setLoadingClients] = useState(false);
  const { refreshUnreadCount } = useUnreadMessages();

  const isAdmin = user?.role === 'ADMIN' || user?.role === 'STAFF';

  useEffect(() => {
    loadInbox();
    if (isAdmin) {
      loadAllClients();
    }
  }, [isAdmin]);

  const loadInbox = async () => {
    try {
      const data = await api.getInbox();
      setInbox(data);
    } catch (error) {
      console.error('Failed to load inbox:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadAllClients = async () => {
    try {
      setLoadingClients(true);
      const response = await api.getAllClients(1, 1000);
      setAllClients(response.data);
    } catch (error) {
      console.error('Failed to load clients:', error);
    } finally {
      setLoadingClients(false);
    }
  };

  const loadConversation = async (otherUser: any) => {
    try {
      setSelectedConversation(otherUser);
      const data = await api.getConversation(otherUser.id);
      setMessages(data);

      // Mark unread messages as read
      const unreadMessages = data.filter((msg: any) =>
        msg.recipientId === user?.id && !msg.readAt
      );
      for (const msg of unreadMessages) {
        await api.markMessageAsRead(msg.id);
      }

      // Reload inbox to update unread counts
      loadInbox();
      // Refresh unread count in navigation
      if (unreadMessages.length > 0) {
        refreshUnreadCount();
      }
    } catch (error) {
      console.error('Failed to load conversation:', error);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation || !isAdmin) return;

    try {
      await api.sendDirectMessage({
        content: newMessage,
        recipientId: selectedConversation.id,
      });

      setNewMessage('');
      loadConversation(selectedConversation);
    } catch (error) {
      console.error('Failed to send message:', error);
      alert(t('messages.messageSentError'));
    }
  };

  const sendBroadcast = async () => {
    if (!broadcastContent.trim() || !isAdmin) return;

    try {
      await api.sendBroadcastMessage({
        subject: broadcastSubject || undefined,
        content: broadcastContent,
      });

      setBroadcastSubject('');
      setBroadcastContent('');
      setShowBroadcastModal(false);
      loadInbox();
      alert(t('messages.broadcastSentSuccess'));
    } catch (error) {
      console.error('Failed to send broadcast:', error);
      alert(t('messages.broadcastSentError'));
    }
  };

  const startConversationWithClient = (client: any) => {
    loadConversation(client);
    setShowClientListModal(false);
  };

  // Get unique conversations
  const getConversations = () => {
    const conversations = new Map();

    inbox.direct.forEach((msg: any) => {
      const otherUser = msg.senderId === user?.id ? msg.recipient : msg.sender;
      if (!otherUser) return;

      if (!conversations.has(otherUser.id)) {
        conversations.set(otherUser.id, {
          user: otherUser,
          lastMessage: msg,
          unreadCount: 0,
        });
      }

      // Count unread messages
      if (msg.recipientId === user?.id && !msg.readAt) {
        const conv = conversations.get(otherUser.id);
        conv.unreadCount++;
      }
    });

    return Array.from(conversations.values()).sort(
      (a, b) => new Date(b.lastMessage.sentAt).getTime() - new Date(a.lastMessage.sentAt).getTime()
    );
  };

  const conversations = getConversations();

  if (loading) {
    return <div className="p-6">{t('messages.loading')}</div>;
  }

  // Mark message as read when clicked
  const handleMessageClick = async (messageId: string, isRead: boolean) => {
    if (!isRead) {
      try {
        await api.markMessageAsRead(messageId);
        // Reload inbox to update unread status
        loadInbox();
        // Refresh unread count in navigation
        refreshUnreadCount();
      } catch (error) {
        console.error('Failed to mark message as read:', error);
      }
    }
  };

  // Vue pour CLIENT (lecture seule)
  if (!isAdmin) {
    return (
      <div className="h-[calc(100vh-4rem)] flex flex-col p-6">
        <h2 className="text-2xl font-semibold mb-6">{t('messages.title')}</h2>

        {/* Messages directs */}
        {inbox.direct.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-medium mb-3">{t('messages.teamMessages')}</h3>
            <div className="space-y-3">
              {inbox.direct.map((msg: any) => {
                const isUnread = msg.recipientId === user?.id && !msg.readAt;
                return (
                  <div
                    key={msg.id}
                    onClick={() => handleMessageClick(msg.id, !!msg.readAt)}
                    className={`p-4 rounded-lg shadow border cursor-pointer transition-colors ${
                      isUnread
                        ? 'bg-blue-50 border-blue-300 hover:bg-blue-100'
                        : 'bg-white border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="font-medium">{msg.sender?.name}</div>
                        {isUnread && (
                          <span className="bg-blue-600 text-white text-xs px-2 py-0.5 rounded-full">
                            New
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-gray-400">
                        {format(new Date(msg.sentAt), 'dd/MM/yyyy HH:mm')}
                      </div>
                    </div>
                    {msg.subject && (
                      <div className="font-medium text-sm text-gray-700 mb-1">{msg.subject}</div>
                    )}
                    <div className="text-gray-600">{msg.content}</div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Broadcasts */}
        {inbox.broadcasts.length > 0 && (
          <div>
            <h3 className="text-lg font-medium mb-3">{t('messages.broadcasts')}</h3>
            <div className="space-y-3">
              {inbox.broadcasts.map((msg: any) => {
                const isUnread = !msg.readAt;
                return (
                  <div
                    key={msg.id}
                    onClick={() => handleMessageClick(msg.id, !!msg.readAt)}
                    className={`p-4 rounded-lg shadow border cursor-pointer transition-colors ${
                      isUnread
                        ? 'bg-blue-100 border-blue-400 hover:bg-blue-150'
                        : 'bg-blue-50 border-blue-200 hover:bg-blue-100'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="font-medium text-blue-900">{t('messages.teamAnnouncement')}</div>
                        {isUnread && (
                          <span className="bg-blue-600 text-white text-xs px-2 py-0.5 rounded-full">
                            New
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-blue-600">
                        {format(new Date(msg.sentAt), 'dd/MM/yyyy HH:mm')}
                      </div>
                    </div>
                    {msg.subject && (
                      <div className="font-medium text-sm text-blue-800 mb-1">{msg.subject}</div>
                    )}
                    <div className="text-blue-900">{msg.content}</div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {inbox.direct.length === 0 && inbox.broadcasts.length === 0 && (
          <div className="text-center text-gray-500 py-12">
            {t('messages.noMessagesYet')}
          </div>
        )}
      </div>
    );
  }

  // Vue pour ADMIN (envoi de messages)
  return (
    <div className="h-[calc(100vh-4rem)] flex">
      {/* Colonne de gauche - Conversations + Actions */}
      <div className="w-80 border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold mb-3">{t('messages.title')}</h2>

          {/* Boutons d'action */}
          <div className="space-y-2">
            <button
              onClick={() => setShowClientListModal(true)}
              className="w-full px-3 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              {t('messages.newMessage')}
            </button>

            <button
              onClick={() => setShowBroadcastModal(true)}
              className="w-full px-3 py-2 bg-purple-600 text-white text-sm rounded hover:bg-purple-700 flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
              </svg>
              {t('messages.broadcastMessage')}
            </button>
          </div>
        </div>

        {/* Liste des conversations */}
        <div className="flex-1 overflow-y-auto">
          {conversations.length === 0 ? (
            <div className="p-4 text-center text-gray-500 text-sm">
              {t('messages.noConversationsYet')}<br />{t('messages.clickToStart')}
            </div>
          ) : (
            conversations.map((conv) => (
              <div
                key={conv.user.id}
                onClick={() => loadConversation(conv.user)}
                className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 ${
                  selectedConversation?.id === conv.user.id ? 'bg-blue-50' : ''
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="font-medium">{conv.user.name}</div>
                    <div className="text-sm text-gray-500 truncate">
                      {conv.lastMessage.content.substring(0, 50)}
                      {conv.lastMessage.content.length > 50 ? '...' : ''}
                    </div>
                  </div>
                  <div className="ml-2 text-right">
                    <div className="text-xs text-gray-400">
                      {format(new Date(conv.lastMessage.sentAt), 'HH:mm')}
                    </div>
                    {conv.unreadCount > 0 && (
                      <div className="mt-1 bg-blue-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                        {conv.unreadCount}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Zone de chat */}
      <div className="flex-1 flex flex-col">
        {selectedConversation ? (
          <>
            {/* Header du chat */}
            <div className="p-4 border-b border-gray-200 bg-white">
              <div className="font-medium text-lg">{selectedConversation.name}</div>
              <div className="text-sm text-gray-500">{selectedConversation.email}</div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.senderId === user?.id ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-md px-4 py-2 rounded-lg ${
                      msg.senderId === user?.id
                        ? 'bg-blue-600 text-white'
                        : 'bg-white text-gray-900 border border-gray-200'
                    }`}
                  >
                    {msg.subject && (
                      <div className="font-medium text-sm mb-1">{msg.subject}</div>
                    )}
                    <div>{msg.content}</div>
                    <div
                      className={`text-xs mt-1 ${
                        msg.senderId === user?.id ? 'text-blue-100' : 'text-gray-500'
                      }`}
                    >
                      {format(new Date(msg.sentAt), 'HH:mm')}
                      {msg.readAt && msg.senderId === user?.id && (
                        <span className="ml-2">✓✓</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Input de message */}
            <div className="p-4 border-t border-gray-200 bg-white">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                  placeholder={t('messages.typeMessage')}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                />
                <button
                  onClick={sendMessage}
                  disabled={!newMessage.trim()}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {t('messages.send')}
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-400">
            {t('messages.selectConversation')}
          </div>
        )}
      </div>

      {/* Modal - Liste des clients */}
      {showClientListModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[80vh] flex flex-col">
            <h3 className="text-xl font-semibold mb-4">{t('messages.selectClient')}</h3>

            <div className="flex-1 overflow-y-auto mb-4">
              {loadingClients ? (
                <div className="text-center py-4">{t('messages.loading')}</div>
              ) : allClients.length === 0 ? (
                <div className="text-center text-gray-500 py-4">{t('common.noResults')}</div>
              ) : (
                <div className="space-y-2">
                  {allClients.map((client) => (
                    <button
                      key={client.id}
                      onClick={() => startConversationWithClient(client)}
                      className="w-full text-left p-3 hover:bg-gray-100 rounded-lg border border-gray-200"
                    >
                      <div className="font-medium">{client.name}</div>
                      <div className="text-sm text-gray-500">{client.email}</div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button
              onClick={() => setShowClientListModal(false)}
              className="w-full px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              {t('messages.cancel')}
            </button>
          </div>
        </div>
      )}

      {/* Modal - Broadcast */}
      {showBroadcastModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-xl font-semibold mb-4">{t('messages.sendBroadcast')}</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('messages.subjectOptional')}
                </label>
                <input
                  type="text"
                  value={broadcastSubject}
                  onChange={(e) => setBroadcastSubject(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                  placeholder={t('messages.subject')}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('messages.messageContent')} *
                </label>
                <textarea
                  value={broadcastContent}
                  onChange={(e) => setBroadcastContent(e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                  placeholder={t('messages.message')}
                />
              </div>

              <div className="flex gap-2 justify-end">
                <button
                  onClick={() => {
                    setShowBroadcastModal(false);
                    setBroadcastSubject('');
                    setBroadcastContent('');
                  }}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  {t('messages.cancel')}
                </button>
                <button
                  onClick={sendBroadcast}
                  disabled={!broadcastContent.trim()}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {t('messages.send')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
