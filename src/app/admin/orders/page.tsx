// src/app/admin/orders/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Eye, Download, Filter } from 'lucide-react';
import Link from 'next/link';

interface OrderItem {
  productName: string;
  quantity: number;
  unitPrice: number;
}

interface Order {
  id: string;
  totalAmount: number;
  paymentStatus: string;
  orderStatus: string;
  createdAt: string;
  user: {
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
  };
  items: OrderItem[];
}

export default function AdminOrdersPage() {
  const [filterStatus, setFilterStatus] = useState('all');
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://fittrustmedicals-backend.onrender.com';

  // Fetch orders from backend
  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${BACKEND_URL}/api/orders`);
      if (!response.ok) {
        throw new Error('Failed to fetch orders');
      }
      const data = await response.json();
      setOrders(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError('Failed to load orders. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    // Refresh every 30 seconds
    const interval = setInterval(fetchOrders, 30000);
    return () => clearInterval(interval);
  }, []);

  // Filter orders based on status
  const filteredOrders = filterStatus === 'all' 
    ? orders 
    : orders.filter(order => {
        if (filterStatus === 'pending') return order.paymentStatus === 'PENDING';
        if (filterStatus === 'paid') return order.paymentStatus === 'PAID';
        if (filterStatus === 'processing') return order.orderStatus === 'PROCESSING';
        if (filterStatus === 'completed') return order.orderStatus === 'COMPLETED';
        if (filterStatus === 'cancelled') return order.orderStatus === 'CANCELLED';
        return true;
      });

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'paid': return 'success';
      case 'completed': return 'success';
      case 'processing': return 'primary';
      case 'shipped': return 'info';
      case 'pending': return 'warning';
      case 'cancelled': return 'danger';
      default: return 'secondary';
    }
  };

  const getStatusLabel = (order: Order) => {
    if (order.paymentStatus === 'PAID') {
      if (order.orderStatus === 'PROCESSING') return 'Processing';
      if (order.orderStatus === 'COMPLETED') return 'Completed';
      if (order.orderStatus === 'CANCELLED') return 'Cancelled';
      return 'Paid';
    }
    return 'Pending Payment';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-NG', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const exportToCSV = () => {
    const headers = ['Order ID', 'Customer', 'Email', 'Phone', 'Amount', 'Status', 'Date', 'Items'];
    const csvData = filteredOrders.map(order => [
      order.id.slice(0, 12),
      `${order.user?.firstName || ''} ${order.user?.lastName || ''}`,
      order.user?.email || '',
      order.user?.phoneNumber || '',
      order.totalAmount?.toString() || '0',
      getStatusLabel(order),
      formatDate(order.createdAt),
      order.items?.length?.toString() || '0'
    ]);

    const csvContent = [headers, ...csvData].map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `orders-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Orders</h1>
            <p className="text-gray-600 mt-1">Loading orders...</p>
          </div>
        </div>
        <Card className="p-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-500">Fetching orders...</p>
          </div>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Orders</h1>
            <p className="text-gray-600 mt-1">Manage customer orders</p>
          </div>
        </div>
        <Card className="p-12">
          <div className="text-center text-red-600">
            <p>{error}</p>
            <button 
              onClick={fetchOrders}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Try Again
            </button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Orders</h1>
          <p className="text-gray-600 mt-1">Manage customer orders</p>
        </div>
        <Button 
          variant="secondary" 
          className="flex items-center gap-2"
          onClick={exportToCSV}
          disabled={orders.length === 0}
        >
          <Download size={20} />
          Export CSV
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card className="p-4 text-center">
          <p className="text-2xl font-bold text-gray-900">{orders.length}</p>
          <p className="text-sm text-gray-500">Total Orders</p>
        </Card>
        <Card className="p-4 text-center">
          <p className="text-2xl font-bold text-yellow-600">
            {orders.filter(o => o.paymentStatus === 'PENDING').length}
          </p>
          <p className="text-sm text-gray-500">Pending</p>
        </Card>
        <Card className="p-4 text-center">
          <p className="text-2xl font-bold text-green-600">
            {orders.filter(o => o.paymentStatus === 'PAID').length}
          </p>
          <p className="text-sm text-gray-500">Paid</p>
        </Card>
        <Card className="p-4 text-center">
          <p className="text-2xl font-bold text-blue-600">
            {orders.filter(o => o.orderStatus === 'PROCESSING').length}
          </p>
          <p className="text-sm text-gray-500">Processing</p>
        </Card>
        <Card className="p-4 text-center">
          <p className="text-2xl font-bold text-gray-900">
            ₦{orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0).toLocaleString()}
          </p>
          <p className="text-sm text-gray-500">Total Revenue</p>
        </Card>
      </div>

      {/* Filter Tabs */}
      <Card className="p-4">
        <div className="flex flex-wrap gap-2">
          {['all', 'pending', 'paid', 'processing', 'completed', 'cancelled'].map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filterStatus === status
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>
      </Card>

      {/* Orders Table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Items</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredOrders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-mono text-sm text-gray-900">{order.id.slice(0, 12)}...</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="font-medium text-gray-900">
                        {order.user?.firstName} {order.user?.lastName}
                      </div>
                      <div className="text-sm text-gray-500">{order.user?.email}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {formatDate(order.createdAt)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {order.items?.length || 0} items
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                    ₦{order.totalAmount?.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Badge 
                      label={getStatusLabel(order)}
                      variant={getStatusColor(order.paymentStatus === 'PAID' ? 'paid' : 'pending') as any}
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <Link href={`/admin/orders/${order.id}`}>
                      <button className="text-blue-600 hover:text-blue-800 p-1">
                        <Eye size={18} />
                      </button>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {filteredOrders.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-600">No orders found with status: {filterStatus}</p>
        </div>
      )}
    </div>
  );
}