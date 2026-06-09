'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { ArrowLeft, Trash2, CheckCircle, Clock, User, Mail, Phone, MapPin, Package, CreditCard, Calendar, Printer, Download } from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

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
  const receiptRef = useRef<HTMLDivElement>(null);
  
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [confirmingPayment, setConfirmingPayment] = useState(false);
  const [transactionRef, setTransactionRef] = useState('');
  const [generatingPDF, setGeneratingPDF] = useState(false);

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
        alert('Payment confirmed! Customer has been notified via email.');
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
    if (!confirm('Are you sure you want to delete this order? This action cannot be undone.')) {
      return;
    }

    setDeleting(true);
    try {
      const response = await fetch(`${BACKEND_URL}/api/orders/${orderId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        alert('Order deleted successfully');
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

  // Print Receipt
  const handlePrint = () => {
    window.print();
  };

  // Save as PDF
  const handleSaveAsPDF = async () => {
    if (!receiptRef.current) return;
    
    setGeneratingPDF(true);
    try {
      const canvas = await html2canvas(receiptRef.current, {
        scale: 2,
        backgroundColor: '#ffffff',
        logging: false,
        useCORS: true
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 210;
      const pageHeight = 297;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;
      
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
      
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }
      
      pdf.save(`FitTrust-Invoice-${order?.id?.slice(0, 8)}.pdf`);
      
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF. Please try again.');
    } finally {
      setGeneratingPDF(false);
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

  const formatDateShort = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-NG', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
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

  // Generate Invoice Number
  const invoiceNumber = order ? `FT-${order.id.slice(0, 8).toUpperCase()}` : '';

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
      {/* Header with Print/PDF Buttons */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 no-print">
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
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
          >
            <Printer className="w-4 h-4" />
            Print Invoice
          </button>
          <button
            onClick={handleSaveAsPDF}
            disabled={generatingPDF}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            {generatingPDF ? 'Generating...' : 'Save as PDF'}
          </button>
          <button
            onClick={handleDeleteOrder}
            disabled={deleting}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition disabled:opacity-50"
          >
            <Trash2 className="w-4 h-4" />
            {deleting ? 'Deleting...' : 'Delete Order'}
          </button>
        </div>
      </div>

      {/* Professional Branded Receipt/Invoice */}
      <div ref={receiptRef} className="receipt-container">
        <div className="bg-white rounded-2xl overflow-hidden shadow-lg border border-gray-100">
          
          {/* Header with Brand Colors */}
          <div className="bg-gradient-to-r from-teal-700 to-blue-800 px-8 py-10">
            <div className="flex justify-between items-start flex-wrap gap-4">
              <div>
                <h1 className="text-3xl font-bold text-white tracking-tight">FITTRUST MEDICALS</h1>
                <p className="text-teal-100 text-sm mt-2">Premium Healthcare Supplies</p>
              </div>
              <div className="text-right">
                <div className="bg-white/20 rounded-full px-4 py-1.5 inline-block">
                  <span className="text-yellow-300 text-sm font-semibold">TAX INVOICE</span>
                </div>
                <p className="text-white text-sm mt-3">
                  <strong>Invoice #:</strong> {invoiceNumber}<br />
                  <strong>Date:</strong> {formatDateShort(order.createdAt)}
                </p>
              </div>
            </div>
          </div>
          
          {/* Customer Info Section */}
          <div className="px-8 py-6 bg-gray-50 border-b border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 bg-teal-100 rounded-lg flex items-center justify-center">
                    <User className="w-4 h-4 text-teal-700" />
                  </div>
                  <h3 className="font-semibold text-gray-800">Bill To</h3>
                </div>
                <p className="font-medium text-gray-900">{customerName || 'N/A'}</p>
                <p className="text-sm text-gray-600">{order.user?.email || 'N/A'}</p>
                <p className="text-sm text-gray-600">{order.user?.phoneNumber || 'N/A'}</p>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 bg-teal-100 rounded-lg flex items-center justify-center">
                    <Package className="w-4 h-4 text-teal-700" />
                  </div>
                  <h3 className="font-semibold text-gray-800">Order Info</h3>
                </div>
                <p className="text-sm text-gray-600"><strong>Order ID:</strong> {order.id.slice(0, 12)}</p>
                <p className="text-sm text-gray-600"><strong>Payment Method:</strong> Bank Transfer</p>
                <p className="text-sm text-gray-600"><strong>Status:</strong> {order.paymentStatus === 'PAID' ? 'Paid' : 'Pending'}</p>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 bg-teal-100 rounded-lg flex items-center justify-center">
                    <Calendar className="w-4 h-4 text-teal-700" />
                  </div>
                  <h3 className="font-semibold text-gray-800">Dates</h3>
                </div>
                <p className="text-sm text-gray-600"><strong>Order Date:</strong> {formatDateShort(order.createdAt)}</p>
                {order.paidAt && (
                  <p className="text-sm text-gray-600"><strong>Paid Date:</strong> {formatDateShort(order.paidAt)}</p>
                )}
              </div>
            </div>
          </div>
          
          {/* Items Table */}
          <div className="px-8 py-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Order Summary</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b-2 border-gray-200 bg-gray-50">
                    <th className="text-left py-3 px-3 font-semibold text-gray-700">#</th>
                    <th className="text-left py-3 px-3 font-semibold text-gray-700">Product</th>
                    <th className="text-center py-3 px-3 font-semibold text-gray-700">Qty</th>
                    <th className="text-right py-3 px-3 font-semibold text-gray-700">Unit Price</th>
                    <th className="text-right py-3 px-3 font-semibold text-gray-700">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {order.items?.map((item, index) => (
                    <tr key={item.id} className="border-b border-gray-100">
                      <td className="py-3 px-3 text-gray-600">{index + 1}</td>
                      <td className="py-3 px-3 font-medium text-gray-800">{item.productName}</td>
                      <td className="text-center py-3 px-3 text-gray-600">{item.quantity}</td>
                      <td className="text-right py-3 px-3 text-gray-600">{formatNaira(item.unitPrice)}</td>
                      <td className="text-right py-3 px-3 font-medium text-teal-700">{formatNaira(item.unitPrice * item.quantity)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t-2 border-gray-200">
                    <td colSpan={4} className="text-right py-4 px-3 font-semibold text-gray-800">Subtotal:</td>
                    <td className="text-right py-4 px-3 font-semibold">{formatNaira(order.totalAmount)}</td>
                  </tr>
                  <tr>
                    <td colSpan={4} className="text-right py-2 px-3 text-gray-600">Shipping:</td>
                    <td className="text-right py-2 px-3 text-green-600 font-medium">FREE</td>
                  </tr>
                  <tr className="bg-teal-50">
                    <td colSpan={4} className="text-right py-4 px-3 text-xl font-bold text-teal-800">GRAND TOTAL:</td>
                    <td className="text-right py-4 px-3 text-2xl font-bold text-teal-700">{formatNaira(order.totalAmount)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
          
          {/* Notes Section */}
          <div className="px-8 py-6 bg-gray-50 border-t border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-gray-800 mb-2">Important Notes</h4>
                <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
                  <li>Please retain this invoice for future reference</li>
                  <li>Orders are processed within 24-48 hours after payment confirmation</li>
                  <li>Track your order status in your account dashboard</li>
                </ul>
              </div>
              <div className="text-right">
                <h4 className="font-semibold text-gray-800 mb-2">Quality Guaranteed</h4>
                <p className="text-sm text-gray-600">Thank you for choosing FitTrust Medicals</p>
                <p className="text-xs text-gray-500 mt-2">Authorized Signature: _________________</p>
              </div>
            </div>
          </div>
          
          {/* Footer */}
          <div className="bg-teal-800 px-8 py-4 text-center">
            <p className="text-teal-200 text-xs">
              &copy; {new Date().getFullYear()} FitTrust Medicals. All rights reserved.<br />
              Mai karami plaza opposite malam kato square | D81 47757392 - 08027934995 | www.fittrustmedicals.com
            </p>
          </div>
        </div>
      </div>

      {/* Admin Actions Section (Hidden when printing) */}
      {order.paymentStatus !== 'PAID' && (
        <Card className="p-6 no-print">
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
          </div>
        </Card>
      )}

      <style jsx global>{`
        @media print {
          .no-print {
            display: none !important;
          }
          body {
            margin: 0;
            padding: 0;
            background: white;
          }
          .receipt-container {
            margin: 0;
            padding: 0;
          }
          .receipt-container > div {
            box-shadow: none;
            border: none;
          }
        }
      `}</style>
    </div>
  );
}