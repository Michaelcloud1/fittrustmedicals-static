'use client';

import { useEffect, useState } from 'react';
import WithdrawModal from '@/components/admin/WithdrawModal';

interface DashboardStats {
  totalProducts: number;
  totalOrders: number;
  totalSales: number;
  activeStaff: number;
}

interface WalletData {
  availableBalance: number;
  totalEarned: number;
  totalWithdrawn: number;
}

interface Order {
  id: string;
  totalAmount: number;
  paymentStatus: string;
  orderStatus: string;
  createdAt: string;
  user: {
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
  };
  items: Array<{
    productName: string;
    quantity: number;
    unitPrice: number;
  }>;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalProducts: 0,
    totalOrders: 0,
    totalSales: 0,
    activeStaff: 0,
  });
  const [wallet, setWallet] = useState<WalletData>({
    availableBalance: 0,
    totalEarned: 0,
    totalWithdrawn: 0,
  });
  const [pendingOrders, setPendingOrders] = useState<Order[]>([]);
  const [allOrders, setAllOrders] = useState<Order[]>([]);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [confirmingOrderId, setConfirmingOrderId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'pending' | 'all'>('pending');

  // Get backend URL from environment
  const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://fittrustmedicals-backend.onrender.com';

  // Fetch wallet data
  const fetchWallet = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/admin/wallet`);
      const data = await response.json();
      setWallet(data);
    } catch (error) {
      console.error('Failed to fetch wallet:', error);
    }
  };

  // Fetch all orders (pending + all)
  const fetchOrders = async () => {
    try {
      // Fetch pending orders
      const pendingRes = await fetch(`${BACKEND_URL}/api/orders?status=PENDING`);
      const pendingData = await pendingRes.json();
      setPendingOrders(pendingData);

      // Fetch all orders
      const allRes = await fetch(`${BACKEND_URL}/api/orders`);
      const allData = await allRes.json();
      setAllOrders(allData);

      // Update stats based on real data
      const totalOrders = allData.length;
      const totalSales = allData
        .filter((order: Order) => order.paymentStatus === 'PAID')
        .reduce((sum: number, order: Order) => sum + order.totalAmount, 0);

      setStats(prev => ({
        ...prev,
        totalOrders: totalOrders,
        totalSales: totalSales,
      }));
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWallet();
    fetchOrders();
    // Refresh every 30 seconds
    const interval = setInterval(() => {
      fetchWallet();
      fetchOrders();
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleConfirmPayment = async (orderId: string, transactionReference: string) => {
    setConfirmingOrderId(orderId);
    
    try {
      const response = await fetch(`${BACKEND_URL}/api/admin/confirm-payment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, transactionReference }),
      });

      const data = await response.json();

      if (data.success) {
        alert('✅ Payment confirmed! Customer has been notified via email.');
        await fetchOrders();
        await fetchWallet();
      } else {
        alert(data.error || 'Failed to confirm payment.');
      }
    } catch (error) {
      console.error('Confirmation error:', error);
      alert('Something went wrong. Please try again.');
    } finally {
      setConfirmingOrderId(null);
    }
  };

  const handleWithdraw = (amount: number) => {
    fetchWallet();
    alert(`✅ Withdrawal of ₦${amount.toLocaleString()} recorded successfully!`);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white p-6 rounded-lg shadow">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
        <div className="text-sm text-gray-500">
          Last updated: {new Date().toLocaleString()}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600">Total Products</p>
              <p className="text-3xl font-bold text-gray-900">{stats.totalProducts}</p>
            </div>
            <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center">
              <span className="text-white text-xl">📦</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600">Total Orders</p>
              <p className="text-3xl font-bold text-gray-900">{stats.totalOrders}</p>
            </div>
            <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center">
              <span className="text-white text-xl">🛒</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600">Total Sales</p>
              <p className="text-3xl font-bold text-gray-900">₦{stats.totalSales.toLocaleString()}</p>
            </div>
            <div className="w-12 h-12 bg-yellow-500 rounded-lg flex items-center justify-center">
              <span className="text-white text-xl">💰</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600">Active Staff</p>
              <p className="text-3xl font-bold text-gray-900">{stats.activeStaff}</p>
            </div>
            <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center">
              <span className="text-white text-xl">👥</span>
            </div>
          </div>
        </div>
      </div>

      {/* Wallet Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-lg shadow p-6 text-white">
          <h3 className="text-white/80 text-sm">Available Balance</h3>
          <p className="text-3xl font-bold">₦{wallet.availableBalance.toLocaleString()}</p>
          <button
            onClick={() => setShowWithdrawModal(true)}
            className="mt-3 bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
          >
            Withdraw Funds →
          </button>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-gray-500 text-sm">Total Earned</h3>
          <p className="text-2xl font-bold text-gray-900">₦{wallet.totalEarned.toLocaleString()}</p>
          <p className="text-xs text-gray-400 mt-2">Lifetime earnings</p>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-gray-500 text-sm">Total Withdrawn</h3>
          <p className="text-2xl font-bold text-gray-900">₦{wallet.totalWithdrawn.toLocaleString()}</p>
          <p className="text-xs text-gray-400 mt-2">Withdrawn to bank</p>
        </div>
      </div>

      {/* Orders Tabs */}
      <div className="bg-white rounded-lg shadow">
        <div className="border-b">
          <div className="flex">
            <button
              onClick={() => setActiveTab('pending')}
              className={`px-6 py-3 text-sm font-medium ${
                activeTab === 'pending'
                  ? 'border-b-2 border-green-500 text-green-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Pending Orders ({pendingOrders.length})
            </button>
            <button
              onClick={() => setActiveTab('all')}
              className={`px-6 py-3 text-sm font-medium ${
                activeTab === 'all'
                  ? 'border-b-2 border-green-500 text-green-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              All Orders ({allOrders.length})
            </button>
          </div>
        </div>

        {/* Pending Orders Tab */}
        {activeTab === 'pending' && (
          <div className="divide-y">
            {pendingOrders.length === 0 ? (
              <div className="p-6 text-center text-gray-500">
                No pending orders
              </div>
            ) : (
              pendingOrders.map((order) => (
                <div key={order.id} className="p-6">
                  <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-semibold text-gray-900">
                          Order #{order.id.slice(0, 8)}...
                        </span>
                        <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded">
                          {order.paymentStatus}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">
                        Customer: {order.user?.firstName} {order.user?.lastName}
                      </p>
                      <p className="text-sm text-gray-600">
                        Email: {order.user?.email}
                      </p>
                      <p className="text-sm text-gray-600">
                        Phone: {order.user?.phoneNumber || 'Not provided'}
                      </p>
                      <p className="text-lg font-semibold text-gray-900 mt-2">
                        Amount: ₦{order.totalAmount?.toLocaleString()}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        Placed on {new Date(order.createdAt).toLocaleString()}
                      </p>
                    </div>
                    
                    <div className="w-full md:w-80 space-y-2">
                      <input
                        type="text"
                        id={`ref-${order.id}`}
                        placeholder="Enter transaction reference"
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                      />
                      <button
                        onClick={() => {
                          const refInput = document.getElementById(`ref-${order.id}`) as HTMLInputElement;
                          if (!refInput.value) {
                            alert('Please enter the transaction reference');
                            return;
                          }
                          handleConfirmPayment(order.id, refInput.value);
                        }}
                        disabled={confirmingOrderId === order.id}
                        className="w-full bg-green-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-700"
                      >
                        {confirmingOrderId === order.id ? 'Confirming...' : 'Confirm Payment'}
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* All Orders Tab */}
        {activeTab === 'all' && (
          <div className="divide-y">
            {allOrders.length === 0 ? (
              <div className="p-6 text-center text-gray-500">
                No orders found
              </div>
            ) : (
              allOrders.map((order) => (
                <div key={order.id} className="p-6">
                  <div className="flex flex-wrap justify-between items-start gap-2">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-mono text-sm text-gray-600">
                          {order.id.slice(0, 12)}...
                        </span>
                        <span className={`text-xs px-2 py-1 rounded ${
                          order.paymentStatus === 'PAID' 
                            ? 'bg-green-100 text-green-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {order.paymentStatus}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700">
                        {order.user?.firstName} {order.user?.lastName}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-gray-900">
                        ₦{order.totalAmount?.toLocaleString()}
                      </p>
                      <p className="text-xs text-gray-500">
                        {order.items?.length || 0} item(s)
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-center">
            <div className="text-2xl mb-2">➕</div>
            <div className="text-sm font-medium">Add Product</div>
          </button>
          <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-center">
            <div className="text-2xl mb-2">📊</div>
            <div className="text-sm font-medium">View Reports</div>
          </button>
          <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-center">
            <div className="text-2xl mb-2">👤</div>
            <div className="text-sm font-medium">Manage Users</div>
          </button>
          <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-center">
            <div className="text-2xl mb-2">⚙️</div>
            <div className="text-sm font-medium">Settings</div>
          </button>
        </div>
      </div>

      {/* Withdraw Modal */}
      <WithdrawModal
        isOpen={showWithdrawModal}
        onClose={() => setShowWithdrawModal(false)}
        onSuccess={handleWithdraw}
        maxAmount={wallet.availableBalance}
      />
    </div>
  );
}