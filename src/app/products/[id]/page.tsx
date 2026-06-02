// src/app/product/[id]/page.tsx

'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Breadcrumb } from '@/components/ui/Breadcrumb';
import { useCartStore } from '@/stores/cartStore';
import { Star, Heart, ShoppingCart, Truck, Shield, ArrowLeft, Minus, Plus, RefreshCw } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  category: string;
  description: string;
  image: string;
  stockQuantity: number;
  rating: number;
  reviewCount: number;
  isActive: boolean;
}

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const addItem = useCartStore((state) => state.addItem);
  const [quantity, setQuantity] = useState(1);
  const [isFavorite, setIsFavorite] = useState(false);
  const [adding, setAdding] = useState(false);
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const productId = params.id as string;

  // Fetch product from API
  const fetchProduct = async (showRefreshIndicator = false) => {
    if (showRefreshIndicator) setRefreshing(true);
    
    try {
      setError('');
      
      console.log('🔍 Fetching product with ID:', productId);
      
      // Fetch single product by ID using the catalog API with query parameter
      const response = await fetch(`/api/catalog/products?id=${productId}`);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      const data = await response.json();
      console.log('📦 API Response:', data);
      
      if (data.success && data.product) {
        console.log('✅ Found product:', data.product);
        setProduct(data.product);
      } else {
        console.log('❌ Product not found');
        setError(`Product with ID "${productId}" was not found.`);
      }
    } catch (err) {
      console.error('❌ Error fetching product:', err);
      setError('Unable to load product. Please try again later.');
    } finally {
      setLoading(false);
      if (showRefreshIndicator) setRefreshing(false);
    }
  };

  // Refresh stock only (lightweight update)
  const refreshStock = async () => {
    if (!productId) return;
    
    try {
      const response = await fetch(`/api/catalog/products?id=${productId}`);
      const data = await response.json();
      
      if (data.success && data.product && data.product.stockQuantity !== undefined) {
        setProduct(prev => prev ? { ...prev, stockQuantity: data.product.stockQuantity } : prev);
        console.log(`🔄 Stock refreshed: ${data.product.stockQuantity} units`);
      }
    } catch (err) {
      console.error('Error refreshing stock:', err);
    }
  };

  useEffect(() => {
    if (productId) {
      fetchProduct();
    } else {
      setError('No product ID provided');
      setLoading(false);
    }
    
    // Check if product is in wishlist
    try {
      const wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
      setIsFavorite(wishlist.some((item: any) => item.id === productId));
    } catch (error) {
      console.error('Error checking wishlist:', error);
    }
  }, [productId]);

  // Set up auto-refresh every 30 seconds to keep stock updated
  useEffect(() => {
    if (!product) return;
    
    const interval = setInterval(() => {
      refreshStock();
    }, 30000); // Refresh every 30 seconds
    
    return () => clearInterval(interval);
  }, [product]);

  const formatNaira = (price: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const handleAddToCart = () => {
    if (!product) return;
    
    setAdding(true);
    
    addItem({
      productId: product.id,
      name: product.name,
      price: product.price,
      quantity: quantity,
      image: product.image || '/placeholder.svg',
      category: product.category,
      maxStock: product.stockQuantity,
    });
    
    setTimeout(() => {
      setAdding(false);
      router.push('/cart');
    }, 500);
  };

  const toggleWishlist = () => {
    if (!product) return;
    
    try {
      const wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
      if (isFavorite) {
        const updatedWishlist = wishlist.filter((item: any) => item.id !== productId);
        localStorage.setItem('wishlist', JSON.stringify(updatedWishlist));
        setIsFavorite(false);
      } else {
        wishlist.push({
          id: product.id,
          name: product.name,
          price: product.price,
          originalPrice: product.originalPrice,
          image: product.image,
          rating: product.rating,
          discountPercentage: product.originalPrice 
            ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
            : 0
        });
        localStorage.setItem('wishlist', JSON.stringify(wishlist));
        setIsFavorite(true);
      }
    } catch (error) {
      console.error('Error updating wishlist:', error);
    }
  };

  const renderStars = () => {
    const rating = product?.rating || 0;
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Star
          key={i}
          size={20}
          className={i <= Math.floor(rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}
        />
      );
    }
    return stars;
  };

  const isInStock = product?.stockQuantity ? product.stockQuantity > 0 : false;
  const stockDisplay = isInStock 
    ? `${product?.stockQuantity} units available` 
    : 'Out of stock';

  const getStockStatusColor = () => {
    if (!product) return 'text-gray-500';
    if (product.stockQuantity <= 0) return 'text-red-600';
    if (product.stockQuantity <= 5) return 'text-yellow-600';
    return 'text-green-600';
  };

  const getStockBackgroundColor = () => {
    if (!product) return 'bg-gray-50';
    if (product.stockQuantity <= 0) return 'bg-red-50';
    if (product.stockQuantity <= 5) return 'bg-yellow-50';
    return 'bg-green-50';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="text-center max-w-md p-8 bg-white rounded-xl shadow-lg">
          <div className="text-red-500 text-6xl mb-4">🔍</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Product Not Found</h2>
          <p className="text-gray-600 mb-4">{error || 'The product you are looking for does not exist.'}</p>
          <p className="text-sm text-gray-500 mb-6">Product ID: {productId}</p>
          <div className="flex gap-3 justify-center">
            <Button onClick={() => router.push('/products')} variant="primary">
              Browse Products
            </Button>
            <Button onClick={() => router.push('/')} variant="secondary">
              Go Home
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const discountPercentage = product.originalPrice && product.originalPrice > product.price
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <Breadcrumb
          items={[
            { label: 'Home', href: '/' },
            { label: 'Products', href: '/products' },
            { label: product.name },
          ]}
        />

        <div className="flex justify-between items-center mb-6 mt-4">
          <button 
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors"
          >
            <ArrowLeft size={20} />
            Back to Products
          </button>
          
          <button 
            onClick={() => refreshStock()}
            disabled={refreshing}
            className="flex items-center gap-2 text-sm text-gray-500 hover:text-blue-600 transition-colors"
          >
            <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} />
            Check Stock
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Product Image */}
          <div>
            <div className="aspect-square bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
              <img 
                src={product.image || '/placeholder.svg'} 
                alt={product.name}
                className="w-full h-full object-contain p-4 hover:scale-105 transition-transform duration-300"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/placeholder.svg';
                }}
              />
            </div>
          </div>

          {/* Product Info */}
          <div>
            <Badge label={product.category} variant="primary" className="mb-4" />
            <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-2">{product.name}</h1>
            <p className="text-sm text-gray-500 mb-4">SKU: {product.id.slice(0, 12)}</p>
            
            <div className="flex items-center gap-3 mb-6">
              <div className="flex items-center gap-1">{renderStars()}</div>
              <span className="text-gray-600">
                {product.rating || 0} out of 5 ({product.reviewCount || 0} reviews)
              </span>
            </div>

            {/* Price Section */}
            <div className="mb-6">
              <div className="flex items-center gap-3">
                <p className="text-4xl font-bold text-blue-600">{formatNaira(product.price)}</p>
                {discountPercentage > 0 && <Badge label={`-${discountPercentage}%`} variant="danger" />}
              </div>
              {product.originalPrice && product.originalPrice > product.price && (
                <p className="text-lg text-gray-400 line-through mt-1">{formatNaira(product.originalPrice)}</p>
              )}
            </div>

            {/* Stock Status - Enhanced Display */}
            <div className={`mb-6 p-4 rounded-lg ${getStockBackgroundColor()} border`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className={`font-semibold ${getStockStatusColor()}`}>
                    {product.stockQuantity <= 0 ? '❌ Out of Stock' : 
                     product.stockQuantity <= 5 ? '⚠️ Low Stock' : 
                     '✅ In Stock'}
                  </p>
                  <p className={`text-sm mt-1 ${getStockStatusColor()}`}>
                    {stockDisplay}
                  </p>
                </div>
                {product.stockQuantity > 0 && product.stockQuantity <= 5 && (
                  <div className="bg-yellow-100 text-yellow-800 text-xs px-3 py-1 rounded-full">
                    Only {product.stockQuantity} left!
                  </div>
                )}
              </div>
              
              {/* Stock progress bar for visual indication */}
              {product.stockQuantity > 0 && (
                <div className="mt-3 w-full bg-gray-200 rounded-full h-1.5">
                  <div 
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      product.stockQuantity <= 5 ? 'bg-yellow-500' : 'bg-green-500'
                    }`}
                    style={{ width: `${Math.min(100, (product.stockQuantity / 100) * 100)}%` }}
                  />
                </div>
              )}
            </div>

            {/* Description */}
            <div className="mb-6">
              <h3 className="font-bold text-lg mb-2">Description</h3>
              <p className="text-gray-600 whitespace-pre-line leading-relaxed">{product.description}</p>
            </div>

            {/* Product Details Table */}
            <div className="mb-6 bg-gray-50 p-4 rounded-lg border border-gray-100">
              <h3 className="font-bold mb-3 text-gray-800">Product Details</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between py-1">
                  <span className="text-gray-600">Category:</span>
                  <span className="font-medium text-gray-800">{product.category}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-gray-600">Status:</span>
                  <span className={`font-medium capitalize ${isInStock ? 'text-green-600' : 'text-red-600'}`}>
                    {isInStock ? 'In Stock' : 'Out of Stock'}
                  </span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-gray-600">SKU:</span>
                  <span className="font-mono text-gray-800">{product.id.slice(0, 12)}</span>
                </div>
              </div>
            </div>

            {/* Quantity Selector */}
            {isInStock && (
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Quantity</label>
                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => setQuantity(Math.max(1, quantity - 1))} 
                    disabled={quantity <= 1} 
                    className="w-10 h-10 border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50"
                  >
                    <Minus size={18} className="mx-auto" />
                  </button>
                  <input 
                    type="number" 
                    value={quantity} 
                    onChange={(e) => {
                      const val = parseInt(e.target.value);
                      setQuantity(Math.min(product.stockQuantity, Math.max(1, isNaN(val) ? 1 : val)));
                    }} 
                    className="w-20 text-center border border-gray-300 rounded-lg px-3 py-2" 
                  />
                  <button 
                    onClick={() => setQuantity(Math.min(product.stockQuantity, quantity + 1))} 
                    disabled={quantity >= product.stockQuantity} 
                    className="w-10 h-10 border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50"
                  >
                    <Plus size={18} className="mx-auto" />
                  </button>
                  <span className="text-sm text-gray-500 ml-2">Max: {product.stockQuantity}</span>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-4 mb-6">
              <Button 
                size="lg" 
                onClick={handleAddToCart} 
                isLoading={adding} 
                disabled={!isInStock} 
                className="flex-1 bg-blue-600 hover:bg-blue-700"
              >
                <ShoppingCart size={20} className="mr-2" />
                {!isInStock ? 'Out of Stock' : 'Add to Cart'}
              </Button>
              <button 
                onClick={toggleWishlist} 
                className={`w-12 h-12 border rounded-lg transition flex items-center justify-center ${isFavorite ? 'border-red-500 bg-red-50' : 'border-gray-300 hover:border-red-500'}`}
              >
                <Heart size={20} className={isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-400'} />
              </button>
            </div>

            {/* Shipping Info */}
            <div className="grid grid-cols-2 gap-4 pt-6 border-t">
              <div className="flex items-center gap-3">
                <Truck className="text-blue-600" size={24} />
                <div>
                  <p className="font-medium text-sm">Free Shipping</p>
                  <p className="text-xs text-gray-600">On orders over ₦50,000</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Shield className="text-blue-600" size={24} />
                <div>
                  <p className="font-medium text-sm">Secure Payment</p>
                  <p className="text-xs text-gray-600">100% protected</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Customer Reviews</h2>
          <Card className="p-8 text-center">
            <Star className="text-yellow-400 w-12 h-12 mx-auto mb-3" />
            <p className="text-gray-600">Be the first to review this product!</p>
            <Button variant="secondary" className="mt-4">Write a Review</Button>
          </Card>
        </div>
      </div>
    </div>
  );
}