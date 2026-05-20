'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Search, UserPlus, Mail, Ban, Trash2, Edit, X, Save, Users as UsersIcon, RefreshCw } from 'lucide-react';
import Link from 'next/link';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  phone: string;
  status: string;
  createdAt: string;
}

export default function AdminUsersPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [deletingUserId, setDeletingUserId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'staff',
    phone: '',
  });
  const [submitting, setSubmitting] = useState(false);

  const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://fittrustmedicals-backend.onrender.com';

  // Fetch users from ALL localStorage sources
  const fetchUsers = () => {
    setLoading(true);
    
    try {
      // Get users from ALL possible storage locations
      const storedUsers = JSON.parse(localStorage.getItem('fittrust-users') || '[]');
      const registeredUsers = JSON.parse(localStorage.getItem('registered-users') || '[]');
      const adminUsers = JSON.parse(localStorage.getItem('admin-created-users') || '[]');
      
      // Combine all users from different sources
      let allUsers: any[] = [...storedUsers];
      
      // Add from registered-users if not already present
      registeredUsers.forEach((user: any) => {
        if (!allUsers.some((u: any) => u.email === user.email)) {
          allUsers.push(user);
        }
      });
      
      // Add from admin-created-users if not already present
      adminUsers.forEach((user: any) => {
        if (!allUsers.some((u: any) => u.email === user.email)) {
          allUsers.push(user);
        }
      });
      
      // Add default admin if no users exist
      if (allUsers.length === 0) {
        const defaultAdmin = {
          id: 'admin-default',
          name: 'Super Admin',
          email: 'admin@fittrust.com',
          password: 'admin123',
          role: 'admin',
          phone: '+234 800 123 4567',
          status: 'active',
          createdAt: new Date().toISOString(),
        };
        allUsers.push(defaultAdmin);
        localStorage.setItem('fittrust-users', JSON.stringify(allUsers));
      }
      
      // Remove duplicates by email
      const uniqueUsers = allUsers.filter((user, index, self) => 
        index === self.findIndex((u: any) => u.email === user.email)
      );
      
      // Format users for display
      const formattedUsers = uniqueUsers.map((user: any) => ({
        id: user.id,
        name: user.name || user.fullName || 'Unknown',
        email: user.email,
        role: user.role?.toLowerCase() || 'customer',
        phone: user.phone || 'No phone',
        status: user.status || 'active',
        createdAt: user.createdAt || new Date().toISOString(),
      }));
      
      setUsers(formattedUsers);
      
      // Sync all users back to main storage
      localStorage.setItem('fittrust-users', JSON.stringify(uniqueUsers));
      
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
    
    // Listen for storage changes across tabs
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'fittrust-users' || e.key === 'registered-users' || e.key === 'admin-created-users') {
        fetchUsers();
      }
    };
    window.addEventListener('storage', handleStorageChange);
    
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Add user to localStorage
  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    
    try {
      const storedUsers = JSON.parse(localStorage.getItem('fittrust-users') || '[]');
      
      // Check if email already exists
      if (storedUsers.some((u: any) => u.email === formData.email)) {
        alert('User with this email already exists!');
        setSubmitting(false);
        return;
      }
      
      const newUser = {
        id: 'user-' + Date.now(),
        name: formData.name,
        fullName: formData.name,
        email: formData.email,
        password: formData.password,
        role: formData.role,
        phone: formData.phone,
        status: 'active',
        createdAt: new Date().toISOString(),
      };
      
      // Save to ALL storage locations
      storedUsers.push(newUser);
      localStorage.setItem('fittrust-users', JSON.stringify(storedUsers));
      
      const registeredUsers = JSON.parse(localStorage.getItem('registered-users') || '[]');
      registeredUsers.push(newUser);
      localStorage.setItem('registered-users', JSON.stringify(registeredUsers));
      
      const adminUsers = JSON.parse(localStorage.getItem('admin-created-users') || '[]');
      adminUsers.push(newUser);
      localStorage.setItem('admin-created-users', JSON.stringify(adminUsers));
      
      setShowAddModal(false);
      setFormData({ name: '', email: '', password: '', role: 'staff', phone: '' });
      fetchUsers();
      alert('User added successfully!');
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to add user');
    } finally {
      setSubmitting(false);
    }
  };

  // Update user status (ban/activate)
  const handleToggleStatus = async (user: User) => {
    const newStatus = user.status === 'active' ? 'banned' : 'active';
    
    try {
      const locations = ['fittrust-users', 'registered-users', 'admin-created-users'];
      
      locations.forEach(location => {
        const stored = JSON.parse(localStorage.getItem(location) || '[]');
        const updated = stored.map((u: any) => 
          u.id === user.id ? { ...u, status: newStatus } : u
        );
        localStorage.setItem(location, JSON.stringify(updated));
      });
      
      fetchUsers();
      alert(`User ${newStatus === 'active' ? 'activated' : 'banned'} successfully`);
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to update user status');
    }
  };

  // DELETE USER - Completely removes from all storage
  const handleDeleteUser = async (userId: string) => {
    setDeletingUserId(userId);
    
    try {
      const locations = ['fittrust-users', 'registered-users', 'admin-created-users'];
      
      locations.forEach(location => {
        const stored = JSON.parse(localStorage.getItem(location) || '[]');
        const updated = stored.filter((user: any) => user.id !== userId);
        localStorage.setItem(location, JSON.stringify(updated));
      });
      
      // Update UI immediately
      setUsers(prevUsers => prevUsers.filter(user => user.id !== userId));
      
      console.log(`✅ User ${userId} deleted successfully`);
      setShowDeleteConfirm(null);
      alert('User deleted successfully!');
    } catch (error) {
      console.error('Error deleting user:', error);
      alert('Failed to delete user');
    } finally {
      setDeletingUserId(null);
    }
  };

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Users</h1>
          <p className="text-gray-600 mt-1">Manage customer and staff accounts</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={fetchUsers}
            className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition flex items-center gap-2"
            title="Refresh"
          >
            <RefreshCw size={18} />
            Refresh
          </button>
          <Button onClick={() => setShowAddModal(true)} className="flex items-center gap-2">
            <UserPlus size={20} />
            Add User
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Total Users</p>
              <p className="text-2xl font-bold text-gray-900">{users.length}</p>
            </div>
            <UsersIcon className="w-8 h-8 text-blue-500" />
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Customers</p>
              <p className="text-2xl font-bold text-gray-900">{users.filter(u => u.role === 'customer').length}</p>
            </div>
            <UsersIcon className="w-8 h-8 text-green-500" />
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Staff/Admin</p>
              <p className="text-2xl font-bold text-gray-900">{users.filter(u => u.role !== 'customer').length}</p>
            </div>
            <UsersIcon className="w-8 h-8 text-purple-500" />
          </div>
        </Card>
      </div>

      {/* Search Bar */}
      <Card className="p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search users..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </Card>

      {/* Users Table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Joined</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    No users found
                  </td>
                 </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold mr-3">
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">{user.name}</div>
                          <div className="text-sm text-gray-500">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge 
                        label={user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                        variant={user.role === 'admin' ? 'primary' : user.role === 'staff' ? 'warning' : 'secondary'}
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {user.phone || 'No phone'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge 
                        label={user.status === 'active' ? 'Active' : 'Banned'}
                        variant={user.status === 'active' ? 'success' : 'danger'}
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => handleToggleStatus(user)}
                          className="text-orange-500 hover:text-orange-700 p-1" 
                          title={user.status === 'active' ? 'Ban User' : 'Activate User'}
                        >
                          <Ban size={18} />
                        </button>
                        {user.email !== 'admin@fittrust.com' && (
                          showDeleteConfirm === user.id ? (
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => handleDeleteUser(user.id)}
                                disabled={deletingUserId === user.id}
                                className="px-2 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700"
                              >
                                {deletingUserId === user.id ? '...' : 'Confirm'}
                              </button>
                              <button
                                onClick={() => setShowDeleteConfirm(null)}
                                className="px-2 py-1 bg-gray-300 text-gray-700 text-xs rounded hover:bg-gray-400"
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <button 
                              onClick={() => setShowDeleteConfirm(user.id)}
                              className="text-red-500 hover:text-red-700 p-1" 
                              title="Delete User"
                            >
                              <Trash2 size={18} />
                            </button>
                          )
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Add User Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowAddModal(false)}>
          <div className="bg-white rounded-2xl max-w-md w-full" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <h3 className="text-xl font-bold text-gray-800">Add New User</h3>
              <button onClick={() => setShowAddModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleAddUser} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter full name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter email address"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password *</label>
                <input
                  type="password"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter password"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="customer">Customer</option>
                  <option value="staff">Staff</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter phone number"
                />
              </div>
              <div className="flex gap-3 pt-4">
                <Button type="submit" isLoading={submitting} className="flex-1">
                  Add User
                </Button>
                <Button type="button" variant="secondary" onClick={() => setShowAddModal(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}