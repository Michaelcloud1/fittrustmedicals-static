'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Eye, Download, Filter, CheckCircle, XCircle, RefreshCw, Trash2, Mail, Send } from 'lucide-react';
import Link from 'next/link';

interface OrderItem {
  productName: string;
  name?: string;
  quantity: number;
  unitPrice: number;
  price?: number;
}

interface Order {
  id: string;
  totalAmount: number;
  paymentStatus: string;
  orderStatus: string;
  createdAt: string;
  transactionReference?: string;
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
  const [confirmingOrderId, setConfirmingOrderId] = useState<string | null>(null);
  const [deletingOrderId, setDeletingOrderId] = useState<string | null>(null);
  const [sendingEmailId, setSendingEmailId] = useState<string | null>(null);

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

  // ✅ NEW: Function to send receipt email
  const sendReceiptEmail = async (order: Order) => {
    setSendingEmailId(order.id);
    
    try {
      const customerName = `${order.user?.firstName || ''} ${order.user?.lastName || ''}`.trim() || 'Customer';
      const customerEmail = order.user?.email;
      
      if (!customerEmail) {
        console.error('No customer email found for order:', order.id);
        alert('❌ Cannot send email: No customer email found for this order');
        return false;
      }

      // Format items properly
      const items = order.items.map(item => ({
        name: item.productName || item.name || 'Product',
        quantity: item.quantity,
        price: item.unitPrice || item.price || 0,
      }));

      console.log('📧 Sending receipt to:', customerEmail);
      console.log('📦 Order details:', {
        orderNumber: order.id,
        total: order.totalAmount,
        itemsCount: items.length
      });

      const response = await fetch('/api/send-receipt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: customerEmail,
          customerName: customerName,
          orderNumber: order.id.slice(0, 12),
          total: order.totalAmount,
          items: items,
          orderDate: order.createdAt,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        console.log('✅ Receipt email sent successfully to:', customerEmail);
        return true;
      } else {
        console.error('Failed to send email:', data.error);
        return false;
      }
    } catch (error) {
      console.error('Error sending email:', error);
      return false;
    } finally {
      setSendingEmailId(null);
    }
  };

  // ✅ UPDATED: Confirm payment with email notification
  const handleConfirmPayment = async (orderId: string) => {
    if (!confirm('Confirm payment for this order? This will mark it as PAID and send a receipt email to the customer.')) {
      return;
    }

    setConfirmingOrderId(orderId);
    try {
      // Find the order first
      const order = orders.find(o => o.id === orderId);
      if (!order) {
        alert('Order not found');
        return;
      }

      const transactionReference = `CONFIRMED_${Date.now()}_${orderId.slice(0, 8)}`;
      
      const response = await fetch(`${BACKEND_URL}/api/admin/confirm-payment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, transactionReference }),
      });

      const data = await response.json();

      if (data.success) {
        // Send receipt email after payment confirmation
        const emailSent = await sendReceiptEmail(order);
        
        if (emailSent) {
          alert(`✅ Payment confirmed! Receipt has been sent to ${order.user?.email}`);
        } else {
          alert(`⚠️ Payment confirmed! But receipt email could not be sent to ${order.user?.email}. Please check email configuration.`);
        }
        
        fetchOrders(); // Refresh the orders list
      } else {
        alert(data.error || 'Failed to confirm payment.');
      }
    } catch (err) {
      console.error('Confirmation error:', err);
      alert('Something went wrong. Please try again.');
    } finally {
      setConfirmingOrderId(null);
    }
  };

  // ✅ NEW: Function to manually resend receipt email
  const handleResendReceipt = async (order: Order) => {
    if (!confirm(`Resend receipt email to ${order.user?.email}?`)) {
      return;
    }

    const emailSent = await sendReceiptEmail(order);
    
    if (emailSent) {
      alert(`✅ Receipt resent successfully to ${order.user?.email}`);
    } else {
      alert(`❌ Failed to send receipt to ${order.user?.email}. Please check email configuration.`);
    }
  };

  // Delete order
  const handleDeleteOrder = async (orderId: string) => {
    if (!confirm('⚠️ Are you sure you want to delete this order? This action cannot be undone.')) {
      return;
    }

    setDeletingOrderId(orderId);
    try {
      const response = await fetch(`${BACKEND_URL}/api/orders/${orderId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        alert('✅ Order deleted successfully');
        fetchOrders();
      } else {
        const errorData = await response.json();
        alert(errorData.error || 'Failed to delete order');
      }
    } catch (err) {
      console.error('Delete error:', err);
      alert('Failed to delete order');
    } finally {
      setDeletingOrderId(null);
    }
  };

  useEffect(() => {
    fetchOrders();
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

  const handleRefresh = () => {
    fetchOrders();
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

  const pendingOrdersCount = orders.filter(o => o.paymentStatus === 'PENDING').length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Orders</h1>
          <p className="text-gray-600 mt-1">Manage customer orders and confirm payments</p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="secondary" 
            className="flex items-center gap-2"
            onClick={handleRefresh}
          >
            <RefreshCw size={20} />
            Refresh
          </Button>
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
          <p className="text-sm text-gray-500">Pending Payment</p>
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
              {status === 'pending' && pendingOrdersCount > 0 && (
                <span className="ml-2 bg-yellow-500 text-white text-xs px-2 py-0.5 rounded-full">
                  {pendingOrdersCount}
                </span>
              )}
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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                    No orders found
                   </td>
                 </tr>
              ) : (
                filteredOrders.map((order) => (
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
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center gap-2">
                        <Link href={`/admin/orders/${order.id}`}>
                          <button className="text-blue-600 hover:text-blue-800 p-1" title="View Details">
                            <Eye size={18} />
                          </button>
                        </Link>
                        
                        {order.paymentStatus === 'PENDING' && (
                          <button
                            onClick={() => handleConfirmPayment(order.id)}
                            disabled={confirmingOrderId === order.id}
                            className="flex items-center gap-1 px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50 text-sm"
                            title="Confirm Payment"
                          >
                            {confirmingOrderId === order.id ? (
                              <RefreshCw size={14} className="animate-spin" />
                            ) : (
                              <CheckCircle size={14} />
                            )}
                            Confirm
                          </button>
                        )}
                        
                        {/* ✅ NEW: Resend Receipt button for paid orders */}
                        {order.paymentStatus === 'PAID' && (
                          <button
                            onClick={() => handleResendReceipt(order)}
                            disabled={sendingEmailId === order.id}
                            className="flex items-center gap-1 px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 text-sm"
                            title="Resend Receipt Email"
                          >
                            {sendingEmailId === order.id ? (
                              <RefreshCw size={14} className="animate-spin" />
                            ) : (
                              <Mail size={14} />
                            )}
                            Resend
                          </button>
                        )}
                        
                        <button
                          onClick={() => handleDeleteOrder(order.id)}
                          disabled={deletingOrderId === order.id}
                          className="text-red-600 hover:text-red-800 p-1"
                          title="Delete Order"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
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