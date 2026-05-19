'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { ArrowLeft, Trash2, CheckCircle, XCircle, Clock, User, Mail, Phone, MapPin, Package, CreditCard, Calendar, Printer } from 'lucide-react';

interface OrderItem {
  id: string;
  productName: string;
  quantity: number;
  unitPrice: number;
}

interface Order {
  id: string;
  totalAmount: number;
  paymentStatus: string;
  orderStatus: string;
  paymentMethod: string;
  createdAt: string;
  paidAt?: string;
  transactionReference?: string;
  user: {
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
    address?: string;
  };
  items: OrderItem[];
  shippingAddress?: any;
}

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.id as string;
  
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [confirmingPayment, setConfirmingPayment] = useState(false);
  const [transactionRef, setTransactionRef] = useState('');

  const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://fittrustmedicals-backend.onrender.com';

  // Fetch order details
  const fetchOrder = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${BACKEND_URL}/api/orders`);
      const orders = await response.json();
      const foundOrder = orders.find((o: Order) => o.id === orderId);
      
      if (foundOrder) {
        setOrder(foundOrder);
      } else {
        setError('Order not found');
      }
    } catch (err) {
      console.error('Error fetching order:', err);
      setError('Failed to load order details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (orderId) {
      fetchOrder();
    }
  }, [orderId]);

  // Confirm payment
  const handleConfirmPayment = async () => {
    if (!transactionRef.trim()) {
      alert('Please enter the transaction reference');
      return;
    }

    setConfirmingPayment(true);
    try {
      const response = await fetch(`${BACKEND_URL}/api/admin/confirm-payment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, transactionReference: transactionRef }),
      });

      const data = await response.json();

      if (data.success) {
        alert('✅ Payment confirmed! Customer has been notified via email.');
        fetchOrder();
        setTransactionRef('');
      } else {
        alert(data.error || 'Failed to confirm payment');
      }
    } catch (err) {
      alert('Something went wrong');
    } finally {
      setConfirmingPayment(false);
    }
  };

  // Delete order
  const handleDeleteOrder = async () => {
    if (!confirm('⚠️ Are you sure you want to delete this order? This action cannot be undone.')) {
      return;
    }

    setDeleting(true);
    try {
      const response = await fetch(`${BACKEND_URL}/api/orders/${orderId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        alert('✅ Order deleted successfully');
        router.push('/admin/orders');
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to delete order');
      }
    } catch (err) {
      console.error('Delete error:', err);
      alert('Failed to delete order');
    } finally {
      setDeleting(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-NG', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatNaira = (price: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const getStatusBadge = () => {
    if (order?.paymentStatus === 'PAID') {
      return <Badge label="Paid" variant="success" />;
    }
    return <Badge label="Pending Payment" variant="warning" />;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="text-center py-12">
        <div className="text-red-600 text-lg mb-4">{error || 'Order not found'}</div>
        <Link href="/admin/orders">
          <Button variant="secondary">Back to Orders</Button>
        </Link>
      </div>
    );
  }

  const customerName = `${order.user?.firstName || ''} ${order.user?.lastName || ''}`.trim();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <Link href="/admin/orders">
            <button className="p-2 hover:bg-gray-100 rounded-lg transition">
              <ArrowLeft className="w-5 h-5" />
            </button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Order Details</h1>
            <p className="text-gray-500 text-sm">Order ID: {order.id.slice(0, 12)}...</p>
          </div>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleDeleteOrder}
            disabled={deleting}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition disabled:opacity-50"
          >
            <Trash2 className="w-4 h-4" />
            {deleting ? 'Deleting...' : 'Delete Order'}
          </button>
          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
          >
            <Printer className="w-4 h-4" />
            Print
          </button>
        </div>
      </div>

      {/* Order Status Banner */}
      <div className={`p-4 rounded-lg flex items-center justify-between ${
        order.paymentStatus === 'PAID' ? 'bg-green-50 border border-green-200' : 'bg-yellow-50 border border-yellow-200'
      }`}>
        <div className="flex items-center gap-3">
          {order.paymentStatus === 'PAID' ? (
            <CheckCircle className="w-6 h-6 text-green-600" />
          ) : (
            <Clock className="w-6 h-6 text-yellow-600" />
          )}
          <div>
            <p className="font-semibold">
              {order.paymentStatus === 'PAID' ? 'Payment Confirmed' : 'Awaiting Payment'}
            </p>
            <p className="text-sm text-gray-600">
              {order.paymentStatus === 'PAID' 
                ? `Payment confirmed on ${formatDate(order.paidAt || order.createdAt)}`
                : 'Please verify payment to confirm this order'}
            </p>
          </div>
        </div>
        {getStatusBadge()}
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Order Items & Payment Confirmation */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Items */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Package className="w-5 h-5" />
              Order Items
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b">
                  <tr>
                    <th className="text-left py-3 px-2 font-medium text-gray-600">Product</th>
                    <th className="text-center py-3 px-2 font-medium text-gray-600">Qty</th>
                    <th className="text-right py-3 px-2 font-medium text-gray-600">Unit Price</th>
                    <th className="text-right py-3 px-2 font-medium text-gray-600">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {order.items?.map((item) => (
                    <tr key={item.id} className="border-b">
                      <td className="py-3 px-2">{item.productName}</td>
                      <td className="text-center py-3 px-2">{item.quantity}</td>
                      <td className="text-right py-3 px-2">{formatNaira(item.unitPrice)}</td>
                      <td className="text-right py-3 px-2 font-medium">{formatNaira(item.unitPrice * item.quantity)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t">
                    <td colSpan={3} className="text-right py-3 px-2 font-semibold">Total:</td>
                    <td className="text-right py-3 px-2 font-bold text-lg">{formatNaira(order.totalAmount)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </Card>

          {/* Payment Confirmation Section (Only for pending orders) */}
          {order.paymentStatus !== 'PAID' && (
            <Card className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <CreditCard className="w-5 h-5" />
                Confirm Payment
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Transaction Reference
                  </label>
                  <input
                    type="text"
                    value={transactionRef}
                    onChange={(e) => setTransactionRef(e.target.value)}
                    placeholder="Enter the transaction reference from bank alert"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <button
                  onClick={handleConfirmPayment}
                  disabled={confirmingPayment}
                  className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {confirmingPayment ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  ) : (
                    <CheckCircle className="w-4 h-4" />
                  )}
                  {confirmingPayment ? 'Confirming...' : 'Confirm Payment'}
                </button>
                <p className="text-xs text-gray-500 text-center">
                  Bank: Access Bank Nigeria | Account: FITTRUST NIG LTD | Number: 0039373686
                </p>
              </div>
            </Card>
          )}
        </div>

        {/* Right Column - Customer & Order Info */}
        <div className="space-y-6">
          {/* Customer Information */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <User className="w-5 h-5" />
              Customer Information
            </h2>
            <div className="space-y-3">
              <div className="flex items-start gap-2">
                <User className="w-4 h-4 text-gray-400 mt-0.5" />
                <div>
                  <p className="font-medium">{customerName || 'N/A'}</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Mail className="w-4 h-4 text-gray-400 mt-0.5" />
                <p className="text-sm">{order.user?.email || 'N/A'}</p>
              </div>
              <div className="flex items-start gap-2">
                <Phone className="w-4 h-4 text-gray-400 mt-0.5" />
                <p className="text-sm">{order.user?.phoneNumber || 'N/A'}</p>
              </div>
              {order.shippingAddress && (
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
                  <p className="text-sm">{JSON.stringify(order.shippingAddress)}</p>
                </div>
              )}
            </div>
          </Card>

          {/* Order Information */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Order Information
            </h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Order ID:</span>
                <span className="font-mono text-sm">{order.id.slice(0, 12)}...</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Order Date:</span>
                <span>{formatDate(order.createdAt)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Payment Method:</span>
                <span>{order.paymentMethod || 'Bank Transfer'}</span>
              </div>
              {order.paidAt && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Paid Date:</span>
                  <span>{formatDate(order.paidAt)}</span>
                </div>
              )}
              {order.transactionReference && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Transaction Ref:</span>
                  <span className="font-mono text-xs">{order.transactionReference}</span>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}