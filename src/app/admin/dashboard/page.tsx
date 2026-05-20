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

interface Product {
  id: string;
  name: string;
  isActive: boolean;
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
      if (response.ok) {
        const data = await response.json();
        setWallet({
          availableBalance: data.availableBalance || 0,
          totalEarned: data.totalEarned || 0,
          totalWithdrawn: data.totalWithdrawn || 0,
        });
      }
    } catch (error) {
      console.error('Failed to fetch wallet:', error);
    }
  };

  // Fetch total products count
  const fetchTotalProducts = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/catalog/products`);
      if (response.ok) {
        const data = await response.json();
        let products = [];
        if (data.success && data.products) {
          products = data.products;
        } else if (Array.isArray(data)) {
          products = data;
        } else if (data.products) {
          products = data.products;
        }
        const activeProducts = products.filter((p: Product) => p.isActive === true).length;
        setStats(prev => ({ ...prev, totalProducts: activeProducts }));
      }
    } catch (error) {
      console.error('Failed to fetch products:', error);
    }
  };

  // Fetch staff count (users with role STAFF or ADMIN)
  const fetchStaffCount = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/users`);
      if (response.ok) {
        const users = await response.json();
        const staffCount = users.filter((u: any) => u.role === 'STAFF' || u.role === 'ADMIN').length;
        setStats(prev => ({ ...prev, activeStaff: staffCount }));
      }
    } catch (error) {
      console.error('Failed to fetch staff:', error);
    }
  };

  // Fetch all orders
  const fetchOrders = async () => {
    try {
      // Fetch pending orders
      const pendingRes = await fetch(`${BACKEND_URL}/api/orders?status=PENDING`);
      if (pendingRes.ok) {
        const pendingData = await pendingRes.json();
        setPendingOrders(pendingData);
      }

      // Fetch all orders
      const allRes = await fetch(`${BACKEND_URL}/api/orders`);
      if (allRes.ok) {
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
      }
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const loadAllData = async () => {
      setLoading(true);
      await Promise.all([
        fetchWallet(),
        fetchTotalProducts(),
        fetchStaffCount(),
        fetchOrders(),
      ]);
      setLoading(false);
    };
    
    loadAllData();
    
    // Refresh every 30 seconds
    const interval = setInterval(() => {
      fetchWallet();
      fetchTotalProducts();
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

  // Calculate today's earnings (orders paid today)
  const todayEarnings = allOrders
    .filter(order => {
      if (order.paymentStatus !== 'PAID') return false;
      const orderDate = new Date(order.createdAt).toDateString();
      const today = new Date().toDateString();
      return orderDate === today;
    })
    .reduce((sum, order) => sum + order.totalAmount, 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-2xl p-6 text-white">
        <h1 className="text-2xl font-bold">Welcome back, Administrator!</h1>
        <p className="text-blue-100 mt-1">Here's what's happening with your store today.</p>
      </div>

      {/* Wallet Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-xl p-5 text-white shadow-lg">
          <p className="text-green-100 text-sm">Available Wallet Balance</p>
          <p className="text-3xl font-bold mt-1">₦{wallet.availableBalance.toLocaleString()}</p>
          <p className="text-green-200 text-xs mt-2">+₦{todayEarnings.toLocaleString()} earned today</p>
          <button
            onClick={() => setShowWithdrawModal(true)}
            disabled={wallet.availableBalance === 0}
            className="mt-3 w-full py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg text-sm font-medium transition disabled:opacity-50"
          >
            Withdraw Funds →
          </button>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Total Earned</p>
              <p className="text-2xl font-bold text-gray-900">₦{wallet.totalEarned.toLocaleString()}</p>
            </div>
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
              <span className="text-green-600 text-xl">💰</span>
            </div>
          </div>
          <p className="text-xs text-gray-400 mt-2">Lifetime earnings</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Total Withdrawn</p>
              <p className="text-2xl font-bold text-gray-900">₦{wallet.totalWithdrawn.toLocaleString()}</p>
            </div>
            <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
              <span className="text-orange-600 text-xl">🏦</span>
            </div>
          </div>
          <p className="text-xs text-gray-400 mt-2">Withdrawn to bank</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Pending Withdrawals</p>
              <p className="text-2xl font-bold text-yellow-600">₦0</p>
            </div>
            <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
              <span className="text-yellow-600 text-xl">⏳</span>
            </div>
          </div>
          <p className="text-xs text-gray-400 mt-2">Awaiting processing</p>
        </div>
      </div>

      {/* Stats Grid - Products, Orders, Sales, Staff */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Total Products</p>
              <p className="text-3xl font-bold text-gray-900">{stats.totalProducts}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <span className="text-blue-600 text-2xl">📦</span>
            </div>
          </div>
          <div className="mt-2 flex items-center gap-1">
            <span className="text-green-600 text-sm">+12%</span>
            <span className="text-gray-400 text-xs">vs last month</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Total Orders</p>
              <p className="text-3xl font-bold text-gray-900">{stats.totalOrders}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <span className="text-green-600 text-2xl">🛒</span>
            </div>
          </div>
          <div className="mt-2 flex items-center gap-1">
            <span className="text-green-600 text-sm">+8%</span>
            <span className="text-gray-400 text-xs">vs last month</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Total Sales</p>
              <p className="text-3xl font-bold text-gray-900">₦{stats.totalSales.toLocaleString()}</p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
              <span className="text-yellow-600 text-2xl">💰</span>
            </div>
          </div>
          <div className="mt-2 flex items-center gap-1">
            <span className="text-green-600 text-sm">+15%</span>
            <span className="text-gray-400 text-xs">vs last month</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Active Staff</p>
              <p className="text-3xl font-bold text-gray-900">{stats.activeStaff}</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
              <span className="text-purple-600 text-2xl">👥</span>
            </div>
          </div>
          <div className="mt-2 flex items-center gap-1">
            <span className="text-green-600 text-sm">+2</span>
            <span className="text-gray-400 text-xs">this month</span>
          </div>
        </div>
      </div>

      {/* Orders Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="border-b px-6">
          <div className="flex gap-6">
            <button
              onClick={() => setActiveTab('pending')}
              className={`py-3 text-sm font-medium border-b-2 transition ${
                activeTab === 'pending'
                  ? 'border-green-500 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Pending Orders ({pendingOrders.length})
            </button>
            <button
              onClick={() => setActiveTab('all')}
              className={`py-3 text-sm font-medium border-b-2 transition ${
                activeTab === 'all'
                  ? 'border-green-500 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
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
              <div className="p-8 text-center text-gray-500">
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
                        <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full">
                          PENDING
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">
                        Customer: {order.user?.firstName} {order.user?.lastName}
                      </p>
                      <p className="text-sm text-gray-600">Email: {order.user?.email}</p>
                      <p className="text-sm text-gray-600">Phone: {order.user?.phoneNumber || 'N/A'}</p>
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
                        className="w-full bg-green-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-700 transition disabled:opacity-50"
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
              <div className="p-8 text-center text-gray-500">
                No orders found
              </div>
            ) : (
              allOrders.map((order) => (
                <div key={order.id} className="p-6 hover:bg-gray-50 transition">
                  <div className="flex flex-wrap justify-between items-start gap-2">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-mono text-sm text-gray-600">
                          {order.id.slice(0, 12)}...
                        </span>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          order.paymentStatus === 'PAID' 
                            ? 'bg-green-100 text-green-700'
                            : 'bg-yellow-100 text-yellow-700'
                        }`}>
                          {order.paymentStatus === 'PAID' ? 'Paid' : 'Pending'}
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