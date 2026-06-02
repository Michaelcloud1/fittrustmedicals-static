'use client';

import { useState, useEffect } from 'react';
import { 
  Package, 
  AlertTriangle, 
  Search,
  Plus,
  Minus,
  RefreshCw,
  ChevronRight
} from 'lucide-react';
import Link from 'next/link';

interface Product {
  id: string;
  name: string;
  price: number;
  stockQuantity: number;
  category: string;
  isActive: boolean;
  sku: string;
}

interface InventoryAlert {
  id: string;
  name: string;
  stockQuantity: number;
  threshold: number;
  status: 'low' | 'out' | 'normal';
  category: string;
}

export default function InventoryPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [updating, setUpdating] = useState<string | null>(null);
  const [error, setError] = useState('');

  const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://fittrustmedicals-backend.onrender.com';

  // Fetch products from backend using admin endpoint
  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${BACKEND_URL}/api/admin/products`);
      const data = await response.json();
      
      let productsData = [];
      if (Array.isArray(data)) {
        productsData = data;
      } else if (data.success && data.products) {
        productsData = data.products;
      } else if (data.products) {
        productsData = data.products;
      } else {
        productsData = [];
      }
      
      setProducts(productsData);
      setError('');
    } catch (err) {
      console.error('Error fetching products:', err);
      setError('Failed to load inventory');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Update stock quantity using admin stock endpoint
  const updateStock = async (productId: string, change: number, currentStock: number) => {
    const newStock = Math.max(0, currentStock + change);
    const adjustment = change;
    
    // Optimistic update
    setProducts(prev => prev.map(p => 
      p.id === productId ? { ...p, stockQuantity: newStock } : p
    ));
    
    setUpdating(productId);
    
    try {
      const response = await fetch(`${BACKEND_URL}/api/admin/products/${productId}/stock`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          adjustment: adjustment,
          reason: `Manual stock ${adjustment > 0 ? 'increase' : 'decrease'} by admin`
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update stock');
      }
      
      console.log(`✅ Stock updated for product ${productId} to ${newStock}`);
    } catch (err: any) {
      console.error('Update error:', err);
      // Revert on error
      setProducts(prev => prev.map(p => 
        p.id === productId ? { ...p, stockQuantity: currentStock } : p
      ));
      alert(err.message || 'Failed to update stock. Please try again.');
    } finally {
      setUpdating(null);
    }
  };

  const getStockStatus = (stock: number) => {
    if (stock === 0) {
      return { label: 'Out of Stock', color: 'bg-red-100 text-red-700' };
    }
    if (stock <= 10) {
      return { label: 'Low Stock', color: 'bg-yellow-100 text-yellow-700' };
    }
    return { label: 'In Stock', color: 'bg-green-100 text-green-700' };
  };

  const getAlerts = () => {
    const alerts: InventoryAlert[] = [];
    products.forEach(product => {
      if (product.stockQuantity === 0) {
        alerts.push({
          id: product.id,
          name: product.name,
          stockQuantity: product.stockQuantity,
          threshold: 10,
          status: 'out',
          category: product.category
        });
      } else if (product.stockQuantity <= 10) {
        alerts.push({
          id: product.id,
          name: product.name,
          stockQuantity: product.stockQuantity,
          threshold: 10,
          status: 'low',
          category: product.category
        });
      }
    });
    return alerts;
  };

  const alerts = getAlerts();
  const outOfStock = alerts.filter(a => a.status === 'out');
  const lowStock = alerts.filter(a => a.status === 'low');

  const filteredProducts = products.filter(product =>
    product.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.category?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.sku?.toLowerCase().includes(searchQuery.toLowerCase())
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
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Inventory Management</h1>
          <p className="text-gray-500 mt-1">Monitor stock levels and manage inventory alerts</p>
        </div>
        <button
          onClick={fetchProducts}
          className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {/* Alert Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-red-600 font-medium">Out of Stock</p>
              <p className="text-3xl font-bold text-red-700">{outOfStock.length}</p>
            </div>
            <AlertTriangle className="w-8 h-8 text-red-500" />
          </div>
          {outOfStock.length > 0 && (
            <p className="text-sm text-red-600 mt-2 line-clamp-2">
              {outOfStock.slice(0, 3).map(p => p.name).join(', ')}
              {outOfStock.length > 3 && ` +${outOfStock.length - 3} more`}
            </p>
          )}
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-yellow-600 font-medium">Low Stock (≤10)</p>
              <p className="text-3xl font-bold text-yellow-700">{lowStock.length}</p>
            </div>
            <Package className="w-8 h-8 text-yellow-500" />
          </div>
          {lowStock.length > 0 && (
            <p className="text-sm text-yellow-600 mt-2 line-clamp-2">
              {lowStock.slice(0, 3).map(p => p.name).join(', ')}
              {lowStock.length > 3 && ` +${lowStock.length - 3} more`}
            </p>
          )}
        </div>

        <div className="bg-green-50 border border-green-200 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-600 font-medium">Total Products</p>
              <p className="text-3xl font-bold text-green-700">{products.length}</p>
            </div>
            <Package className="w-8 h-8 text-green-500" />
          </div>
          <p className="text-sm text-green-600 mt-2">
            {products.filter(p => p.stockQuantity > 0).length} in stock
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search products by name, category, or SKU..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      {/* Inventory Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {error && (
          <div className="p-4 text-center text-red-600">
            {error}
            <button onClick={fetchProducts} className="ml-2 text-blue-600 underline">Try Again</button>
          </div>
        )}
        
        {filteredProducts.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <Package className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p>No products found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Product</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">SKU</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Category</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Current Stock</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Status</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredProducts.map((product) => {
                  const status = getStockStatus(product.stockQuantity);
                  return (
                    <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-medium text-gray-900">{product.name}</p>
                          <p className="text-xs text-gray-500 font-mono">ID: {product.id.slice(0, 8)}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 font-mono">{product.sku || 'N/A'}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{product.category || 'Uncategorized'}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => updateStock(product.id, -1, product.stockQuantity)}
                            disabled={updating === product.id || product.stockQuantity === 0}
                            className="p-1 bg-red-100 text-red-600 rounded hover:bg-red-200 transition disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Decrease Stock"
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <span className={`text-lg font-bold min-w-[50px] text-center ${product.stockQuantity === 0 ? 'text-red-600' : product.stockQuantity <= 10 ? 'text-yellow-600' : 'text-gray-900'}`}>
                            {product.stockQuantity}
                          </span>
                          <button
                            onClick={() => updateStock(product.id, 1, product.stockQuantity)}
                            disabled={updating === product.id}
                            className="p-1 bg-green-100 text-green-600 rounded hover:bg-green-200 transition disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Increase Stock"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${status.color}`}>
                          {status.label}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => updateStock(product.id, -5, product.stockQuantity)}
                            disabled={updating === product.id || product.stockQuantity < 5}
                            className="px-2 py-1 text-xs bg-red-100 text-red-600 rounded hover:bg-red-200 transition disabled:opacity-50"
                            title="Decrease by 5"
                          >
                            -5
                          </button>
                          <button
                            onClick={() => updateStock(product.id, 5, product.stockQuantity)}
                            disabled={updating === product.id}
                            className="px-2 py-1 text-xs bg-green-100 text-green-600 rounded hover:bg-green-200 transition disabled:opacity-50"
                            title="Increase by 5"
                          >
                            +5
                          </button>
                          <Link href={`/admin/products/edit/${product.id}`}>
                            <button className="ml-2 p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition" title="Edit Product">
                              <ChevronRight className="w-4 h-4" />
                            </button>
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Stock Summary Footer */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 text-center border border-gray-100">
          <p className="text-2xl font-bold text-gray-900">
            {products.reduce((sum, p) => sum + (p.stockQuantity || 0), 0)}
          </p>
          <p className="text-sm text-gray-500">Total Units</p>
        </div>
        <div className="bg-white rounded-xl p-4 text-center border border-gray-100">
          <p className="text-2xl font-bold text-green-600">
            {products.filter(p => (p.stockQuantity || 0) > 10).length}
          </p>
          <p className="text-sm text-gray-500">Well Stocked</p>
        </div>
        <div className="bg-white rounded-xl p-4 text-center border border-gray-100">
          <p className="text-2xl font-bold text-yellow-600">
            {products.filter(p => (p.stockQuantity || 0) > 0 && (p.stockQuantity || 0) <= 10).length}
          </p>
          <p className="text-sm text-gray-500">Low Stock</p>
        </div>
        <div className="bg-white rounded-xl p-4 text-center border border-gray-100">
          <p className="text-2xl font-bold text-red-600">
            {products.filter(p => (p.stockQuantity || 0) === 0).length}
          </p>
          <p className="text-sm text-gray-500">Out of Stock</p>
        </div>
      </div>
    </div>
  );
}