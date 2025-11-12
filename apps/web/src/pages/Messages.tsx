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

  // Collapse states for read messages
  const [showReadReminders, setShowReadReminders] = useState(false);
  const [showReadDirectMessages, setShowReadDirectMessages] = useState(false);
  const [showReadBroadcasts, setShowReadBroadcasts] = useState(false);

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

  // Separate reminders from direct messages
  const reminders = inbox.direct.filter((msg: any) => msg.type === 'REMINDER');
  const directMessages = inbox.direct.filter((msg: any) => msg.type !== 'REMINDER');

  // Separate read and unread messages
  const unreadReminders = reminders.filter((msg: any) => msg.recipientId === user?.id && !msg.readAt);
  const readReminders = reminders.filter((msg: any) => msg.readAt);

  const unreadDirectMessages = directMessages.filter((msg: any) => msg.recipientId === user?.id && !msg.readAt);
  const readDirectMessages = directMessages.filter((msg: any) => msg.readAt);

  const unreadBroadcasts = inbox.broadcasts.filter((msg: any) => !msg.readAt);
  const readBroadcasts = inbox.broadcasts.filter((msg: any) => msg.readAt);

  // Render message card function
  const renderMessageCard = (msg: any, type: 'reminder' | 'direct' | 'broadcast') => {
    const isUnread = type === 'broadcast' ? !msg.readAt : (msg.recipientId === user?.id && !msg.readAt);

    const colorScheme = {
      reminder: {
        gradient: 'from-amber-500 to-orange-500',
        border: isUnread ? 'border-amber-400 ring-4 ring-amber-100' : 'border-amber-200',
        text: 'text-amber-900',
        badgeGradient: 'from-amber-500 to-orange-500'
      },
      direct: {
        gradient: 'from-pink-500 to-purple-500',
        border: isUnread ? 'border-pink-400 ring-4 ring-pink-100' : 'border-pink-200',
        text: 'text-gray-900',
        badgeGradient: 'from-pink-500 to-purple-500'
      },
      broadcast: {
        gradient: 'from-blue-500 to-indigo-500',
        border: isUnread ? 'border-blue-400 ring-4 ring-blue-100' : 'border-blue-200',
        text: 'text-blue-900',
        badgeGradient: 'from-blue-500 to-indigo-500'
      }
    }[type];

    return (
      <div
        key={msg.id}
        onClick={() => handleMessageClick(msg.id, !!msg.readAt)}
        className={`bg-white rounded-2xl shadow-lg border-2 p-6 cursor-pointer transition-all duration-300 hover:shadow-xl hover:scale-[1.02] ${colorScheme.border}`}
      >
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${colorScheme.gradient} flex items-center justify-center shadow-md`}>
              {type === 'reminder' ? (
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
              ) : type === 'direct' ? (
                <div className="text-white font-bold text-lg">
                  {msg.sender?.name?.charAt(0).toUpperCase() || '?'}
                </div>
              ) : (
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
                </svg>
              )}
            </div>
            <div>
              <div className={`font-bold ${colorScheme.text}`}>
                {type === 'reminder' ? 'Automatic Reminder' : type === 'direct' ? msg.sender?.name : t('messages.teamAnnouncement')}
              </div>
              <div className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {format(new Date(msg.sentAt), 'dd/MM/yyyy HH:mm')}
              </div>
            </div>
          </div>
          {isUnread && (
            <span className={`px-3 py-1.5 bg-gradient-to-r ${colorScheme.badgeGradient} text-white text-xs font-bold rounded-full shadow-lg animate-pulse`}>
              NEW
            </span>
          )}
        </div>
        {msg.subject && (
          <div className={`font-bold text-lg ${colorScheme.text} mb-3 pb-3 border-b-2 ${type === 'reminder' ? 'border-amber-100' : type === 'direct' ? 'border-pink-100' : 'border-blue-100'}`}>
            {msg.subject}
          </div>
        )}
        <div className="text-gray-700 leading-relaxed whitespace-pre-line">{msg.content}</div>
      </div>
    );
  };

  // Vue pour CLIENT (lecture seule)
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50 p-4 md:p-8">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="mb-8 bg-white rounded-3xl shadow-xl p-6 md:p-8 border-2 border-pink-100">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-pink-500 to-purple-500 flex items-center justify-center shadow-lg">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <h2 className="text-3xl font-bold bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
                  {t('messages.title')}
                </h2>
                <p className="text-gray-600 text-sm mt-1">Stay updated with your messages and reminders</p>
              </div>
            </div>
          </div>

          {/* Appointment Reminders */}
          {reminders.length > 0 && (
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shadow-lg">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900">Appointment Reminders</h3>
                <span className="px-3 py-1 bg-amber-100 text-amber-800 text-sm font-bold rounded-full">
                  {reminders.length}
                </span>
              </div>

              {/* Unread Reminders */}
              {unreadReminders.length > 0 && (
                <div className="mb-4">
                  <div className="flex items-center gap-2 mb-3 px-2">
                    <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></div>
                    <span className="text-sm font-bold text-amber-900">Unread ({unreadReminders.length})</span>
                  </div>
                  <div className="space-y-4">
                    {unreadReminders.map((msg) => renderMessageCard(msg, 'reminder'))}
                  </div>
                </div>
              )}

              {/* Read Reminders - Collapsible */}
              {readReminders.length > 0 && (
                <div>
                  <button
                    onClick={() => setShowReadReminders(!showReadReminders)}
                    className="flex items-center gap-2 w-full px-2 py-2 mb-3 hover:bg-amber-50 rounded-lg transition-colors"
                  >
                    <svg
                      className={`w-5 h-5 text-amber-700 transition-transform ${showReadReminders ? 'rotate-90' : ''}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                    <span className="text-sm font-semibold text-gray-600">Read ({readReminders.length})</span>
                  </button>
                  {showReadReminders && (
                    <div className="space-y-4">
                      {readReminders.map((msg) => renderMessageCard(msg, 'reminder'))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Messages directs */}
          {directMessages.length > 0 && (
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-500 to-purple-500 flex items-center justify-center shadow-lg">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900">{t('messages.teamMessages')}</h3>
                <span className="px-3 py-1 bg-pink-100 text-pink-800 text-sm font-bold rounded-full">
                  {directMessages.length}
                </span>
              </div>

              {/* Unread Direct Messages */}
              {unreadDirectMessages.length > 0 && (
                <div className="mb-4">
                  <div className="flex items-center gap-2 mb-3 px-2">
                    <div className="w-2 h-2 rounded-full bg-pink-500 animate-pulse"></div>
                    <span className="text-sm font-bold text-pink-900">Unread ({unreadDirectMessages.length})</span>
                  </div>
                  <div className="space-y-4">
                    {unreadDirectMessages.map((msg) => renderMessageCard(msg, 'direct'))}
                  </div>
                </div>
              )}

              {/* Read Direct Messages - Collapsible */}
              {readDirectMessages.length > 0 && (
                <div>
                  <button
                    onClick={() => setShowReadDirectMessages(!showReadDirectMessages)}
                    className="flex items-center gap-2 w-full px-2 py-2 mb-3 hover:bg-pink-50 rounded-lg transition-colors"
                  >
                    <svg
                      className={`w-5 h-5 text-pink-700 transition-transform ${showReadDirectMessages ? 'rotate-90' : ''}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                    <span className="text-sm font-semibold text-gray-600">Read ({readDirectMessages.length})</span>
                  </button>
                  {showReadDirectMessages && (
                    <div className="space-y-4">
                      {readDirectMessages.map((msg) => renderMessageCard(msg, 'direct'))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Broadcasts */}
          {inbox.broadcasts.length > 0 && (
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center shadow-lg">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900">{t('messages.broadcasts')}</h3>
                <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-bold rounded-full">
                  {inbox.broadcasts.length}
                </span>
              </div>

              {/* Unread Broadcasts */}
              {unreadBroadcasts.length > 0 && (
                <div className="mb-4">
                  <div className="flex items-center gap-2 mb-3 px-2">
                    <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
                    <span className="text-sm font-bold text-blue-900">Unread ({unreadBroadcasts.length})</span>
                  </div>
                  <div className="space-y-4">
                    {unreadBroadcasts.map((msg) => renderMessageCard(msg, 'broadcast'))}
                  </div>
                </div>
              )}

              {/* Read Broadcasts - Collapsible */}
              {readBroadcasts.length > 0 && (
                <div>
                  <button
                    onClick={() => setShowReadBroadcasts(!showReadBroadcasts)}
                    className="flex items-center gap-2 w-full px-2 py-2 mb-3 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    <svg
                      className={`w-5 h-5 text-blue-700 transition-transform ${showReadBroadcasts ? 'rotate-90' : ''}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                    <span className="text-sm font-semibold text-gray-600">Read ({readBroadcasts.length})</span>
                  </button>
                  {showReadBroadcasts && (
                    <div className="space-y-4">
                      {readBroadcasts.map((msg) => renderMessageCard(msg, 'broadcast'))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Empty State */}
          {reminders.length === 0 && directMessages.length === 0 && inbox.broadcasts.length === 0 && (
            <div className="bg-white rounded-3xl shadow-xl p-12 text-center border-2 border-gray-200">
              <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">No Messages Yet</h3>
              <p className="text-gray-600">
                You don't have any messages at the moment. Messages from our team will appear here.
              </p>
            </div>
          )}
        </div>
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
