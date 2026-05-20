'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import { Bell, Check, Trash2, Package, CreditCard, Truck, Tag, RefreshCw } from 'lucide-react';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'order' | 'payment' | 'shipping' | 'promotion';
  read: boolean;
  createdAt: string;
}

export default function NotificationsPage() {
  const router = useRouter();
  const { 
    customer, 
    isAuthenticated, 
    _hasHydrated,
    markNotificationAsRead, 
    markAllNotificationsAsRead, 
    deleteNotification,
    getUnreadCount 
  } = useAuthStore();

  const [refreshing, setRefreshing] = useState(false);

  // Redirect if not authenticated
  useEffect(() => {
    if (_hasHydrated && !isAuthenticated) {
      router.push('/login?redirect=/account/notifications');
    }
  }, [_hasHydrated, isAuthenticated, router]);

  // Get customer's notifications only
  const myNotifications: Notification[] = customer?.notifications || [];
  const unreadCount = getUnreadCount();

  const getIcon = (type: string) => {
    switch (type) {
      case 'order':
        return <Package className="w-5 h-5 text-blue-600" />;
      case 'payment':
        return <CreditCard className="w-5 h-5 text-green-600" />;
      case 'shipping':
        return <Truck className="w-5 h-5 text-orange-600" />;
      case 'promotion':
        return <Tag className="w-5 h-5 text-purple-600" />;
      default:
        return <Bell className="w-5 h-5 text-gray-600" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'order':
        return 'bg-blue-50';
      case 'payment':
        return 'bg-green-50';
      case 'shipping':
        return 'bg-orange-50';
      case 'promotion':
        return 'bg-purple-50';
      default:
        return 'bg-gray-50';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'order': return 'Order Update';
      case 'payment': return 'Payment';
      case 'shipping': return 'Shipping';
      case 'promotion': return 'Promotion';
      default: return 'General';
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    // Force re-render by toggling state
    setTimeout(() => setRefreshing(false), 500);
  };

  const handleMarkAllRead = () => {
    markAllNotificationsAsRead();
  };

  const handleMarkRead = (id: string) => {
    markNotificationAsRead(id);
  };

  const handleDelete = (id: string) => {
    if (confirm('Delete this notification?')) {
      deleteNotification(id);
    }
  };

  if (!_hasHydrated) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
          <p className="text-gray-500 mt-1">
            You have <span className="font-semibold text-blue-600">{unreadCount}</span> unread notification{unreadCount !== 1 ? 's' : ''}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            <span className="text-sm">Refresh</span>
          </button>
          {myNotifications.length > 0 && unreadCount > 0 && (
            <button
              onClick={handleMarkAllRead}
              className="flex items-center gap-2 px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            >
              <Check className="w-4 h-4" />
              <span className="text-sm">Mark all as read</span>
            </button>
          )}
        </div>
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {myNotifications.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
            <Bell className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-medium text-gray-700 mb-1">No notifications yet</h3>
            <p className="text-gray-500 text-sm">
              When you receive notifications, they will appear here
            </p>
            <Link href="/products" className="inline-block mt-4 text-blue-600 hover:underline">
              Start Shopping →
            </Link>
          </div>
        ) : (
          myNotifications.map((notification) => (
            <div
              key={notification.id}
              className={`bg-white rounded-xl shadow-sm border p-4 flex items-start gap-4 transition-all ${
                notification.read 
                  ? 'border-gray-100 opacity-75' 
                  : 'border-blue-200 bg-blue-50/30 shadow-md'
              }`}
            >
              {/* Icon */}
              <div className={`p-3 rounded-lg ${getTypeColor(notification.type)} flex-shrink-0`}>
                {getIcon(notification.type)}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className={`font-semibold ${notification.read ? 'text-gray-700' : 'text-gray-900'}`}>
                        {notification.title}
                      </h3>
                      <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full">
                        {getTypeLabel(notification.type)}
                      </span>
                      {!notification.read && (
                        <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-600 rounded-full">
                          New
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                    <p className="text-xs text-gray-400 mt-2">
                      {new Date(notification.createdAt).toLocaleString()}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-1 flex-shrink-0 self-start">
                    {!notification.read && (
                      <button
                        onClick={() => handleMarkRead(notification.id)}
                        className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                        title="Mark as read"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(notification.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer note */}
      {myNotifications.length > 0 && (
        <p className="text-xs text-gray-400 text-center">
          Notifications are stored locally. Clearing browser data will remove them.
        </p>
      )}
    </div>
  );
}