import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';

export function useUnreadMessages() {
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const { isAuthenticated } = useAuthStore();

  const fetchUnreadCount = async () => {
    if (!isAuthenticated) {
      setUnreadCount(0);
      return;
    }

    try {
      const data = await api.getUnreadCount();
      // For clients, the API returns { total, direct, broadcast }
      // For admins, it returns a number
      const count = typeof data === 'number' ? data : (data.total || 0);
      setUnreadCount(count);
    } catch (error) {
      console.error('Failed to fetch unread count:', error);
      setUnreadCount(0);
    }
  };

  useEffect(() => {
    fetchUnreadCount();

    // Poll every 30 seconds for updates
    const interval = setInterval(fetchUnreadCount, 30000);

    return () => clearInterval(interval);
  }, [isAuthenticated]);

  return { unreadCount, refreshUnreadCount: fetchUnreadCount };
}
