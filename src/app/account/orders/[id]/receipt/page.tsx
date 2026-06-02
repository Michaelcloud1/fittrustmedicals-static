'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/stores/authStore';
import { ArrowLeft, Download, Printer } from 'lucide-react';
import { useRef } from 'react';

export default function ReceiptPage() {
  const params = useParams();
  const { getOrderById, customer } = useAuthStore();
  const order = getOrderById(params.id as string);
  const receiptRef = useRef<HTMLDivElement>(null);

  if (!order) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Order not found</p>
        <Link href="/account/orders" className="text-blue-600 hover:underline mt-2 inline-block">
          Back to Orders
        </Link>
      </div>
    );
  }

  const handlePrint = () => {
    window.print();
  };

  // ✅ ADD THIS FUNCTION FOR PDF DOWNLOAD
  const handleDownloadPDF = () => {
    // Use browser's print dialog which has "Save as PDF" option
    // This is the simplest solution without extra packages
    const originalTitle = document.title;
    document.title = `Receipt_${order.orderNumber}`;
    window.print();
    document.title = originalTitle;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center no-print">
        <Link href={`/account/orders/${order.id}`} className="flex items-center text-gray-600 hover:text-gray-900">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Order
        </Link>
        <div className="flex space-x-3">
          <button
            onClick={handlePrint}
            className="flex items-center space-x-2 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Printer className="w-4 h-4" />
            <span>Print</span>
          </button>
          <button
            onClick={handleDownloadPDF} // ✅ ADD THIS - connects the function
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Download PDF</span>
          </button>
        </div>
      </div>

      {/* Receipt */}
      <div ref={receiptRef} className="bg-white rounded-xl shadow-lg border border-gray-200 p-8 max-w-3xl mx-auto print:shadow-none print:border-none">
        {/* Header */}
        <div className="border-b pb-6 mb-6">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Fittrust Medicals</h1>
              <p className="text-gray-500">Receipt / Invoice</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">Order #{order.orderNumber}</p>
              <p className="text-sm text-gray-500">{new Date(order.createdAt).toLocaleDateString()}</p>
            </div>
          </div>
        </div>

        {/* Customer & Order Info */}
        <div className="grid grid-cols-2 gap-8 mb-6">
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">Bill To:</h3>
            <p className="text-gray-700">{customer?.name || order.user?.name}</p>
            <p className="text-gray-700">{customer?.email || order.user?.email}</p>
            <p className="text-gray-700">{customer?.phone}</p>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">Ship To:</h3>
            <p className="text-gray-700">{order.shippingAddress?.label || order.user?.name}</p>
            <p className="text-gray-700">{order.shippingAddress?.street}</p>
            <p className="text-gray-700">
              {order.shippingAddress?.city}, {order.shippingAddress?.state} {order.shippingAddress?.zipCode}
            </p>
          </div>
        </div>

        {/* Items Table */}
        <table className="w-full mb-6">
          <thead className="border-b">
            <tr>
              <th className="text-left py-2 font-semibold text-gray-900">Item</th>
              <th className="text-center py-2 font-semibold text-gray-900">Qty</th>
              <th className="text-right py-2 font-semibold text-gray-900">Price</th>
              <th className="text-right py-2 font-semibold text-gray-900">Total</th>
            </tr>
          </thead>
          <tbody>
            {order.items.map((item, index) => (
              <tr key={index} className="border-b">
                <td className="py-3 text-gray-700">{item.name}</td>
                <td className="py-3 text-center text-gray-700">{item.quantity}</td>
                <td className="py-3 text-right text-gray-700">₦{item.price.toLocaleString()}</td>
                <td className="py-3 text-right text-gray-700">₦{(item.quantity * item.price).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Totals */}
        <div className="flex justify-end mb-6">
          <div className="w-64 space-y-2">
            <div className="flex justify-between text-gray-600">
              <span>Subtotal</span>
              <span>₦{order.total.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Shipping</span>
              <span>Free</span>
            </div>
            <div className="flex justify-between text-lg font-bold text-gray-900 border-t pt-2">
              <span>Total</span>
              <span>₦{order.total.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t pt-6 text-center text-gray-500 text-sm">
          <p>Thank you for shopping with Fittrust Medicals!</p>
          <p className="mt-1">For questions, contact support@fittrustmedicals.com</p>
        </div>
      </div>

      <style jsx global>{`
        @media print {
          .no-print {
            display: none !important;
          }
          body {
            background: white;
          }
        }
      `}</style>
    </div>
  );
}