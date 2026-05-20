'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { 
  ShoppingBag, 
  MapPin, 
  Heart, 
  Bell, 
  User, 
  Package,
  Truck,
  CheckCircle,
  Clock
} from 'lucide-react';

interface Order {
  id: string;
  orderNumber: string;
  total: number;
  status: string;
  createdAt: string;
  items: any[];
  user?: {
    email: string;
  };
  customerEmail?: string;
}

export default function AccountDashboard() {
  const { customer, orders, getUnreadCount } = useAuthStore();
  const [myOrders, setMyOrders] = useState<Order[]>([]);

  useEffect(() => {
    // CRITICAL FIX: Filter orders to ONLY show current customer's orders
    if (customer?.email) {
      const filteredOrders = orders.filter((order: Order) => 
        order.user?.email === customer.email || 
        order.customerEmail === customer.email
      );
      setMyOrders(filteredOrders);
    } else {
      setMyOrders([]);
    }
  }, [orders, customer]);

  const recentOrders = myOrders.slice(0, 3);
  const unreadCount = getUnreadCount();

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'delivered':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'shipped':
        return <Truck className="w-5 h-5 text-blue-500" />;
      case 'processing':
        return <Package className="w-5 h-5 text-yellow-500" />;
      default:
        return <Clock className="w-5 h-5 text-gray-500" />;
    }
  };

  // Get status display text
  const getStatusDisplay = (status: string) => {
    switch (status) {
      case 'delivered': return 'DELIVERED';
      case 'shipped': return 'SHIPPED';
      case 'processing': return 'PROCESSING';
      case 'cancelled': return 'CANCELLED';
      case 'pending': return 'PENDING';
      default: return status?.replace('_', ' ').toUpperCase() || 'PENDING';
    }
  };

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered': return 'bg-green-100 text-green-700';
      case 'shipped': return 'bg-blue-100 text-blue-700';
      case 'processing': return 'bg-yellow-100 text-yellow-700';
      case 'cancelled': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-2xl p-8 text-white shadow-lg">
        <h1 className="text-3xl font-bold mb-2">Welcome back, {customer?.name || 'Customer'}!</h1>
        <p className="text-blue-100">Manage your orders, addresses, and account settings.</p>
      </div>

      {/* Quick Stats - Only showing customer's own data */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Link href="/account/orders" className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-blue-50 rounded-lg">
              <ShoppingBag className="w-6 h-6 text-blue-600" />
            </div>
            <span className="text-2xl font-bold text-gray-900">{myOrders.length}</span>
          </div>
          <p className="text-gray-600 font-medium">Total Orders</p>
        </Link>

        <Link href="/account/addresses" className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-orange-50 rounded-lg">
              <MapPin className="w-6 h-6 text-orange-600" />
            </div>
            <span className="text-2xl font-bold text-gray-900">{customer?.addresses?.length || 0}</span>
          </div>
          <p className="text-gray-600 font-medium">Saved Addresses</p>
        </Link>

        <Link href="/account/wishlist" className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-red-50 rounded-lg">
              <Heart className="w-6 h-6 text-red-600" />
            </div>
            <span className="text-2xl font-bold text-gray-900">{customer?.wishlist?.length || 0}</span>
          </div>
          <p className="text-gray-600 font-medium">Wishlist Items</p>
        </Link>

        <Link href="/account/notifications" className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-purple-50 rounded-lg">
              <Bell className="w-6 h-6 text-purple-600" />
            </div>
            <span className="text-2xl font-bold text-gray-900">{unreadCount}</span>
          </div>
          <p className="text-gray-600 font-medium">Unread Notifications</p>
        </Link>
      </div>

      {/* Recent Orders - ONLY showing customer's orders */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-semibold text-gray-900">Recent Orders</h2>
          <Link href="/account/orders" className="text-blue-600 hover:text-blue-700 font-medium text-sm">
            View All Orders →
          </Link>
        </div>

        {recentOrders.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <ShoppingBag className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>No orders yet</p>
            <Link href="/products" className="text-blue-600 hover:underline mt-2 inline-block">
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {recentOrders.map((order) => (
              <div key={order.id} className="flex items-center justify-between p-4 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex items-center space-x-4">
                  {getStatusIcon(order.status)}
                  <div>
                    <p className="font-medium text-gray-900">Order #{order.orderNumber}</p>
                    <p className="text-sm text-gray-500">
                      {new Date(order.createdAt).toLocaleDateString()} • {order.items?.length || 0} items
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900">₦{(order.total || 0).toLocaleString()}</p>
                  <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(order.status)}`}>
                    {getStatusDisplay(order.status)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link href="/account/profile" className="flex items-center space-x-4 p-6 bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
          <div className="p-3 bg-gray-100 rounded-lg">
            <User className="w-6 h-6 text-gray-600" />
          </div>
          <div>
            <p className="font-semibold text-gray-900">Update Profile</p>
            <p className="text-sm text-gray-500">Manage your personal information</p>
          </div>
        </Link>

        <Link href="/products" className="flex items-center space-x-4 p-6 bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
          <div className="p-3 bg-blue-100 rounded-lg">
            <ShoppingBag className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <p className="font-semibold text-gray-900">Continue Shopping</p>
            <p className="text-sm text-gray-500">Browse our latest products</p>
          </div>
        </Link>
      </div>
    </div>
  );
}