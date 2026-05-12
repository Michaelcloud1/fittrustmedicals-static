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

  // ✅ ADMIN'S ACCESS BANK DETAILS - HARDCODED
  const bankDetails: BankDetails = {
    bankName: 'Access Bank Nigeria',
    accountName: 'FITTRUST NIG LTD',
    accountNumber: ' 0039373686',
  };

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopied(field);
    setTimeout(() => setCopied(null), 2000);
  };

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
              <p className="text-sm font-semibold text-blue-800 mb-2">📝 Important Instructions:</p>
              <ul className="text-sm text-blue-700 space-y-1 list-disc list-inside">
                <li>Use your <strong>Order ID: FT-{orderId}</strong> as transaction reference</li>
                <li>Send the exact amount of <strong>₦{totalAmount.toLocaleString()}</strong></li>
                <li>Payment is processed instantly</li>
                <li>Your order will be confirmed within minutes</li>
                <li>After payment, send the transaction reference to our support</li>
              </ul>
            </div>

            {/* Order Info */}
            <div className="text-center text-sm text-gray-500 pt-2">
              <p>After payment, you will receive a confirmation email.</p>
              <p className="mt-1">Order ID: <strong className="font-mono">FT-{orderId}</strong></p>
            </div>

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