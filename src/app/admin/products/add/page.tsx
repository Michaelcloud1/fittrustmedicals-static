'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Alert } from '@/components/ui/Alert';
import { Upload, X, Image as ImageIcon, Loader2 } from 'lucide-react';
import Image from 'next/image';

export default function AddProductPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [imagePreview, setImagePreview] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    originalPrice: '',
    category: '',
    description: '',
    stock: '',
    isPromotional: false,
    discountPercentage: '',
    featured: false,
  });

  // Cloudinary configuration
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'dijqk2arj';
  const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || 'fittrust_products';

  // Handle image upload to Cloudinary
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file (JPEG, PNG, GIF, WEBP)');
      setTimeout(() => setError(''), 3000);
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('File size must be less than 5MB');
      setTimeout(() => setError(''), 3000);
      return;
    }

    // Show preview
    const previewUrl = URL.createObjectURL(file);
    setImagePreview(previewUrl);

    // Upload to Cloudinary
    setUploadingImage(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', uploadPreset);
    formData.append('folder', 'fittrust-products');

    try {
      console.log('Uploading to Cloudinary...');
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        {
          method: 'POST',
          body: formData,
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || 'Upload failed');
      }

      // Save the Cloudinary image URL
      setImageUrl(data.secure_url);
      setSuccess('Image uploaded successfully!');
      setTimeout(() => setSuccess(''), 3000);
      
    } catch (err) {
      console.error('Upload error:', err);
      setError(err instanceof Error ? err.message : 'Failed to upload image');
      setImagePreview('');
      setTimeout(() => setError(''), 3000);
    } finally {
      setUploadingImage(false);
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate image is uploaded
    if (!imageUrl) {
      setError('Please upload a product image first');
      setTimeout(() => setError(''), 3000);
      return;
    }

    // Validate price is a valid number
    const priceValue = parseFloat(formData.price);
    if (isNaN(priceValue) || priceValue <= 0) {
      setError('Please enter a valid price (must be greater than 0)');
      setTimeout(() => setError(''), 3000);
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const productData = {
        name: formData.name,
        price: priceValue,
        originalPrice: formData.originalPrice ? parseFloat(formData.originalPrice) : undefined,
        category: formData.category,
        description: formData.description,
        image: imageUrl,
        stock: parseInt(formData.stock) || 0,
        isPromotional: formData.isPromotional,
        discountPercentage: formData.discountPercentage ? parseInt(formData.discountPercentage) : undefined,
        featured: formData.featured,
        status: 'active',
        rating: 0,
        reviewCount: 0,
        salesCount: 0,
      };

      const response = await fetch('/api/catalog/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to add product');
      }

      setSuccess('Product added successfully!');
      
      // Reset form
      setFormData({
        name: '',
        price: '',
        originalPrice: '',
        category: '',
        description: '',
        stock: '',
        isPromotional: false,
        discountPercentage: '',
        featured: false,
      });
      setImagePreview('');
      setImageUrl('');

      // Redirect after 2 seconds
      setTimeout(() => {
        router.push('/admin/products');
      }, 2000);
      
    } catch (err) {
      console.error('Save product error:', err);
      setError(err instanceof Error ? err.message : 'Failed to add product');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  return (
    <div className="max-w-3xl mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Add New Product</h1>
      
      {error && (
        <Alert type="error" message={error} className="mb-4" onClose={() => setError('')} />
      )}
      
      {success && (
        <Alert type="success" message={success} className="mb-4" onClose={() => setSuccess('')} />
      )}
      
      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-4">
        
        {/* ===== IMAGE UPLOAD SECTION ===== */}
        <div className="space-y-2 border-b pb-4">
          <label className="block text-sm font-medium text-gray-700">
            Product Image <span className="text-red-500">*</span>
          </label>
          
          <div className="flex items-start gap-4">
            {/* Image Preview */}
            <div className="w-32 h-32 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden border-2 border-dashed border-gray-300">
              {imagePreview ? (
                <img 
                  src={imagePreview} 
                  alt="Preview" 
                  className="w-full h-full object-cover"
                />
              ) : (
                <ImageIcon className="w-8 h-8 text-gray-400" />
              )}
            </div>
            
            {/* Upload Button */}
            <div className="flex-1">
              <label className="cursor-pointer inline-block">
                <div className={`bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg inline-flex items-center gap-2 transition ${uploadingImage ? 'opacity-50 cursor-not-allowed' : ''}`}>
                  {uploadingImage ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Upload className="w-4 h-4" />
                  )}
                  {uploadingImage ? 'Uploading...' : 'Choose Image'}
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={uploadingImage}
                  className="hidden"
                />
              </label>
            </div>
          </div>
          
          {/* Show the uploaded image URL */}
          {imageUrl && (
            <div className="mt-2 p-2 bg-green-50 rounded-lg border border-green-200">
              <p className="text-xs text-green-700 mb-1">✅ Image uploaded successfully</p>
            </div>
          )}
        </div>
        
        {/* ===== PRODUCT DETAILS ===== */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Product Name"
            name="name"
            required
            value={formData.name}
            onChange={handleChange}
            placeholder="Enter product name"
          />
          
          <Input
            label="Price (₦)"
            name="price"
            type="number"
            step="0.01"
            required
            value={formData.price}
            onChange={handleChange}
            placeholder="e.g., 25000"
          />
          
          <Input
            label="Original Price (₦) - Optional"
            name="originalPrice"
            type="number"
            step="0.01"
            value={formData.originalPrice}
            onChange={handleChange}
            placeholder="e.g., 30000"
          />
          
          <Input
            label="Category"
            name="category"
            required
            value={formData.category}
            onChange={handleChange}
            placeholder="e.g., Diagnostics, Monitoring"
          />
          
          <Input
            label="Stock Quantity"
            name="stock"
            type="number"
            required
            value={formData.stock}
            onChange={handleChange}
            placeholder="e.g., 50"
          />
          
          <Input
            label="Discount Percentage - Optional"
            name="discountPercentage"
            type="number"
            value={formData.discountPercentage}
            onChange={handleChange}
            placeholder="e.g., 25"
          />
        </div>
        
        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
          <textarea
            name="description"
            required
            value={formData.description}
            onChange={handleChange}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter product description"
          />
        </div>
        
        {/* Checkboxes */}
        <div className="flex gap-6">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              name="isPromotional"
              checked={formData.isPromotional}
              onChange={handleChange}
              className="w-4 h-4 text-blue-600 rounded"
            />
            <span className="text-sm text-gray-700">Mark as Promotional</span>
          </label>
          
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              name="featured"
              checked={formData.featured}
              onChange={handleChange}
              className="w-4 h-4 text-blue-600 rounded"
            />
            <span className="text-sm text-gray-700">Mark as Featured</span>
          </label>
        </div>
        
        {/* Buttons */}
        <div className="flex gap-4 pt-4">
          <Button 
            type="submit" 
            isLoading={loading}
            disabled={!imageUrl || !formData.name || !formData.price || !formData.category}
          >
            Add Product
          </Button>
          
          <Button type="button" variant="secondary" onClick={() => router.back()}>
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}