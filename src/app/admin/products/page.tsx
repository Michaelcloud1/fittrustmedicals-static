'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Plus, Search, Edit, Trash2, Eye, X, Save } from 'lucide-react';
import Link from 'next/link';

interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  category: string;
  description: string;
  image: string;
  stock: number;
  status: string;
  rating: number;
  reviewCount: number;
}

export default function AdminProductsPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Edit modal states
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editFormData, setEditFormData] = useState({
    name: '',
    price: 0,
    originalPrice: 0,
    category: '',
    description: '',
    image: '',
    stock: 0,
    status: 'active'
  });
  const [updating, setUpdating] = useState(false);

  // Fetch products from API
  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/catalog/products');
      const data = await response.json();
      
      let productsData = [];
      if (data.success && data.products) {
        productsData = data.products;
      } else if (Array.isArray(data)) {
        productsData = data;
      } else if (data.products) {
        productsData = data.products;
      }
      
      setProducts(productsData);
    } catch (err) {
      console.error('Error fetching products:', err);
      setError('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Delete product
  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    
    try {
      const response = await fetch(`/api/catalog/products?id=${id}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        fetchProducts();
      } else {
        alert('Failed to delete product');
      }
    } catch (err) {
      console.error('Delete error:', err);
      alert('Failed to delete product');
    }
  };

  // Open edit modal with product data
  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setEditFormData({
      name: product.name,
      price: product.price,
      originalPrice: product.originalPrice || 0,
      category: product.category,
      description: product.description || '',
      image: product.image || '',
      stock: product.stock,
      status: product.status || 'active'
    });
    setShowEditModal(true);
  };

  // Handle edit form input changes
  const handleEditInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({
      ...prev,
      [name]: name === 'price' || name === 'originalPrice' || name === 'stock' ? parseFloat(value) || 0 : value
    }));
  };

  // Submit edited product
  const handleUpdateProduct = async () => {
    if (!editingProduct) return;
    
    setUpdating(true);
    try {
      const response = await fetch('/api/catalog/products', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: editingProduct.id, ...editFormData }),
      });
      
      if (response.ok) {
        alert('Product updated successfully!');
        setShowEditModal(false);
        setEditingProduct(null);
        fetchProducts();
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to update product');
      }
    } catch (err) {
      console.error('Update error:', err);
      alert('Failed to update product');
    } finally {
      setUpdating(false);
    }
  };

  const formatNaira = (price: number) => {
    return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', minimumFractionDigits: 0 }).format(price);
  };

  const filteredProducts = products.filter(product => product.name.toLowerCase().includes(searchQuery.toLowerCase()));

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
        <p className="text-red-600">{error}</p>
        <button onClick={fetchProducts} className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg">Try Again</button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Products</h1>
          <p className="text-gray-600 mt-1">Manage your product inventory</p>
        </div>
        <Link href="/admin/products/add">
          <Button className="flex items-center gap-2"><Plus size={20} />Add Product</Button>
        </Link>
      </div>

      {/* Search Bar */}
      <Card className="p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input type="text" placeholder="Search products..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
      </Card>

      {/* Products Table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th><th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th></tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredProducts.length === 0 ? (
                <tr><td colSpan={6} className="px-6 py-12 text-center text-gray-500">No products found. Click "Add Product" to create one.</td></tr>
              ) : (
                filteredProducts.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap"><div className="flex items-center"><div className="w-10 h-10 bg-gray-100 rounded-lg flex-shrink-0 mr-3 overflow-hidden"><img src={product.image || '/placeholder.svg'} alt={product.name} className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder.svg'; }} /></div><div className="font-medium text-gray-900">{product.name}</div></div></td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{product.category}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">{formatNaira(product.price)}</td>
                    <td className="px-6 py-4 whitespace-nowrap"><span className={`text-sm font-medium ${product.stock < 20 ? 'text-orange-600' : 'text-gray-900'}`}>{product.stock}</span></td>
                    <td className="px-6 py-4 whitespace-nowrap"><Badge label={product.status === 'active' ? 'Active' : 'Inactive'} variant={product.status === 'active' ? 'success' : 'warning'} /></td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        <Link href={`/products/${product.id}`} target="_blank"><button className="text-gray-500 hover:text-blue-600 p-1" title="View Product"><Eye size={18} /></button></Link>
                        <button onClick={() => handleEdit(product)} className="text-blue-500 hover:text-blue-700 p-1" title="Edit Product"><Edit size={18} /></button>
                        <button onClick={() => handleDelete(product.id)} className="text-red-500 hover:text-red-700 p-1" title="Delete Product"><Trash2 size={18} /></button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Edit Product Modal */}
      {showEditModal && editingProduct && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowEditModal(false)}>
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-white border-b border-gray-100 p-6 flex justify-between items-center">
              <div><h3 className="text-xl font-bold text-gray-800">Edit Product</h3><p className="text-sm text-gray-500 mt-1">Update product information</p></div>
              <button onClick={() => setShowEditModal(false)} className="p-2 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-5">
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Product Name *</label><input type="text" name="name" value={editFormData.name} onChange={handleEditInputChange} className="w-full px-4 py-2.5 border border-gray-300 rounded-xl" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Price (₦) *</label><input type="number" name="price" value={editFormData.price} onChange={handleEditInputChange} className="w-full px-4 py-2.5 border border-gray-300 rounded-xl" /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Original Price (₦)</label><input type="number" name="originalPrice" value={editFormData.originalPrice} onChange={handleEditInputChange} className="w-full px-4 py-2.5 border border-gray-300 rounded-xl" /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Category *</label><input type="text" name="category" value={editFormData.category} onChange={handleEditInputChange} className="w-full px-4 py-2.5 border border-gray-300 rounded-xl" /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Stock Quantity *</label><input type="number" name="stock" value={editFormData.stock} onChange={handleEditInputChange} className="w-full px-4 py-2.5 border border-gray-300 rounded-xl" /></div>
              </div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Status</label><select name="status" value={editFormData.status} onChange={handleEditInputChange} className="w-full px-4 py-2.5 border border-gray-300 rounded-xl"><option value="active">Active</option><option value="inactive">Inactive</option></select></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label><input type="text" name="image" value={editFormData.image} onChange={handleEditInputChange} className="w-full px-4 py-2.5 border border-gray-300 rounded-xl" />
              {editFormData.image && <div className="mt-3 w-32 h-32 bg-gray-100 rounded-lg overflow-hidden"><img src={editFormData.image} alt="Preview" className="w-full h-full object-cover" /></div>}</div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Description</label><textarea name="description" value={editFormData.description} onChange={handleEditInputChange} rows={4} className="w-full px-4 py-2.5 border border-gray-300 rounded-xl" /></div>
            </div>
            <div className="sticky bottom-0 bg-white border-t border-gray-100 p-6 flex justify-end gap-3">
              <button onClick={() => setShowEditModal(false)} className="px-5 py-2.5 border border-gray-300 rounded-xl text-gray-700 font-medium hover:bg-gray-50">Cancel</button>
              <button onClick={handleUpdateProduct} disabled={updating} className="px-5 py-2.5 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 flex items-center space-x-2">{updating ? <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div> : <Save className="w-4 h-4" />}<span>{updating ? 'Updating...' : 'Update Product'}</span></button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}