'use client';

import React, { useState } from 'react';

interface BankTransferDisplayProps {
  orderId: number;
  totalAmount: number;
  customerEmail: string;  // This is the customer's email from checkout
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
  const [error, setError] = useState<string | null>(null);

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
    setError(null);
    
    console.log('Sending notification with:', {
      orderId: `FT-${orderId}`,
      customerName,
      customerEmail,  // Verify this has the correct email
      totalAmount,
    });

    try {
      const response = await fetch('/api/notify-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: `FT-${orderId}`,
          customerName,
          customerEmail,  // This should be the customer's email from checkout
          totalAmount,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setNotified(true);
        
        // Clear cart
        localStorage.removeItem('cart');
        localStorage.removeItem('cartItems');
        window.dispatchEvent(new Event('cartUpdated'));
        
        // Redirect to home after 3 seconds
        setTimeout(() => {
          window.location.href = '/';
        }, 3000);
      } else {
        setError(data.error || 'Failed to send notification');
        setLoading(false);
      }
    } catch (error) {
      console.error('Error:', error);
      setError('Something went wrong. Please try again.');
      setLoading(false);
    }
  };

  // Thank you page after notification
  if (notified) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Payment Notification Sent!</h2>
          <p className="text-gray-600 mb-4">
            Dear {customerName}, we have sent a payment notification to our admin.
          </p>
          <p className="text-sm text-gray-500">
            A confirmation email has been sent to <strong>{customerEmail}</strong>
          </p>
          <div className="bg-gray-50 p-4 rounded-lg mb-4 text-left mt-4">
            <p className="font-semibold mb-2">Order Summary:</p>
            <p className="text-sm">Order ID: <strong>FT-{orderId}</strong></p>
            <p className="text-sm">Amount: <strong>₦{totalAmount.toLocaleString()}</strong></p>
            <p className="text-sm">Status: <span className="text-yellow-600">Pending Verification</span></p>
          </div>
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
              </ul>
            </div>

            <div className="text-center text-sm text-gray-500">
              Order ID: <strong className="font-mono">FT-{orderId}</strong>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-center text-sm text-red-700">
                {error}
              </div>
            )}

            <button
              onClick={handleIHavePaid}
              disabled={loading}
              className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition disabled:opacity-50 font-semibold"
            >
              {loading ? 'Sending Notification...' : '✓ I Have Made the Payment'}
            </button>

            <div className="bg-gray-50 rounded-lg p-3 text-center text-xs text-gray-500">
              <p>Need help? Contact us: <strong>fittrustsurgical56@gmail.com</strong></p>
            </div>
          </div>
        </div>

        {copied && (
          <div className="fixed bottom-4 right-4 bg-gray-800 text-white px-4 py-2 rounded-lg shadow-lg">
            Copied to clipboard!
          </div>
        )}
      </div>
    </div>
  );
}