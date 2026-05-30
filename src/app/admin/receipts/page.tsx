'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Receipt, 
  Send,
  CheckCircle,
  Clock,
  Mail,
  Download,
  Search,
  RefreshCw
} from 'lucide-react';

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
  transactionReference?: string;
  paidAt?: string;
  user: {
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
  };
  items: OrderItem[];
}

export default function ReceiptsManagementPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

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
    const interval = setInterval(fetchOrders, 30000);
    return () => clearInterval(interval);
  }, []);

  // Filter orders based on search
  const filteredOrders = orders.filter(order =>
    order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    order.user?.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    `${order.user?.firstName} ${order.user?.lastName}`.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Check if receipt is ready (payment confirmed)
  const isReceiptReady = (order: Order) => {
    return order.paymentStatus === 'PAID';
  };

  const toggleSelection = (orderId: string) => {
    setSelectedOrders(prev => 
      prev.includes(orderId) 
        ? prev.filter(id => id !== orderId)
        : [...prev, orderId]
    );
  };

  const handleBulkSend = async () => {
    if (selectedOrders.length === 0) return;
    
    setSending(true);
    let successCount = 0;
    
    for (const orderId of selectedOrders) {
      const order = orders.find(o => o.id === orderId);
      if (order && isReceiptReady(order)) {
        try {
          const response = await fetch(`${BACKEND_URL}/api/receipts/send/${orderId}`, {
            method: 'POST',
          });
          
          if (response.ok) {
            successCount++;
          }
        } catch (error) {
          console.error(`Failed to send receipt for order ${orderId}:`, error);
        }
      }
    }
    
    alert(`Sent ${successCount} of ${selectedOrders.length} receipts successfully!`);
    setSelectedOrders([]);
    setSending(false);
  };

  // Handle PDF download
  const handleDownloadPDF = async (order: Order) => {
    if (!isReceiptReady(order)) {
      alert('Receipt not available. Order payment not confirmed yet.');
      return;
    }

    setDownloadingId(order.id);
    try {
      // Open PDF in new tab or download
      const pdfUrl = `${BACKEND_URL}/api/receipts/download/${order.id}`;
      window.open(pdfUrl, '_blank');
    } catch (error) {
      console.error('Download error:', error);
      alert('Failed to download receipt. Please try again.');
    } finally {
      setDownloadingId(null);
    }
  };

  // Handle sending single receipt
  const handleSendReceipt = async (order: Order) => {
    if (!isReceiptReady(order)) {
      alert('Cannot send receipt. Order payment not confirmed yet.');
      return;
    }

    try {
      const response = await fetch(`${BACKEND_URL}/api/receipts/send/${order.id}`, {
        method: 'POST',
      });
      
      if (response.ok) {
        alert(`Receipt sent to ${order.user?.email}`);
      } else {
        alert('Failed to send receipt. Please try again.');
      }
    } catch (error) {
      console.error('Send error:', error);
      alert('Failed to send receipt.');
    }
  };

  const selectAll = () => {
    const selectableOrders = filteredOrders.filter(o => isReceiptReady(o));
    if (selectedOrders.length === selectableOrders.length) {
      setSelectedOrders([]);
    } else {
      setSelectedOrders(selectableOrders.map(o => o.id));
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-NG', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12">
          <div className="text-center text-red-600">
            <p>{error}</p>
            <button 
              onClick={fetchOrders}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  const sentCount = orders.filter(o => isReceiptReady(o)).length;
  const pendingCount = orders.filter(o => !isReceiptReady(o)).length;
  const selectableOrders = filteredOrders.filter(o => isReceiptReady(o));

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Receipts & Invoices</h1>
          <p className="text-gray-500 mt-1">Manage and send automated receipts to customers</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={fetchOrders}
            className="flex items-center space-x-2 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Refresh</span>
          </button>
          {selectedOrders.length > 0 && (
            <button
              onClick={handleBulkSend}
              disabled={sending}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              <span>{sending ? 'Sending...' : `Send ${selectedOrders.length} Receipts`}</span>
            </button>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Orders</p>
              <p className="text-2xl font-bold text-gray-900">{orders.length}</p>
            </div>
            <Receipt className="w-8 h-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Receipts Ready</p>
              <p className="text-2xl font-bold text-green-600">{sentCount}</p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-500" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Pending Payment</p>
              <p className="text-2xl font-bold text-yellow-600">{pendingCount}</p>
            </div>
            <Clock className="w-8 h-8 text-yellow-500" />
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search by order ID, customer name, or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Receipts Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-4 text-left">
                  <input 
                    type="checkbox" 
                    className="rounded border-gray-300"
                    checked={selectableOrders.length > 0 && selectedOrders.length === selectableOrders.length}
                    onChange={selectAll}
                  />
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Order ID</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Customer</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Amount</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Date</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Status</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredOrders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <input 
                      type="checkbox" 
                      className="rounded border-gray-300"
                      checked={selectedOrders.includes(order.id)}
                      onChange={() => toggleSelection(order.id)}
                      disabled={!isReceiptReady(order)}
                    />
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-medium text-gray-900">#{order.id.slice(0, 12)}...</p>
                    <p className="text-sm text-gray-500">{formatDate(order.createdAt)}</p>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {order.user?.firstName} {order.user?.lastName}
                      </p>
                      <p className="text-xs text-gray-500">{order.user?.email}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-medium text-gray-900">
                    ₦{order.totalAmount?.toLocaleString() || 0}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {formatDate(order.createdAt)}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center space-x-1 text-sm ${
                      isReceiptReady(order) ? 'text-green-600' : 'text-yellow-600'
                    }`}>
                      {isReceiptReady(order) ? (
                        <>
                          <CheckCircle className="w-4 h-4" />
                          <span>Paid / Receipt Ready</span>
                        </>
                      ) : (
                        <>
                          <Clock className="w-4 h-4" />
                          <span>Awaiting Payment</span>
                        </>
                      )}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      {isReceiptReady(order) && (
                        <>
                          <button
                            onClick={() => handleSendReceipt(order)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                            title="Send Receipt Email"
                          >
                            <Mail className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDownloadPDF(order)}
                            disabled={downloadingId === order.id}
                            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                            title="Download PDF"
                          >
                            {downloadingId === order.id ? (
                              <RefreshCw className="w-4 h-4 animate-spin" />
                            ) : (
                              <Download className="w-4 h-4" />
                            )}
                          </button>
                        </>
                      )}
                      {!isReceiptReady(order) && (
                        <span className="text-xs text-gray-400">Wait for payment</span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {filteredOrders.length === 0 && (
        <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-gray-100">
          <Receipt className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No orders found</p>
        </div>
      )}
    </div>
  );
}