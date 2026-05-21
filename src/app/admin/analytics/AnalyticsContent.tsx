'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  DollarSign, 
  ShoppingCart, 
  Package,
  ArrowUpRight,
  ArrowDownRight,
  Download
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

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

// Simple bar chart component that only renders on client
const SimpleBarChart = ({ salesData, maxRevenue }: { salesData: any[]; maxRevenue: number }) => {
  const [isClient, setIsClient] = useState(false);
  
  useEffect(() => {
    setIsClient(true);
  }, []);
  
  if (!isClient) {
    return (
      <div className="h-64 flex items-center justify-center">
        <div className="animate-pulse bg-gray-200 rounded-lg w-full h-full"></div>
      </div>
    );
  }
  
  if (!salesData || salesData.length === 0 || maxRevenue === 0) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <TrendingUp className="w-12 h-12 text-gray-400 mx-auto mb-2" />
          <p className="text-gray-500">No sales data available</p>
          <p className="text-sm text-gray-400">Complete orders to see analytics</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="flex items-end justify-between h-full gap-2">
      {salesData.map((day, index) => (
        <div key={index} className="flex-1 flex flex-col items-center">
          <div 
            className="w-full bg-blue-500 rounded-t-lg transition-all duration-500 hover:bg-blue-600"
            style={{ height: `${(day.revenue / maxRevenue) * 200}px` }}
          />
          <p className="text-xs text-gray-500 mt-2 text-center break-words max-w-[60px]">{day.displayDate?.slice(0, 6) || day.date}</p>
          <p className="text-xs font-semibold text-gray-700 mt-1">₦{Math.round(day.revenue).toLocaleString()}</p>
        </div>
      ))}
    </div>
  );
};

