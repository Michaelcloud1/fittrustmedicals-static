'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  Users, 
  Search, 
  Mail, 
  Phone, 
  Calendar,
  MoreVertical,
  Eye,
  Ban,
  CheckCircle,
  Download,
  RefreshCw,
  AlertTriangle
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';

interface Customer {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  orders?: Order[];
  totalOrders: number;
  totalSpent: number;
  status: 'active' | 'inactive' | 'banned';
  createdAt: string;
  lastOrderAt?: string;
}

interface Order {
  id: string;
  totalAmount: number;
  paymentStatus: string;
  createdAt: string;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://fittrustmedicals-backend.onrender.com';

  // Fetch customers from backend
  const fetchCustomers = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`${BACKEND_URL}/api/users`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch customers');
      }
      
      const allUsers = await response.json();
      
      const customersList: Customer[] = await Promise.all(
        (allUsers || [])
          .filter((user: any) => user.role === 'CUSTOMER')
          .map(async (user: any) => {
            const ordersResponse = await fetch(`${BACKEND_URL}/api/orders?userId=${user.id}`);
            const orders = ordersResponse.ok ? await ordersResponse.json() : [];
            
            const paidOrders = orders.filter((order: Order) => order.paymentStatus === 'PAID');
            const totalSpent = paidOrders.reduce((sum: number, order: Order) => sum + order.totalAmount, 0);
            const lastOrder = paidOrders.length > 0 ? paidOrders.sort((a: Order, b: Order) => 
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            )[0] : null;
            
            return {
              id: user.id,
              firstName: user.firstName,
              lastName: user.lastName,
              email: user.email,
              phoneNumber: user.phoneNumber || 'N/A',
              orders: orders,
              totalOrders: paidOrders.length,
              totalSpent: totalSpent,
              status: user.status === 'ACTIVE' ? 'active' : user.status === 'BANNED' ? 'banned' : 'inactive',
              createdAt: user.createdAt,
              lastOrderAt: lastOrder?.createdAt,
            };
          })
      );
      
      setCustomers(customersList);
    } catch (err) {
      console.error('Error fetching customers:', err);
      setError('Failed to load customers. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchCustomers();
  };

  // Update customer status
  const updateCustomerStatus = async (customerId: string, newStatus: string) => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/users/${customerId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      
      if (response.ok) {
        alert(`Customer ${newStatus === 'ACTIVE' ? 'activated' : 'blocked'} successfully`);
        fetchCustomers();
      } else {
        alert('Failed to update customer status');
      }
    } catch (err) {
      alert('Something went wrong');
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Toggle dropdown
  const toggleDropdown = (customerId: string) => {
    setDropdownOpen(dropdownOpen === customerId ? null : customerId);
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const formatNaira = (price: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleDateString('en-NG', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'inactive':
        return 'warning';
      case 'banned':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active':
        return 'Active';
      case 'inactive':
        return 'Inactive';
      case 'banned':
        return 'Blocked';
      default:
        return status;
    }
  };

  const getFullName = (customer: Customer) => {
    return `${customer.firstName} ${customer.lastName}`.trim();
  };

  const filteredCustomers = customers.filter(customer => {
    const fullName = getFullName(customer).toLowerCase();
    const matchesSearch = fullName.includes(searchQuery.toLowerCase()) ||
                         customer.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         customer.phoneNumber.includes(searchQuery);
    const matchesStatus = statusFilter === 'all' || customer.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const exportToCSV = () => {
    const headers = ['Customer Name', 'Email', 'Phone', 'Total Orders', 'Total Spent', 'Status', 'Joined Date', 'Last Order'];
    const csvData = filteredCustomers.map(customer => [
      getFullName(customer),
      customer.email,
      customer.phoneNumber,
      customer.totalOrders,
      customer.totalSpent,
      getStatusLabel(customer.status),
      formatDate(customer.createdAt),
      formatDate(customer.lastOrderAt)
    ]);

    const csvContent = [headers, ...csvData].map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `customers-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const stats = {
    total: customers.length,
    active: customers.filter(c => c.status === 'active').length,
    inactive: customers.filter(c => c.status === 'inactive').length,
    banned: customers.filter(c => c.status === 'banned').length,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-600 text-lg mb-4">{error}</div>
        <button 
          onClick={fetchCustomers}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Customers</h1>
          <p className="text-gray-500 mt-1">Manage your customer base</p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="secondary" 
            className="flex items-center gap-2"
            onClick={handleRefresh}
            disabled={refreshing}
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button 
            variant="secondary" 
            className="flex items-center gap-2"
            onClick={exportToCSV}
            disabled={customers.length === 0}
          >
            <Download className="w-4 h-4" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Total Customers</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5 text-blue-600" />
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Active Customers</p>
              <p className="text-2xl font-bold text-green-600">{stats.active}</p>
            </div>
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Inactive</p>
              <p className="text-2xl font-bold text-orange-600">{stats.inactive}</p>
            </div>
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5 text-orange-600" />
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Blocked</p>
              <p className="text-2xl font-bold text-red-600">{stats.banned}</p>
            </div>
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
              <Ban className="w-5 h-5 text-red-600" />
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Search and Filters */}
      <motion.div variants={itemVariants}>
        <Card className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search by name, email, or phone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div className="flex gap-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="banned">Blocked</option>
              </select>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Customers Table */}
      <motion.div variants={itemVariants}>
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="text-left p-4 text-sm font-medium text-gray-500">Customer</th>
                  <th className="text-left p-4 text-sm font-medium text-gray-500">Contact</th>
                  <th className="text-left p-4 text-sm font-medium text-gray-500">Orders</th>
                  <th className="text-left p-4 text-sm font-medium text-gray-500">Total Spent</th>
                  <th className="text-left p-4 text-sm font-medium text-gray-500">Joined</th>
                  <th className="text-left p-4 text-sm font-medium text-gray-500">Last Order</th>
                  <th className="text-left p-4 text-sm font-medium text-gray-500">Status</th>
                  <th className="text-right p-4 text-sm font-medium text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredCustomers.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="p-12 text-center text-gray-500">
                      <Users className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                      <p>No customers found</p>
                      <p className="text-sm mt-1">Try adjusting your search or filters</p>
                    </td>
                  </tr>
                ) : (
                  filteredCustomers.map((customer) => (
                    <tr key={customer.id} className="hover:bg-gray-50 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                            {customer.firstName?.charAt(0).toUpperCase() || '?'}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{getFullName(customer)}</p>
                            <p className="text-xs text-gray-500">ID: {customer.id.slice(0, 8)}...</p>
                          </div>
                        </div>
                      </td
                      <td className="p-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1 text-sm text-gray-600">
                            <Mail className="w-3 h-3" />
                            <span className="truncate max-w-[150px]">{customer.email}</span>
                          </div>
                          <div className="flex items-center gap-1 text-sm text-gray-600">
                            <Phone className="w-3 h-3" />
                            <span>{customer.phoneNumber}</span>
                          </div>
                        </div>
                      </td
                      <td className="p-4">
                        <span className="text-sm font-medium text-gray-900">{customer.totalOrders}</span>
                      </td
                      <td className="p-4">
                        <span className="text-sm font-semibold text-gray-900">
                          {formatNaira(customer.totalSpent)}
                        </span>
                      </td
                      <td className="p-4">
                        <div className="flex items-center gap-1 text-sm text-gray-600">
                          <Calendar className="w-3 h-3" />
                          <span>{formatDate(customer.createdAt)}</span>
                        </div>
                      </td
                      <td className="p-4">
                        <span className="text-sm text-gray-600">
                          {formatDate(customer.lastOrderAt)}
                        </span>
                      </td
                      <td className="p-4">
                        <Badge 
                          label={getStatusLabel(customer.status)} 
                          variant={getStatusColor(customer.status) as any}
                        />
                      </td
                      <td className="p-4 text-right">
                        <div className="relative" ref={dropdownOpen === customer.id ? dropdownRef : null}>
                          <button
                            onClick={() => toggleDropdown(customer.id)}
                            className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                            title="More Options"
                          >
                            <MoreVertical className="w-4 h-4" />
                          </button>
                          
                          {/* Dropdown Menu */}
                          {dropdownOpen === customer.id && (
                            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-100 z-50 overflow-hidden">
                              <Link href={`/admin/customers/${customer.id}`}>
                                <button
                                  onClick={() => setDropdownOpen(null)}
                                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                                >
                                  <Eye className="w-3 h-3" />
                                  View Details
                                </button>
                              </Link>
                              <button
                                onClick={() => {
                                  const newStatus = customer.status === 'active' ? 'banned' : 'active';
                                  updateCustomerStatus(customer.id, newStatus === 'active' ? 'ACTIVE' : 'BANNED');
                                  setDropdownOpen(null);
                                }}
                                className={`w-full text-left px-4 py-2 text-sm flex items-center gap-2 ${
                                  customer.status === 'active' 
                                    ? 'text-red-600 hover:bg-red-50' 
                                    : 'text-green-600 hover:bg-green-50'
                                }`}
                              >
                                {customer.status === 'active' ? (
                                  <>
                                    <Ban className="w-3 h-3" />
                                    Block Customer
                                  </>
                                ) : (
                                  <>
                                    <CheckCircle className="w-3 h-3" />
                                    Unblock Customer
                                  </>
                                )}
                              </button>
                            </div>
                          )}
                        </div>
                      </td
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </motion.div>
    </motion.div>
  );
}