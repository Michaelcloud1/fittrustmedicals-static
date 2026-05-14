'use client';

import React, { useState } from 'react';

interface BankTransferDisplayProps {
  orderId: number;
  totalAmount: number;
  customerEmail: string;
  customerName: string;
}

interface BankDetails {
  bankName: string;
  accountName: string;
  accountNumber: string;
}

export default function BankTransferDisplay({ 
  orderId, 
  totalAmount, 
  customerEmail, 
  customerName 
}: BankTransferDisplayProps) {
  const [copied, setCopied] = useState<string | null>(null);
  const [notified, setNotified] = useState(false);
  const [loading, setLoading] = useState(false);

  const bankDetails: BankDetails = {
    bankName: 'Access Bank Nigeria',
    accountName: 'FITTRUST NIG LTD',
    accountNumber: '0039373686',
  };

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopied(field);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleIHavePaid = async () => {
    setLoading(true);
    try {
      // Send notification to admin with customer details
      const response = await fetch('/api/notify-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: `FT-${orderId}`,
          customerName,
          customerEmail,
          totalAmount,
        }),
      });

      if (response.ok) {
        // Clear the cart
        const cartStore = useCartStore.getState();
        cartStore.clearCart();
        
        // Also clear localStorage
        localStorage.removeItem('cart');
        localStorage.removeItem('cartItems');
        
        // Dispatch event to update cart UI
        window.dispatchEvent(new Event('cartUpdated'));
        
        setNotified(true);
        
        // Redirect to home page after 3 seconds
        setTimeout(() => {
          window.location.href = '/';
        }, 3000);
      } else {
        alert('Failed to notify admin. Please contact support.');
        setLoading(false);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Something went wrong. Please try again.');
      setLoading(false);
    }
  };

  // Show thank you page after notification
  if (notified) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Thank You for Your Payment!</h2>
          <p className="text-gray-600 mb-4">
            Dear {customerName}, your payment notification has been sent.
          </p>
          <div className="bg-gray-50 p-4 rounded-lg mb-4 text-left">
            <p className="font-semibold mb-2">Order Summary:</p>
            <p className="text-sm">Order ID: <strong>FT-{orderId}</strong></p>
            <p className="text-sm">Amount: <strong>₦{totalAmount.toLocaleString()}</strong></p>
            <p className="text-sm">Status: <span className="text-yellow-600">Pending Verification</span></p>
          </div>
          <p className="text-sm text-gray-500">
            The admin will contact you shortly for delivery confirmation.
          </p>
          <p className="text-xs text-gray-400 mt-4">
            Redirecting to home page...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-md mx-auto">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Header */}
          <div className="bg-green-600 px-6 py-4 text-center">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-3">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-white">Bank Transfer Payment</h1>
            <p className="text-green-100 mt-1">Pay directly to our bank account</p>
          </div>

          {/* Body */}
          <div className="p-6 space-y-4">
            {/* Amount */}
            <div className="bg-gray-50 p-4 rounded-lg text-center">
              <p className="text-sm text-gray-500 mb-1">Order Amount</p>
              <p className="text-3xl font-bold text-gray-900">₦{totalAmount.toLocaleString()}</p>
            </div>

            {/* Bank Details */}
            <div className="border border-gray-200 rounded-lg p-4 space-y-3">
              <div>
                <p className="text-sm text-gray-500 mb-1">Bank</p>
                <p className="font-semibold text-gray-900">{bankDetails.bankName}</p>
              </div>
              
              <div className="border-t pt-3">
                <p className="text-sm text-gray-500 mb-1">Account Name</p>
                <div className="flex justify-between items-center">
                  <p className="font-semibold text-gray-900">{bankDetails.accountName}</p>
                  <button
                    onClick={() => copyToClipboard(bankDetails.accountName, 'accountName')}
                    className="text-sm text-green-600 hover:text-green-800"
                  >
                    {copied === 'accountName' ? 'Copied!' : 'Copy'}
                  </button>
                </div>
              </div>
              
              <div className="border-t pt-3">
                <p className="text-sm text-gray-500 mb-1">Account Number</p>
                <div className="flex justify-between items-center">
                  <p className="font-mono font-bold text-2xl text-gray-900 tracking-wider">
                    {bankDetails.accountNumber}
                  </p>
                  <button
                    onClick={() => copyToClipboard(bankDetails.accountNumber, 'accountNumber')}
                    className="text-sm text-green-600 hover:text-green-800"
                  >
                    {copied === 'accountNumber' ? 'Copied!' : 'Copy'}
                  </button>
                </div>
              </div>
            </div>

            {/* Instructions */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm font-semibold text-blue-800 mb-2">📝 Instructions:</p>
              <ul className="text-sm text-blue-700 space-y-1 list-disc list-inside">
                <li>Use your <strong>Order ID: FT-{orderId}</strong> as transaction reference</li>
                <li>Send the exact amount of <strong>₦{totalAmount.toLocaleString()}</strong></li>
                <li>After payment, click <strong>"I Have Made the Payment"</strong> below</li>
                <li>The admin will contact you for delivery confirmation</li>
              </ul>
            </div>

            {/* Order Info */}
            <div className="text-center text-sm text-gray-500">
              Order ID: <strong className="font-mono">FT-{orderId}</strong>
            </div>

            {/* I Have Paid Button */}
            <button
              onClick={handleIHavePaid}
              disabled={loading}
              className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition disabled:opacity-50 font-semibold"
            >
              {loading ? 'Sending Notification...' : '✓ I Have Made the Payment'}
            </button>

            {/* Support Contact */}
            <div className="bg-gray-50 rounded-lg p-3 text-center text-xs text-gray-500">
              <p>Need help? Contact us: <strong>fittrustsurgical56@gmail.com</strong></p>
            </div>
          </div>
        </div>

        {/* Toast Message */}
        {copied && (
          <div className="fixed bottom-4 right-4 bg-gray-800 text-white px-4 py-2 rounded-lg shadow-lg">
            Copied to clipboard!
          </div>
        )}
      </div>
    </div>
  );
}