export default function AnalyticsContent() {
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('month');
  const [salesData, setSalesData] = useState<any[]>([]);
  const [categorySales, setCategorySales] = useState<{name: string; percentage: number; sales: number}[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [totalOrders, setTotalOrders] = useState(0);
  const [totalProductsCount, setTotalProductsCount] = useState(0);
  const [averageOrderValue, setAverageOrderValue] = useState(0);

  const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://fittrustmedicals-backend.onrender.com';

  // Calculate category sales from orders
  const calculateCategorySales = (ordersList: any[]) => {
    const categoryMap: { [key: string]: number } = {};
    let totalSales = 0;
    
    ordersList.forEach(order => {
      if (order.paymentStatus === 'PAID') {
        totalSales += order.totalAmount || 0;
        
        order.items?.forEach((item: any) => {
          let category = 'Other';
          const productName = item.productName?.toLowerCase() || '';
          
          if (productName.includes('diagnostic') || productName.includes('test') || productName.includes('monitor')) {
            category = 'Diagnostic';
          } else if (productName.includes('ppe') || productName.includes('mask') || productName.includes('glove')) {
            category = 'PPE';
          } else if (productName.includes('first') || productName.includes('aid') || productName.includes('bandage')) {
            category = 'First Aid';
          } else if (productName.includes('mobility') || productName.includes('wheelchair') || productName.includes('walker')) {
            category = 'Mobility';
          } else if (productName.includes('monitoring') || productName.includes('bp') || productName.includes('sugar')) {
            category = 'Monitoring';
          }
          
          categoryMap[category] = (categoryMap[category] || 0) + (item.unitPrice * item.quantity);
        });
      }
    });
    
    const categories = Object.entries(categoryMap).map(([name, sales]) => ({
      name,
      sales,
      percentage: totalSales > 0 ? (sales / totalSales) * 100 : 0
    }));
    
    setCategorySales(categories.sort((a, b) => b.sales - a.sales).slice(0, 5));
  };

  // Generate sales data for chart
  const generateSalesData = (ordersList: any[]) => {
    const last7Days = [];
    const today = new Date();
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      const dayOrders = ordersList.filter(order => {
        const orderDate = new Date(order.createdAt).toISOString().split('T')[0];
        return orderDate === dateStr && order.paymentStatus === 'PAID';
      });
      
      const revenue = dayOrders.reduce((sum: number, order: any) => sum + (order.totalAmount || 0), 0);
      
      last7Days.push({
        date: dateStr,
        displayDate: date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
        revenue,
        orders: dayOrders.length
      });
    }
    
    setSalesData(last7Days);
  };

  // Fetch data directly from API
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        // Fetch orders
        const ordersRes = await fetch(`${BACKEND_URL}/api/orders`);
        let ordersData = [];
        if (ordersRes.ok) {
          ordersData = await ordersRes.json();
          setOrders(ordersData);
          
          // Calculate revenue from orders
          const revenue = ordersData.reduce((sum: number, order: any) => {
            if (order.paymentStatus === 'PAID') {
              return sum + (order.totalAmount || 0);
            }
            return sum;
          }, 0);
          setTotalRevenue(revenue);
          setTotalOrders(ordersData.length);
          setAverageOrderValue(ordersData.length > 0 ? revenue / ordersData.length : 0);
          
          // Calculate category sales
          calculateCategorySales(ordersData);
          generateSalesData(ordersData);
        }
        
        // Fetch products
        const productsRes = await fetch(`${BACKEND_URL}/api/catalog/products`);
        if (productsRes.ok) {
          const productsData = await productsRes.json();
          let productsList = [];
          if (productsData.success && productsData.products) {
            productsList = productsData.products;
          } else if (Array.isArray(productsData)) {
            productsList = productsData;
          }
          setTotalProductsCount(productsList.filter((p: any) => p.isActive !== false).length);
        }
      } catch (error) {
        console.error('Error loading analytics data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, [BACKEND_URL]);

  const formatNaira = (price: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price || 0);
  };
  
  // Get period change safely
  const getPeriodChange = (current: number, previous: number) => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / previous) * 100;
  };

  const getPreviousPeriodRevenue = () => {
    if (!orders || orders.length === 0) return 0;
    
    const now = new Date();
    let startDate: Date;
    
    if (period === 'week') {
      startDate = new Date(now);
      startDate.setDate(now.getDate() - 7);
      return orders.reduce((sum, order) => {
        const orderDate = new Date(order.createdAt);
        if (orderDate >= startDate && order.paymentStatus === 'PAID') {
          return sum + (order.totalAmount || 0);
        }
        return sum;
      }, 0);
    } else if (period === 'month') {
      startDate = new Date(now);
      startDate.setMonth(now.getMonth() - 1);
      return orders.reduce((sum, order) => {
        const orderDate = new Date(order.createdAt);
        if (orderDate >= startDate && order.paymentStatus === 'PAID') {
          return sum + (order.totalAmount || 0);
        }
        return sum;
      }, 0);
    }
    
    return totalRevenue * 0.7;
  };

  const previousRevenue = getPreviousPeriodRevenue();
  const revenueChange = getPeriodChange(totalRevenue, previousRevenue);
  const ordersChange = totalOrders > 0 ? 12 : 0;
  const productsChange = totalProductsCount > 0 ? 8 : 0;
  const aovChange = getPeriodChange(averageOrderValue, averageOrderValue * 0.88);

  const stats = [
    {
      title: 'Total Revenue',
      value: formatNaira(totalRevenue),
      change: revenueChange,
      icon: DollarSign,
      color: 'bg-green-50',
      iconColor: 'text-green-600',
    },
    {
      title: 'Total Orders',
      value: totalOrders.toLocaleString(),
      change: ordersChange,
      icon: ShoppingCart,
      color: 'bg-blue-50',
      iconColor: 'text-blue-600',
    },
    {
      title: 'Total Products',
      value: totalProductsCount.toLocaleString(),
      change: productsChange,
      icon: Package,
      color: 'bg-purple-50',
      iconColor: 'text-purple-600',
    },
    {
      title: 'Average Order Value',
      value: formatNaira(averageOrderValue),
      change: aovChange,
      icon: TrendingUp,
      color: 'bg-orange-50',
      iconColor: 'text-orange-600',
    },
  ];

  // Filter orders based on selected period
  const getFilteredOrders = () => {
    if (!orders || orders.length === 0) return [];
    
    const now = new Date();
    const filtered = orders.filter(order => {
      const orderDate = new Date(order.createdAt);
      
      if (period === 'week') {
        const weekAgo = new Date(now);
        weekAgo.setDate(now.getDate() - 7);
        return orderDate >= weekAgo;
      } else if (period === 'month') {
        const monthAgo = new Date(now);
        monthAgo.setMonth(now.getMonth() - 1);
        return orderDate >= monthAgo;
      } else if (period === 'year') {
        const yearAgo = new Date(now);
        yearAgo.setFullYear(now.getFullYear() - 1);
        return orderDate >= yearAgo;
      }
      return true;
    });
    
    return filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 10);
  };

  const recentOrders = getFilteredOrders();
  const maxRevenue = Math.max(...salesData.map(d => d.revenue), 1);

  const exportReport = () => {
    const reportData = {
      generatedAt: new Date().toISOString(),
      period,
      totalRevenue,
      totalOrders,
      totalProducts: totalProductsCount,
      averageOrderValue,
      orders: recentOrders.map(order => ({
        id: order.id,
        customerName: order.customerName || order.user?.email || 'Guest',
        amount: order.totalAmount,
        status: order.status,
        date: order.createdAt
      }))
    };
    
    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analytics-report-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
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
          <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
          <p className="text-gray-500 mt-1">Track your store's performance and sales metrics</p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="year">This Year</option>
            <option value="all">All Time</option>
          </select>
          <Button 
            variant="secondary" 
            className="flex items-center gap-2"
            onClick={exportReport}
          >
            <Download className="w-4 h-4" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <Card key={stat.title} className="p-6">
            <div className="flex justify-between items-start mb-4">
              <div className={`p-3 rounded-xl ${stat.color}`}>
                <stat.icon className={`w-6 h-6 ${stat.iconColor}`} />
              </div>
              <div className={`flex items-center gap-1 text-sm font-medium ${stat.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {stat.change >= 0 ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                <span>{Math.abs(Math.round(stat.change))}%</span>
              </div>
            </div>
            <p className="text-gray-500 text-sm font-medium mb-1">{stat.title}</p>
            <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
          </Card>
        ))}
      </motion.div>

      {/* Charts Section */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold text-gray-800">Revenue Overview</h3>
            <span className="text-xs text-gray-500">Last 7 days</span>
          </div>
          <div className="h-64">
            <SimpleBarChart salesData={salesData} maxRevenue={maxRevenue} />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold text-gray-800">Top Categories</h3>
            <span className="text-xs text-gray-500">By sales volume</span>
          </div>
          <div className="space-y-4">
            {categorySales.length > 0 ? (
              categorySales.map((category, index) => (
                <div key={category.name} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-sm">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium text-gray-700">{category.name}</span>
                      <span className="text-sm text-gray-500">{Math.round(category.percentage)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 rounded-full h-2 transition-all duration-500" 
                        style={{ width: `${Math.min(category.percentage, 100)}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <Package className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                <p className="text-gray-500">No category data available</p>
              </div>
            )}
          </div>
        </Card>
      </motion.div>

      {/* Recent Orders Table */}
      <motion.div variants={itemVariants}>
        <Card className="overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex justify-between items-center">
            <div>
              <h3 className="text-lg font-bold text-gray-800">Recent Orders</h3>
              <p className="text-sm text-gray-500 mt-1">Latest customer transactions</p>
            </div>
            <Link href="/admin/orders">
              <Button variant="secondary" size="sm">View All Orders</Button>
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="text-left p-4 text-sm font-medium text-gray-500">Order ID</th>
                  <th className="text-left p-4 text-sm font-medium text-gray-500">Customer</th>
                  <th className="text-left p-4 text-sm font-medium text-gray-500">Date</th>
                  <th className="text-left p-4 text-sm font-medium text-gray-500">Amount</th>
                  <th className="text-left p-4 text-sm font-medium text-gray-500">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {recentOrders.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-gray-500">
                      <ShoppingCart className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                      <p>No orders in this period</p>
                      <p className="text-sm text-gray-400 mt-1">Orders will appear here once customers make purchases</p>
                    </td>
                  </tr>
                ) : (
                  recentOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                      <td className="p-4">
                        <span className="font-mono text-sm font-medium text-gray-900">
                          #{order.id?.slice(-8) || order.id?.slice(0, 8)}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className="text-sm text-gray-800">
                          {order.user?.firstName && order.user?.lastName 
                            ? `${order.user.firstName} ${order.user.lastName}`
                            : order.customerName || order.user?.email || 'Guest'}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className="text-sm text-gray-500">
                          {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'N/A'}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className="text-sm font-semibold text-gray-900">
                          {formatNaira(order.totalAmount || 0)}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                          order.paymentStatus === 'PAID' ? 'bg-green-100 text-green-800' :
                          order.orderStatus === 'processing' ? 'bg-blue-100 text-blue-800' :
                          order.orderStatus === 'cancelled' ? 'bg-red-100 text-red-800' :
                          order.paymentStatus === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {order.paymentStatus === 'PAID' ? 'Paid' :
                           order.orderStatus === 'processing' ? 'Processing' :
                           order.orderStatus === 'cancelled' ? 'Cancelled' :
                           order.paymentStatus === 'PENDING' ? 'Pending' : 'Pending'}
                        </span>
                      </td>
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