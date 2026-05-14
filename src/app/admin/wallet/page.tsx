'use client';

import { useState, useEffect } from 'react';
import { 
  Wallet, 
  ArrowUpRight, 
  ArrowDownRight, 
  Building2, 
  Plus,
  History,
  CreditCard,
  CheckCircle,
  Clock,
  XCircle,
  Download,
  RefreshCw,
  Eye,
  EyeOff,
  Banknote,
  Trash2,
  AlertCircle,
  Loader2
} from 'lucide-react';

interface BankAccount {
  id: string;
  bankName: string;
  accountNumber: string;
  accountName: string;
  isDefault: boolean;
}

interface WithdrawalRequest {
  id: string;
  amount: number;
  bankAccountId: string;
  status: string;
  requestedAt: string;
  processedAt?: string;
}

export default function AdminWalletPage() {
  const [balance, setBalance] = useState(0);
  const [totalEarned, setTotalEarned] = useState(0);
  const [totalWithdrawn, setTotalWithdrawn] = useState(0);
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [pendingWithdrawals, setPendingWithdrawals] = useState<WithdrawalRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showBalance, setShowBalance] = useState(true);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [showAddBankModal, setShowAddBankModal] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [selectedBankId, setSelectedBankId] = useState('');
  const [error, setError] = useState('');
  const [withdrawLoading, setWithdrawLoading] = useState(false);
  const [addBankLoading, setAddBankLoading] = useState(false);
  
  const [bankForm, setBankForm] = useState({
    bankName: '',
    accountNumber: '',
    accountName: '',
  });

  const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://fittrustmedicals-backend.onrender.com';

  // Fetch wallet data
  const fetchWalletData = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/admin/wallet`);
      if (!response.ok) throw new Error('Failed to fetch wallet');
      const data = await response.json();
      setBalance(data.availableBalance || 0);
      setTotalEarned(data.totalEarned || 0);
      setTotalWithdrawn(data.totalWithdrawn || 0);
    } catch (error) {
      console.error('Error fetching wallet:', error);
    }
  };

  // Fetch bank accounts (from your API - you may need to create this endpoint)
  const fetchBankAccounts = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/admin/bank-accounts`);
      if (response.ok) {
        const data = await response.json();
        setBankAccounts(data);
      } else {
        // Fallback to mock if endpoint doesn't exist yet
        setBankAccounts([
          {
            id: '1',
            bankName: 'Access Bank',
            accountNumber: '0039373686',
            accountName: 'FITTRUST NIG LTD',
            isDefault: true,
          },
        ]);
      }
    } catch (error) {
      console.error('Error fetching bank accounts:', error);
    }
  };

  // Fetch transactions (from orders)
  const fetchTransactions = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/orders`);
      if (!response.ok) throw new Error('Failed to fetch orders');
      const orders = await response.json();
      
      // Convert orders to transaction format
      const txns = orders.flatMap((order: any) => {
        const transactionsList = [];
        
        // Credit transaction (when order is paid)
        if (order.paymentStatus === 'PAID') {
          transactionsList.push({
            id: `${order.id}_credit`,
            type: 'credit',
            amount: order.totalAmount,
            status: 'completed',
            description: `Order #${order.id.slice(0, 8)} - Customer payment`,
            createdAt: order.paidAt || order.createdAt,
            reference: order.transactionReference,
            customerEmail: order.user?.email,
          });
        }
        
        return transactionsList;
      });
      
      // Sort by date descending
      txns.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setTransactions(txns);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    }
  };

  // Fetch pending withdrawals
  const fetchPendingWithdrawals = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/admin/withdrawals/pending`);
      if (response.ok) {
        const data = await response.json();
        setPendingWithdrawals(data);
      } else {
        setPendingWithdrawals([]);
      }
    } catch (error) {
      console.error('Error fetching pending withdrawals:', error);
    }
  };

  const refreshAllData = async () => {
    setRefreshing(true);
    await Promise.all([
      fetchWalletData(),
      fetchBankAccounts(),
      fetchTransactions(),
      fetchPendingWithdrawals(),
    ]);
    setRefreshing(false);
  };

  useEffect(() => {
    refreshAllData();
    // Refresh every 30 seconds
    const interval = setInterval(refreshAllData, 30000);
    return () => clearInterval(interval);
  }, []);

  // Request withdrawal
  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const amount = parseFloat(withdrawAmount);
    
    if (isNaN(amount) || amount <= 0) {
      setError('Please enter a valid amount');
      return;
    }
    
    if (amount > balance) {
      setError(`Insufficient balance. Available: ₦${balance.toLocaleString()}`);
      return;
    }
    
    if (!selectedBankId) {
      setError('Please select a bank account');
      return;
    }

    setWithdrawLoading(true);
    try {
      const response = await fetch(`${BACKEND_URL}/api/admin/withdraw`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount,
          bankAccountId: selectedBankId,
        }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        setShowWithdrawModal(false);
        setWithdrawAmount('');
        setSelectedBankId('');
        alert('Withdrawal request submitted successfully!');
        refreshAllData();
      } else {
        setError(data.error || 'Withdrawal failed. Please try again.');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setWithdrawLoading(false);
    }
  };

  // Add bank account
  const handleAddBank = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!bankForm.bankName || !bankForm.accountNumber || !bankForm.accountName) {
      setError('Please fill all fields');
      return;
    }

    setAddBankLoading(true);
    try {
      const response = await fetch(`${BACKEND_URL}/api/admin/bank-accounts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...bankForm,
          isDefault: bankAccounts.length === 0,
        }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        setShowAddBankModal(false);
        setBankForm({ bankName: '', accountNumber: '', accountName: '' });
        refreshAllData();
        alert('Bank account added successfully!');
      } else {
        setError(data.error || 'Failed to add bank account');
      }
    } catch (err) {
      setError('Failed to add bank account');
    } finally {
      setAddBankLoading(false);
    }
  };

  // Remove bank account
  const handleRemoveBank = async (accountId: string) => {
    if (confirm('Are you sure you want to remove this bank account?')) {
      try {
        await fetch(`${BACKEND_URL}/api/admin/bank-accounts/${accountId}`, {
          method: 'DELETE',
        });
        refreshAllData();
      } catch (error) {
        console.error('Error removing bank account:', error);
      }
    }
  };

  const exportTransactions = () => {
    if (!transactions || transactions.length === 0) {
      alert('No transactions to export');
      return;
    }
    
    const csv = [
      ['Date', 'Description', 'Type', 'Amount', 'Status', 'Reference', 'Customer Email'],
      ...transactions.map(t => [
        new Date(t.createdAt).toLocaleString(),
        t.description,
        t.type,
        t.amount,
        t.status,
        t.reference || '',
        t.customerEmail || ''
      ])
    ].map(row => row.join(',')).join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `transactions-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'failed':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading && transactions.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  const pendingWithdrawalsAmount = pendingWithdrawals.reduce((sum, w) => sum + w.amount, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Wallet & Payments</h1>
          <p className="text-gray-500 mt-1">Manage payments, withdrawals, and bank accounts</p>
        </div>
        <button
          onClick={refreshAllData}
          disabled={refreshing}
          className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Wallet Balance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-200 text-sm">Available Balance</p>
              <div className="flex items-center gap-2">
                <p className="text-3xl font-bold">
                  {showBalance ? `₦${balance.toLocaleString()}` : '••••••'}
                </p>
                <button onClick={() => setShowBalance(!showBalance)} className="hover:bg-white/20 p-1 rounded">
                  {showBalance ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <Wallet className="w-10 h-10 text-blue-200 opacity-80" />
          </div>
          <button
            onClick={() => setShowWithdrawModal(true)}
            disabled={balance === 0}
            className="mt-4 w-full py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg font-medium transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Withdraw Funds
          </button>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Total Earned</p>
              <p className="text-2xl font-bold text-gray-900">₦{totalEarned.toLocaleString()}</p>
            </div>
            <div className="p-3 bg-green-50 rounded-lg">
              <ArrowDownRight className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <p className="text-xs text-gray-400 mt-2">Lifetime earnings</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Total Withdrawn</p>
              <p className="text-2xl font-bold text-gray-900">₦{totalWithdrawn.toLocaleString()}</p>
            </div>
            <div className="p-3 bg-orange-50 rounded-lg">
              <ArrowUpRight className="w-6 h-6 text-orange-600" />
            </div>
          </div>
          <p className="text-xs text-gray-400 mt-2">Withdrawn to bank</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Pending Withdrawals</p>
              <p className="text-2xl font-bold text-yellow-600">₦{pendingWithdrawalsAmount.toLocaleString()}</p>
            </div>
            <div className="p-3 bg-yellow-50 rounded-lg">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
          <p className="text-xs text-gray-400 mt-2">Awaiting processing</p>
        </div>
      </div>

      {/* Bank Accounts Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center">
            <Building2 className="w-5 h-5 mr-2 text-blue-600" />
            Bank Accounts
          </h2>
          <button
            onClick={() => setShowAddBankModal(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            <Plus className="w-4 h-4" />
            <span>Add Account</span>
          </button>
        </div>

        {bankAccounts.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Banknote className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>No bank accounts added yet</p>
            <p className="text-sm">Add a bank account to withdraw funds</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {bankAccounts.map((account) => (
              <div
                key={account.id}
                className={`p-4 border rounded-lg transition ${
                  account.isDefault ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-blue-300'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-gray-900">{account.bankName}</p>
                      {account.isDefault && (
                        <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full">
                          Default
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{account.accountName}</p>
                    <p className="text-sm font-mono text-gray-700 mt-1">
                      ••••{account.accountNumber.slice(-4)}
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleRemoveBank(account.id)}
                      className="text-xs text-red-600 hover:underline"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Pending Withdrawals */}
      {pendingWithdrawals.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-yellow-800 mb-4 flex items-center">
            <Clock className="w-5 h-5 mr-2" />
            Pending Withdrawals ({pendingWithdrawals.length})
          </h2>
          <div className="space-y-3">
            {pendingWithdrawals.map((withdrawal) => {
              const bank = bankAccounts.find(b => b.id === withdrawal.bankAccountId);
              return (
                <div key={withdrawal.id} className="flex justify-between items-center p-4 bg-white rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">₦{withdrawal.amount.toLocaleString()}</p>
                    <p className="text-sm text-gray-500">
                      To: {bank?.bankName} • {bank?.accountName}
                    </p>
                    <p className="text-xs text-gray-400">Requested: {new Date(withdrawal.requestedAt).toLocaleDateString()}</p>
                  </div>
                  <span className="px-3 py-1 bg-yellow-100 text-yellow-700 text-sm rounded-full">
                    {withdrawal.status}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Transaction History */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center">
            <History className="w-5 h-5 mr-2 text-blue-600" />
            Transaction History
          </h2>
          {transactions.length > 0 && (
            <button
              onClick={exportTransactions}
              className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 transition"
            >
              <Download className="w-4 h-4" />
              <span className="text-sm">Export CSV</span>
            </button>
          )}
        </div>

        <div className="space-y-3">
          {transactions.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <CreditCard className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>No transactions yet</p>
              <p className="text-sm">Your payment history will appear here</p>
            </div>
          ) : (
            transactions.slice(0, 20).map((txn) => (
              <div key={txn.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
                <div className="flex items-center space-x-4">
                  <div className={`p-2 rounded-lg ${
                    txn.type === 'credit' ? 'bg-green-100' : 'bg-orange-100'
                  }`}>
                    {txn.type === 'credit' ? (
                      <ArrowDownRight className="w-5 h-5 text-green-600" />
                    ) : (
                      <ArrowUpRight className="w-5 h-5 text-orange-600" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{txn.description}</p>
                    <p className="text-sm text-gray-500">
                      {new Date(txn.createdAt).toLocaleString()}
                    </p>
                    {txn.customerEmail && (
                      <p className="text-xs text-gray-400">Customer: {txn.customerEmail}</p>
                    )}
                    {txn.reference && (
                      <p className="text-xs text-gray-400 font-mono">Ref: {txn.reference}</p>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-bold ${
                    txn.type === 'credit' ? 'text-green-600' : 'text-orange-600'
                  }`}>
                    {txn.type === 'credit' ? '+' : '-'}₦{txn.amount.toLocaleString()}
                  </p>
                  <div className="flex items-center justify-end space-x-1 mt-1">
                    {getStatusIcon(txn.status)}
                    <span className={`text-xs px-2 py-0.5 rounded-full ${getStatusColor(txn.status)}`}>
                      {txn.status}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Withdraw Modal */}
      {showWithdrawModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Withdraw Funds</h3>
            
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700 text-sm">
                <AlertCircle className="w-4 h-4" />
                {error}
              </div>
            )}

            <form onSubmit={handleWithdraw}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Amount (Available: ₦{balance.toLocaleString()})
                </label>
                <input
                  type="number"
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  max={balance}
                  min="1000"
                  step="1000"
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter amount (min ₦1,000)"
                  required
                />
              </div>
              
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Bank Account
                </label>
                <select
                  value={selectedBankId}
                  onChange={(e) => setSelectedBankId(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select account</option>
                  {bankAccounts.map((account) => (
                    <option key={account.id} value={account.id}>
                      {account.bankName} - {account.accountName} ({account.isDefault ? 'Default' : ''})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={() => setShowWithdrawModal(false)}
                  className="flex-1 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={withdrawLoading}
                  className="flex-1 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
                >
                  {withdrawLoading ? 'Processing...' : 'Withdraw'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Bank Modal */}
      {showAddBankModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Add Bank Account</h3>
            
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700 text-sm">
                <AlertCircle className="w-4 h-4" />
                {error}
              </div>
            )}

            <form onSubmit={handleAddBank}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Bank Name</label>
                <input
                  type="text"
                  value={bankForm.bankName}
                  onChange={(e) => setBankForm({ ...bankForm, bankName: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., First Bank"
                  required
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Account Number</label>
                <input
                  type="text"
                  value={bankForm.accountNumber}
                  onChange={(e) => setBankForm({ ...bankForm, accountNumber: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="10 digit account number"
                  maxLength={10}
                  required
                />
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Account Name</label>
                <input
                  type="text"
                  value={bankForm.accountName}
                  onChange={(e) => setBankForm({ ...bankForm, accountName: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Account holder name"
                  required
                />
              </div>

              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={() => setShowAddBankModal(false)}
                  className="flex-1 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={addBankLoading}
                  className="flex-1 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
                >
                  {addBankLoading ? 'Adding...' : 'Add Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}