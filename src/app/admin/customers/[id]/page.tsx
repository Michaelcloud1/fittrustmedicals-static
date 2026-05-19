'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { 
  ArrowLeft, 
  Mail, 
  Phone, 
  Calendar, 
  Package, 
  CreditCard,
  MapPin,
  User,
  Edit,
  Ban,
  CheckCircle,
  RefreshCw,
  AlertTriangle
} from 'lucide-react';

interface Order {
  id: string;
  totalAmount: number;
  paymentStatus: string;
  orderStatus: string;
  createdAt: string;
  items?: any[];
}

interface Customer {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  role: string;
  status: string;
  createdAt: string;
  lastLoginAt?: string;
  orders?: Order[];
}

export default function CustomerDetailPage() {
  const params = useParams();
  const router = useRouter();
  const customerId = params.id as string;
  
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updating, setUpdating] = useState(false);

  const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://fittrustmedicals-backend.onrender.com';

  const fetchCustomerData = async () => {
    try {
      setLoading(true);
      
      // Fetch customer details
      const userResponse = await fetch(`${BACKEND_URL}/api/users/${customerId}`);
      if (!userResponse.ok) throw new Error('Customer not found');
      const userData = await userResponse.json();
      setCustomer(userData);
      
      // Fetch customer's orders
      const ordersResponse = await fetch(`${BACKEND_URL}/api/orders?userId=${customerId}`);
      if (ordersResponse.ok) {
        const ordersData = await ordersResponse.json();
        setOrders(ordersData);
      }
      
    } catch (err) {
      console.error('Error fetching customer:', err);
      setError('Failed to load customer details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (customerId) {
      fetchCustomerData();
    }
  }, [customerId]);

  const handleUpdateStatus = async (newStatus: string) => {
    if (!confirm(`Are you sure you want to ${newStatus === 'ACTIVE' ? 'activate' : 'deactivate'} this customer?`)) {
      return;
    }
    
    setUpdating(true);
    try {
      const response = await fetch(`${BACKEND_URL}/api/users/${customerId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      
      if (response.ok) {
        alert(`Customer ${newStatus === 'ACTIVE' ? 'activated' : 'deactivated'} successfully`);
        fetchCustomerData();
      } else {
        alert('Failed to update status');
      }
    } catch (err) {
      alert('Something went wrong');
    } finally {
      setUpdating(false);
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
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
    if (customer?.status === 'ACTIVE') {
      return <Badge label="Active" variant="success" />;
    }
    return <Badge label="Inactive" variant="warning" />;
  };

  const totalSpent = orders
    .filter(o => o.paymentStatus === 'PAID')
    .reduce((sum, o) => sum + o.totalAmount, 0);

  const completedOrders = orders.filter(o => o.paymentStatus === 'PAID').length;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error || !customer) {
    return (
      <div className="text-center py-12">
        <div className="text-red-600 text-lg mb-4">{error || 'Customer not found'}</div>
        <Link href="/admin/customers">
          <Button variant="secondary">Back to Customers</Button>
        </Link>
      </div>
    );
  }

  const fullName = `${customer.firstName || ''} ${customer.lastName || ''}`.trim();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <Link href="/admin/customers">
            <button className="p-2 hover:bg-gray-100 rounded-lg transition">
              <ArrowLeft className="w-5 h-5" />
            </button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Customer Details</h1>
            <p className="text-gray-500 text-sm">ID: {customer.id.slice(0, 12)}...</p>
          </div>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => handleUpdateStatus(customer.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE')}
            disabled={updating}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition disabled:opacity-50 ${
              customer.status === 'ACTIVE'
                ? 'bg-orange-600 text-white hover:bg-orange-700'
                : 'bg-green-600 text-white hover:bg-green-700'
            }`}
          >
            {customer.status === 'ACTIVE' ? (
              <Ban className="w-4 h-4" />
            ) : (
              <CheckCircle className="w-4 h-4" />
            )}
            {updating ? 'Updating...' : customer.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
          </button>
        </div>
      </div>

      {/* Customer Info Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Customer Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Profile Card */}
          <Card className="p-6">
            <div className="flex items-start gap-6">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                {fullName.charAt(0).toUpperCase() || '?'}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <h2 className="text-xl font-bold text-gray-900">{fullName}</h2>
                  {getStatusBadge()}
                </div>
                <div className="mt-4 space-y-2">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Mail className="w-4 h-4" />
                    <span>{customer.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Phone className="w-4 h-4" />
                    <span>{customer.phoneNumber || 'N/A'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <User className="w-4 h-4" />
                    <span>Role: {customer.role || 'Customer'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Calendar className="w-4 h-4" />
                    <span>Joined: {formatDate(customer.createdAt)}</span>
                  </div>
                  {customer.lastLoginAt && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <RefreshCw className="w-4 h-4" />
                      <span>Last Login: {formatDate(customer.lastLoginAt)}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </Card>

          {/* Order History */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Package className="w-5 h-5" />
              Order History
            </h2>
            
            {orders.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Package className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>No orders yet</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b">
                    <tr>
                      <th className="text-left py-3 px-2 text-sm font-medium text-gray-600">Order ID</th>
                      <th className="text-left py-3 px-2 text-sm font-medium text-gray-600">Date</th>
                      <th className="text-right py-3 px-2 text-sm font-medium text-gray-600">Amount</th>
                      <th className="text-left py-3 px-2 text-sm font-medium text-gray-600">Status</th>
                      <th className="text-center py-3 px-2 text-sm font-medium text-gray-600">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((order) => (
                      <tr key={order.id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-2 font-mono text-sm">{order.id.slice(0, 8)}...</td>
                        <td className="py-3 px-2 text-sm text-gray-600">{formatDate(order.createdAt)}</td>
                        <td className="py-3 px-2 text-right font-semibold">{formatNaira(order.totalAmount)}</td>
                        <td className="py-3 px-2">
                          <Badge 
                            label={order.paymentStatus === 'PAID' ? 'Paid' : 'Pending'} 
                            variant={order.paymentStatus === 'PAID' ? 'success' : 'warning'}
                          />
                        </td>
                        <td className="py-3 px-2 text-center">
                          <Link href={`/admin/orders/${order.id}`}>
                            <button className="text-blue-600 hover:text-blue-800 text-sm">
                              View
                            </button>
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </div>

        {/* Right Column - Stats */}
        <div className="space-y-6">
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <CreditCard className="w-5 h-5" />
              Customer Stats
            </h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center pb-2 border-b">
                <span className="text-gray-600">Total Orders</span>
                <span className="text-xl font-bold text-gray-900">{orders.length}</span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b">
                <span className="text-gray-600">Completed Orders</span>
                <span className="text-xl font-bold text-green-600">{completedOrders}</span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b">
                <span className="text-gray-600">Total Spent</span>
                <span className="text-xl font-bold text-blue-600">{formatNaira(totalSpent)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Average Order Value</span>
                <span className="text-lg font-semibold text-gray-900">
                  {completedOrders > 0 ? formatNaira(totalSpent / completedOrders) : formatNaira(0)}
                </span>
              </div>
            </div>
          </Card>

          {/* Quick Actions */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
            <div className="space-y-2">
              <Link href={`mailto:${customer.email}`}>
                <button className="w-full text-left px-4 py-2 bg-gray-50 hover:bg-gray-100 rounded-lg text-gray-700 transition flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  Send Email
                </button>
              </Link>
              {customer.phoneNumber && (
                <a href={`tel:${customer.phoneNumber}`}>
                  <button className="w-full text-left px-4 py-2 bg-gray-50 hover:bg-gray-100 rounded-lg text-gray-700 transition flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    Call Customer
                  </button>
                </a>
              )}
              <Link href={`/admin/orders?customer=${customer.id}`}>
                <button className="w-full text-left px-4 py-2 bg-gray-50 hover:bg-gray-100 rounded-lg text-gray-700 transition flex items-center gap-2">
                  <Package className="w-4 h-4" />
                  View All Orders
                </button>
              </Link>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}