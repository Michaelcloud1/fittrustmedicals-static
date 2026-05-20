'use client';

import { useState, useEffect } from 'react';
import { ImageUploader } from '@/components/admin/ImageUploader';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { 
  Search, 
  Filter, 
  Grid, 
  List, 
  Download, 
  Upload, 
  Image as ImageIcon,
  Eye,
  Trash2,
  Copy,
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import Image from 'next/image';

interface UploadedImage {
  id: string;
  url: string;
  filename: string;
  size: number;
  type: string;
  uploadedAt: string;
  category?: string;
  alt?: string;
}

export default function MediaLibraryPage() {
  const [images, setImages] = useState<UploadedImage[]>([]);
  const [filteredImages, setFilteredImages] = useState<UploadedImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://fittrustmedicals-backend.onrender.com';
  const categories = ['all', 'medical', 'diagnostics', 'monitoring', 'emergency', 'mobility', 'products', 'logos'];

  // Load images from localStorage first, then from API
  useEffect(() => {
    loadImages();
  }, []);

  // Filter images based on category and search
  useEffect(() => {
    let filtered = [...images];

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(img => img.category === selectedCategory);
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(img => 
        img.filename.toLowerCase().includes(query) ||
        (img.alt && img.alt.toLowerCase().includes(query))
      );
    }

    setFilteredImages(filtered);
  }, [images, selectedCategory, searchQuery]);

  const loadImages = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // First try to load from localStorage
      const storedImages = localStorage.getItem('media-library-images');
      if (storedImages) {
        const parsedImages = JSON.parse(storedImages);
        if (parsedImages.length > 0) {
          setImages(parsedImages);
          setLoading(false);
          return;
        }
      }
      
      // Then try to fetch from backend API
      const response = await fetch(`${BACKEND_URL}/api/media`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.files) {
          setImages(data.files);
          localStorage.setItem('media-library-images', JSON.stringify(data.files));
        }
      } else {
        // Fallback to sample images for demo
        const sampleImages = getSampleImages();
        setImages(sampleImages);
        localStorage.setItem('media-library-images', JSON.stringify(sampleImages));
      }
    } catch (error) {
      console.error('Failed to load images:', error);
      // Fallback to sample images
      const sampleImages = getSampleImages();
      setImages(sampleImages);
      localStorage.setItem('media-library-images', JSON.stringify(sampleImages));
    } finally {
      setLoading(false);
    }
  };

  const getSampleImages = (): UploadedImage[] => {
    return [
      {
        id: '1',
        url: 'https://images.unsplash.com/photo-1584515933487-779824d29309?w=400',
        filename: 'stethoscope.jpg',
        size: 180000,
        type: 'image/jpeg',
        uploadedAt: new Date().toISOString(),
        category: 'diagnostics',
        alt: 'Professional Stethoscope'
      },
      {
        id: '2',
        url: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400',
        filename: 'hospital-bed.jpg',
        size: 250000,
        type: 'image/jpeg',
        uploadedAt: new Date().toISOString(),
        category: 'medical',
        alt: 'Modern Hospital Bed'
      },
      {
        id: '3',
        url: 'https://images.unsplash.com/photo-1631549916768-4119b2e5f926?w=400',
        filename: 'ppe-kit.jpg',
        size: 150000,
        type: 'image/jpeg',
        uploadedAt: new Date().toISOString(),
        category: 'emergency',
        alt: 'PPE Safety Kit'
      }
    ];
  };

  const saveImagesToStorage = (updatedImages: UploadedImage[]) => {
    localStorage.setItem('media-library-images', JSON.stringify(updatedImages));
    setImages(updatedImages);
  };

  const handleUploadSuccess = (newImage: UploadedImage) => {
    const imageWithMeta: UploadedImage = {
      ...newImage,
      id: newImage.id || `img-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      uploadedAt: new Date().toISOString(),
      category: newImage.category || 'medical',
    };
    
    const updatedImages = [imageWithMeta, ...images];
    saveImagesToStorage(updatedImages);
    
    setSuccessMessage(`Image "${imageWithMeta.filename}" uploaded successfully!`);
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  const handleImageSelect = (imageId: string) => {
    setSelectedImages(prev => 
      prev.includes(imageId) 
        ? prev.filter(id => id !== imageId)
        : [...prev, imageId]
    );
  };

  const copyImageUrl = (url: string, filename: string) => {
    const fullUrl = url.startsWith('http') ? url : `${window.location.origin}${url}`;
    navigator.clipboard.writeText(fullUrl);
    setSuccessMessage(`URL for "${filename}" copied to clipboard!`);
    setTimeout(() => setSuccessMessage(null), 2000);
  };

  const deleteImage = (imageId: string, filename: string) => {
    if (confirm(`Are you sure you want to delete "${filename}"?`)) {
      const updatedImages = images.filter(img => img.id !== imageId);
      saveImagesToStorage(updatedImages);
      setSelectedImages(prev => prev.filter(id => id !== imageId));
      setSuccessMessage(`"${filename}" deleted successfully!`);
      setTimeout(() => setSuccessMessage(null), 2000);
    }
  };

  const deleteSelectedImages = () => {
    if (selectedImages.length === 0) return;
    
    if (confirm(`Delete ${selectedImages.length} selected image(s)?`)) {
      const updatedImages = images.filter(img => !selectedImages.includes(img.id));
      saveImagesToStorage(updatedImages);
      setSelectedImages([]);
      setSuccessMessage(`${selectedImages.length} image(s) deleted successfully!`);
      setTimeout(() => setSuccessMessage(null), 2000);
    }
  };

  const getTotalSize = () => {
    const totalBytes = images.reduce((acc, img) => acc + img.size, 0);
    return (totalBytes / 1024 / 1024).toFixed(1);
  };

  const getImageCountByCategory = (category: string) => {
    if (category === 'all') return images.length;
    return images.filter(img => img.category === category).length;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Success/Error Messages */}
      {successMessage && (
        <div className="fixed top-20 right-4 z-50 bg-green-500 text-white px-4 py-3 rounded-lg shadow-lg animate-slide-in">
          {successMessage}
        </div>
      )}
      {error && (
        <div className="fixed top-20 right-4 z-50 bg-red-500 text-white px-4 py-3 rounded-lg shadow-lg animate-slide-in">
          {error}
        </div>
      )}

      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-purple-800 rounded-xl p-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2">
              📸 Media Library
            </h1>
            <p className="text-purple-100 text-lg">
              Upload and manage your medical equipment images
            </p>
          </div>
          
          <div className="bg-white/10 backdrop-blur-sm rounded-full p-4">
            <ImageIcon className="w-12 h-12 text-white" />
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
          <div className="bg-white/10 backdrop-blur rounded-lg p-4 text-center">
            <div className="text-2xl font-bold">{images.length}</div>
            <div className="text-purple-200 text-sm">Total Images</div>
          </div>
          <div className="bg-white/10 backdrop-blur rounded-lg p-4 text-center">
            <div className="text-2xl font-bold">{getTotalSize()}MB</div>
            <div className="text-purple-200 text-sm">Total Size</div>
          </div>
          <div className="bg-white/10 backdrop-blur rounded-lg p-4 text-center">
            <div className="text-2xl font-bold">{filteredImages.length}</div>
            <div className="text-purple-200 text-sm">Filtered Results</div>
          </div>
          <div className="bg-white/10 backdrop-blur rounded-lg p-4 text-center">
            <button
              onClick={loadImages}
              className="flex items-center justify-center gap-2 w-full text-white hover:bg-white/20 py-2 rounded-lg transition"
            >
              <RefreshCw size={16} />
              <span>Refresh</span>
            </button>
          </div>
        </div>
      </div>

      {/* Image Upload Section */}
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-green-100 rounded-full p-2">
            <Upload className="w-5 h-5 text-green-600" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900">Upload New Images</h2>
        </div>
        
        <ImageUploader 
          category="medical"
          onUploadSuccess={handleUploadSuccess}
          maxFiles={20}
          currentImages={images}
        />
        
        <p className="text-xs text-gray-500 mt-4">
          Supported formats: JPG, PNG, GIF, WebP. Max file size: 5MB per image.
        </p>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <div className="flex flex-col lg:flex-row gap-4 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search images by filename..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant={viewMode === 'grid' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setViewMode('grid')}
              className="flex items-center gap-2"
            >
              <Grid size={16} />
              Grid
            </Button>
            <Button
              variant={viewMode === 'list' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setViewMode('list')}
              className="flex items-center gap-2"
            >
              <List size={16} />
              List
            </Button>
          </div>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors text-sm capitalize ${
                selectedCategory === category
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {category}
              <span className="ml-2 opacity-75">
                ({getImageCountByCategory(category)})
              </span>
            </button>
          ))}
        </div>

        {/* Bulk Actions */}
        {selectedImages.length > 0 && (
          <div className="mt-4 flex items-center gap-4 p-3 bg-purple-50 rounded-lg border border-purple-200">
            <span className="text-purple-800 font-medium">
              {selectedImages.length} image(s) selected
            </span>
            <Button 
              variant="outline" 
              size="sm"
              className="flex items-center gap-2 text-red-600 border-red-300 hover:bg-red-50"
              onClick={deleteSelectedImages}
            >
              <Trash2 size={16} />
              Delete Selected
            </Button>
            <button
              onClick={() => setSelectedImages([])}
              className="text-gray-500 hover:text-gray-700 text-sm"
            >
              Clear Selection
            </button>
          </div>
        )}
      </div>

      {/* Images Display */}
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-gray-900">
            Image Library ({filteredImages.length})
          </h3>
          
          {filteredImages.length > 0 && (
            <div className="flex items-center gap-2">
              <Badge 
                label={`${filteredImages.filter(img => img.type?.startsWith('image/')).length} Images`} 
                variant="primary" 
              />
              <Badge 
                label={`${(filteredImages.reduce((acc, img) => acc + img.size, 0) / 1024 / 1024).toFixed(1)}MB`} 
                variant="secondary" 
              />
            </div>
          )}
        </div>

        {filteredImages.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <ImageIcon className="w-12 h-12 text-gray-400" />
            </div>
            <h4 className="text-xl font-medium text-gray-900 mb-2">No Images Found</h4>
            <p className="text-gray-600 mb-6">
              {searchQuery || selectedCategory !== 'all' 
                ? 'Try adjusting your search terms or filters' 
                : 'Upload some images to get started with your media library'
              }
            </p>
            <Button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
              }}
              className="flex items-center gap-2"
            >
              <Eye size={16} />
              {searchQuery || selectedCategory !== 'all' ? 'Clear Filters' : 'Upload Images'}
            </Button>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {filteredImages.map((image) => (
              <div 
                key={image.id}
                className={`group relative bg-gray-50 rounded-lg overflow-hidden border-2 transition-all hover:border-purple-300 hover:shadow-md ${
                  selectedImages.includes(image.id) ? 'ring-2 ring-purple-500 border-purple-500' : 'border-gray-200'
                } aspect-square`}
              >
                <input
                  type="checkbox"
                  checked={selectedImages.includes(image.id)}
                  onChange={() => handleImageSelect(image.id)}
                  className="absolute top-2 left-2 z-10 w-4 h-4 text-purple-600 bg-white border-gray-300 rounded focus:ring-purple-500"
                  onClick={(e) => e.stopPropagation()}
                />

                <div className="relative w-full h-full">
                  <Image
                    src={image.url}
                    alt={image.alt || image.filename}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 50vw, (max-width: 1200px) 25vw, 16vw"
                  />
                </div>

                <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-75 text-white p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <p className="font-medium truncate text-xs">{image.filename}</p>
                  <p className="text-xs text-gray-300">{(image.size / 1024).toFixed(1)} KB</p>
                </div>

                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="flex gap-1">
                    <button
                      onClick={() => copyImageUrl(image.url, image.filename)}
                      className="bg-white text-gray-700 p-1.5 rounded shadow-md hover:bg-gray-50"
                      title="Copy URL"
                    >
                      <Copy size={12} />
                    </button>
                    <button
                      onClick={() => deleteImage(image.id, image.filename)}
                      className="bg-white text-red-600 p-1.5 rounded shadow-md hover:bg-red-50"
                      title="Delete"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {filteredImages.map((image) => (
              <div 
                key={image.id}
                className={`flex items-center p-4 bg-gray-50 rounded-lg border-2 transition-all ${
                  selectedImages.includes(image.id) ? 'ring-2 ring-purple-500 border-purple-500' : 'border-gray-200'
                }`}
              >
                <input
                  type="checkbox"
                  checked={selectedImages.includes(image.id)}
                  onChange={() => handleImageSelect(image.id)}
                  className="mr-4 w-4 h-4 text-purple-600"
                />
                
                <div className="relative w-16 h-16 flex-shrink-0 bg-gray-200 rounded overflow-hidden">
                  <Image
                    src={image.url}
                    alt={image.filename}
                    fill
                    className="object-cover"
                  />
                </div>
                
                <div className="flex-1 ml-4">
                  <p className="font-medium text-gray-900">{image.filename}</p>
                  <p className="text-xs text-gray-500">
                    {(image.size / 1024).toFixed(1)} KB • {formatDate(image.uploadedAt)}
                  </p>
                  {image.category && (
                    <span className="inline-block px-2 py-0.5 bg-purple-100 text-purple-700 text-xs rounded-full mt-1">
                      {image.category}
                    </span>
                  )}
                </div>
                
                <div className="flex gap-2">
                  <button
                    onClick={() => copyImageUrl(image.url, image.filename)}
                    className="p-2 text-gray-500 hover:text-purple-600 transition"
                    title="Copy URL"
                  >
                    <Copy size={16} />
                  </button>
                  <button
                    onClick={() => deleteImage(image.id, image.filename)}
                    className="p-2 text-gray-500 hover:text-red-600 transition"
                    title="Delete"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}