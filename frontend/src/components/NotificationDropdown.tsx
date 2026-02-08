'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/stores';
import { socketService } from '@/lib/socket';
import { formatDate } from '@/utils/helpers';
import { Notification } from '@/types';

export function NotificationDropdown() {
  const { user } = useAuthStore();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    // TODO: Fetch notifications from API
    const mockNotifications: Notification[] = [
      {
        id: '1',
        user_id: user?.id || '',
        type: 'like',
        title: 'New like',
        message: 'John Doe liked your blog post',
        is_read: false,
        created_at: new Date().toISOString(),
      },
    ];
    setNotifications(mockNotifications);
    setUnreadCount(mockNotifications.filter(n => !n.is_read).length);

    // Listen for real-time notifications
    const socket = socketService.getSocket();
    if (socket) {
      socket.on('notification:new', (notification: Notification) => {
        setNotifications((prev) => [notification, ...prev]);
        setUnreadCount((prev) => prev + 1);
      });
    }
  }, [user]);

  const markAsRead = async (id: string) => {
    // TODO: Call API to mark as read
    setNotifications(notifications.map(n =>
      n.id === id ? { ...n, is_read: true } : n
    ));
    setUnreadCount((prev) => Math.max(0, prev - 1));
  };

  const markAllAsRead = async () => {
    // TODO: Call API to mark all as read
    setNotifications(notifications.map(n => ({ ...n, is_read: true })));
    setUnreadCount(0);
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'like':
        return '❤️';
      case 'comment':
        return '💬';
      case 'follow':
        return '👤';
      case 'mention':
        return '@';
      default:
        return '🔔';
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
      >
        <span className="text-2xl">🔔</span>
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-xl border z-20">
            <div className="p-4 border-b flex justify-between items-center">
              <h3 className="font-bold text-lg">Notifications</h3>
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-sm text-blue-600 hover:text-blue-700"
                >
                  Mark all as read
                </button>
              )}
            </div>

            <div className="max-h-96 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <div className="text-4xl mb-2">🔔</div>
                  <div>No notifications yet</div>
                </div>
              ) : (
                notifications.map((notification) => (
                  <div
                    key={notification.id}
                    onClick={() => !notification.is_read && markAsRead(notification.id)}
                    className={`p-4 border-b hover:bg-gray-50 cursor-pointer ${
                      !notification.is_read ? 'bg-blue-50' : ''
                    }`}
                  >
                    <div className="flex gap-3">
                      <div className="text-2xl flex-shrink-0">
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm">{notification.title}</div>
                        <div className="text-sm text-gray-600 truncate">
                          {notification.message}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {formatDate(notification.created_at)}
                        </div>
                      </div>
                      {!notification.is_read && (
                        <div className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0 mt-2" />
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>

            {notifications.length > 0 && (
              <div className="p-3 border-t text-center">
                <button className="text-sm text-blue-600 hover:text-blue-700">
                  View all notifications
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
