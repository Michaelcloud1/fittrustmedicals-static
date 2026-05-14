'use client';

import { useState, useEffect } from 'react';
import { 
  BarChart3, 
  Users, 
  ShoppingCart, 
  TrendingUp,
  Award,
  Calendar,
  Loader2
} from 'lucide-react';

interface StaffPerformance {
  staffId: string;
  staffName: string;
  ordersProcessed: number;
  totalSales: number;
  customersServed: number;
  lastActive: Date;
}

interface DashboardStats {
  totalStaff: number;
  totalSales: number;
  totalOrders: number;
  avgOrderValue: number;
}

export default function StaffPerformancePage() {
  const [staffData, setStaffData] = useState<StaffPerformance[]>([]);
  const [topStaff, setTopStaff] = useState<StaffPerformance[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    totalStaff: 0,
    totalSales: 0,
    totalOrders: 0,
    avgOrderValue: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://fittrustmedicals-backend.onrender.com';

  // Fetch all staff performance
  const fetchStaffPerformance = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/staff/performance`);
      if (!response.ok) throw new Error('Failed to fetch staff data');
      const result = await response.json();
      const staffList = result.data || [];
      setStaffData(staffList);

      // Calculate stats
      const totalStaff = staffList.length;
      const totalSales = staffList.reduce((sum: number, s: StaffPerformance) => sum + s.totalSales, 0);
      const totalOrders = staffList.reduce((sum: number, s: StaffPerformance) => sum + s.ordersProcessed, 0);
      const avgOrderValue = totalOrders > 0 ? totalSales / totalOrders : 0;

      setStats({
        totalStaff,
        totalSales,
        totalOrders,
        avgOrderValue,
      });
    } catch (err) {
      console.error('Error fetching staff:', err);
      setError('Failed to load staff performance data');
    }
  };

  // Fetch top performers
  const fetchTopPerformers = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/staff/top-performers?limit=5`);
      if (!response.ok) throw new Error('Failed to fetch top performers');
      const result = await response.json();
      setTopStaff(result.data || []);
    } catch (err) {
      console.error('Error fetching top performers:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaffPerformance();
    fetchTopPerformers();
    
    // Refresh every 60 seconds
    const interval = setInterval(() => {
      fetchStaffPerformance();
      fetchTopPerformers();
    }, 60000);
    
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">{error}</p>
        <button 
          onClick={() => { fetchStaffPerformance(); fetchTopPerformers(); }}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Staff Performance</h1>
        <p className="text-gray-500 mt-1">Track sales performance and productivity metrics</p>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Staff</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalStaff}</p>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Sales</p>
              <p className="text-2xl font-bold text-gray-900">₦{stats.totalSales.toLocaleString()}</p>
            </div>
            <div className="p-3 bg-green-50 rounded-lg">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Orders Processed</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalOrders}</p>
            </div>
            <div className="p-3 bg-orange-50 rounded-lg">
              <ShoppingCart className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Avg Order Value</p>
              <p className="text-2xl font-bold text-gray-900">₦{Math.round(stats.avgOrderValue).toLocaleString()}</p>
            </div>
            <div className="p-3 bg-purple-50 rounded-lg">
              <BarChart3 className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Top Performers */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Award className="w-5 h-5 mr-2 text-yellow-500" />
          Top Performing Staff
        </h2>

        {topStaff.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <Users className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>No staff performance data yet</p>
          </div>
        ) : (
          <div className="space-y-4">
            {topStaff.map((staff, index) => (
              <div key={staff.staffId} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${
                    index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : index === 2 ? 'bg-orange-400' : 'bg-blue-500'
                  }`}>
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{staff.staffName}</p>
                    <p className="text-sm text-gray-500">{staff.ordersProcessed} orders • {staff.customersServed} customers</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-gray-900">₦{staff.totalSales.toLocaleString()}</p>
                  <p className="text-sm text-gray-500">Total Sales</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Performance Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">All Staff Performance</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Staff Member</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Orders</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Total Sales</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Customers</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Last Active</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {staffData.map((staff) => (
                <tr key={staff.staffId} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium text-gray-900">{staff.staffName}</td>
                  <td className="px-6 py-4 text-gray-600">{staff.ordersProcessed}</td>
                  <td className="px-6 py-4 font-medium text-gray-900">₦{staff.totalSales.toLocaleString()}</td>
                  <td className="px-6 py-4 text-gray-600">{staff.customersServed}</td>
                  <td className="px-6 py-4 text-gray-500 flex items-center">
                    <Calendar className="w-4 h-4 mr-2" />
                    {new Date(staff.lastActive).toLocaleDateString()}
                  </td>
                 </tr>
              ))}
            </tbody>
           </table>
        </div>
        
        {staffData.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No staff performance data available</p>
          </div>
        )}
      </div>
    </div>
  );
}