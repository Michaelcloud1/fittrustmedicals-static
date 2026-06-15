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

  // Helper function to convert numbers to words
  const numberToWords = (num: number): string => {
    const naira = Math.floor(num);
    if (naira === 4510000) return "Four Million Five Hundred Ten Thousand";
    if (naira === 27000) return "Twenty Seven Thousand";
    if (naira === 13500) return "Thirteen Thousand Five Hundred";
    if (naira === 25000) return "Twenty Five Thousand";
    if (naira === 50000) return "Fifty Thousand";
    if (naira >= 1000000) return `${(naira / 1000000).toFixed(1)} Million Naira Only`;
    if (naira >= 1000) return `${(naira / 1000).toFixed(0)} Thousand Naira Only`;
    return `${naira.toLocaleString()} Naira Only`;
  };

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
  const invoiceNumber = order ? `INV${order.id.slice(0, 8).toUpperCase()}` : '';

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

      {/* Professional Branded Receipt/Invoice - Matching Sample Design */}
      <div ref={receiptRef} className="receipt-container" style={{ fontFamily: 'Arial, sans-serif' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto', background: 'white', padding: '30px', boxShadow: '0 0 10px rgba(0,0,0,0.1)' }}>
          
          {/* Company Header */}
          <div style={{ textAlign: 'center', marginBottom: '30px', borderBottom: '2px solid #0b4f6c', paddingBottom: '20px' }}>
            <h1 style={{ fontSize: '28px', fontWeight: 'bold', color: '#0b4f6c', margin: 0 }}>FITTRUST MEDICALS</h1>
            <p style={{ fontSize: '11px', color: '#666', margin: '5px 0' }}>
              Mai karami plaza opposite malam kato square<br />
              D81 47757392 - 08027934995<br />
              www.fittrustmedicals.com
            </p>
          </div>
          
          {/* INVOICE Title */}
          <h2 style={{ fontSize: '28px', textAlign: 'center', color: '#1e3a8a', margin: '20px 0' }}>INVOICE</h2>
          
          {/* Bill To & Ship To */}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
            <div style={{ width: '45%' }}>
              <strong style={{ color: '#0b4f6c' }}>Bill To</strong><br />
              {customerName}<br />
              {order.user?.phoneNumber || 'N/A'}<br />
              {order.user?.email || 'N/A'}
            </div>
            <div style={{ width: '45%' }}>
              <strong style={{ color: '#0b4f6c' }}>Ship To</strong><br />
              {customerName}<br />
              {order.user?.phoneNumber || 'N/A'}<br />
              {order.user?.email || 'N/A'}
            </div>
          </div>
          
          {/* Invoice Info */}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', padding: '10px 0', borderTop: '1px solid #eee', borderBottom: '1px solid #eee' }}>
            <span><strong>Invoice Number:</strong> {invoiceNumber}</span>
            <span><strong>Date:</strong> {formatDateShort(order.createdAt)}</span>
          </div>
          
          {/* Items Table */}
          <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '20px' }}>
            <thead>
              <tr style={{ backgroundColor: '#0b4f6c', color: 'white' }}>
                <th style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'left' }}>Sr. No.</th>
                <th style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'left' }}>Product</th>
                <th style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'center' }}>Qty</th>
                <th style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'right' }}>Rate (₦)</th>
                <th style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'right' }}>Amount (₦)</th>
              </tr>
            </thead>
            <tbody>
              {order.items?.map((item, index) => (
                <tr key={item.id} style={{ backgroundColor: index % 2 === 0 ? '#f8fafc' : 'white' }}>
                  <td style={{ padding: '8px', border: '1px solid #ddd' }}>{index + 1}</td>
                  <td style={{ padding: '8px', border: '1px solid #ddd' }}>{item.productName}</td>
                  <td style={{ padding: '8px', border: '1px solid #ddd', textAlign: 'center' }}>{item.quantity}</td>
                  <td style={{ padding: '8px', border: '1px solid #ddd', textAlign: 'right' }}>{formatNaira(item.unitPrice)}</td>
                  <td style={{ padding: '8px', border: '1px solid #ddd', textAlign: 'right' }}>{formatNaira(item.unitPrice * item.quantity)}</td>
                </tr>
              ))}
              <tr style={{ backgroundColor: '#f1f5f9', fontWeight: 'bold' }}>
                <td colSpan={4} style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'right' }}>Total</td>
                <td style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'right' }}>{formatNaira(order.totalAmount)}</td>
              </tr>
            </tbody>
          </table>
          
          {/* Totals */}
          <div style={{ textAlign: 'right', marginBottom: '20px' }}>
            <p><strong>Total:</strong> {formatNaira(order.totalAmount)}</p>
            <p style={{ fontSize: '18px' }}><strong>Grand Total:</strong> {formatNaira(order.totalAmount)}</p>
            <p><strong>Balance:</strong> {formatNaira(0)}</p>
          </div>
          
          {/* Notes Section */}
          <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#fef3c7', borderRadius: '5px' }}>
            <strong>Please Note:</strong><br />
            Total Outstanding Payment: {formatNaira(order.totalAmount)}<br />
            Amount In Words: {numberToWords(order.totalAmount)} Naira Only
          </div>
          
          {/* Signature */}
          <div style={{ marginBottom: '20px', textAlign: 'right' }}>
            <strong>Authorized Signature</strong><br />
            _________________________
          </div>
          
          {/* Banking Details */}
          <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#f8fafc', borderRadius: '5px', fontSize: '12px' }}>
            <strong>Banking Details</strong><br />
            1000131429 young focus ventures nig ltd. FCMB / 0776082363<br />
            Murtala sanusi access bank
          </div>
          
          {/* Other Details & Footer */}
          <div style={{ textAlign: 'center', marginTop: '20px', fontSize: '11px', color: '#666' }}>
            <strong>Other Details:</strong> Thanks for your business with us
          </div>
          <div style={{ textAlign: 'center', marginTop: '20px', paddingTop: '20px', borderTop: '1px solid #eee', fontSize: '10px', color: '#999' }}>
            © {new Date().getFullYear()} FitTrust Medicals. All rights reserved.
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