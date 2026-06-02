'use client';

import { motion } from 'framer-motion';
import { Heart, ShoppingCart, Star, AlertTriangle } from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import SafeImage, { getValidImageUrl } from '@/components/ui/SafeImage';
import { useCartStore } from '@/stores/cartStore';
import { useAuthStore } from '@/stores/authStore';

interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  category: string;
  description: string;
  image: string;
  stockQuantity: number;
  isActive: boolean;
  isPromotional?: boolean;
  discountPercentage?: number;
  featured?: boolean;
  rating: number;
  reviewCount: number;
}

interface ProductCardProps {
  product: Product;
  showDiscount?: boolean;
  onAddSuccess?: () => void;
}

export function ProductCard({ product, showDiscount, onAddSuccess }: ProductCardProps) {
  const { addItem } = useCartStore();
  const { isAuthenticated, addToWishlist, removeFromWishlist, isInWishlist } = useAuthStore();
  
  const inWishlist = isInWishlist(product.id);
  const [imageError, setImageError] = useState(false);
  const [currentStock, setCurrentStock] = useState(product.stockQuantity);
  const [isAdding, setIsAdding] = useState(false);

  // Refresh stock periodically to show real-time updates
  useEffect(() => {
    setCurrentStock(product.stockQuantity);
  }, [product.stockQuantity]);

  // Optional: Fetch fresh stock data every 30 seconds
  useEffect(() => {
    const fetchFreshStock = async () => {
      try {
        const response = await fetch(`/api/catalog/products?id=${product.id}`);
        const data = await response.json();
        if (data.success && data.product && data.product.stockQuantity !== undefined) {
          setCurrentStock(data.product.stockQuantity);
        }
      } catch (error) {
        // Silent fail - keep using existing stock
      }
    };

    const interval = setInterval(fetchFreshStock, 30000);
    return () => clearInterval(interval);
  }, [product.id]);

  const imageUrl = imageError 
    ? getValidImageUrl(null, product.category)
    : getValidImageUrl(product.image, product.category);

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (currentStock <= 0) return;
    if (isAdding) return;
    
    setIsAdding(true);
    
    addItem({
      productId: product.id,
      name: product.name,
      price: product.price,
      quantity: 1,
      image: imageUrl,
      category: product.category,
      maxStock: currentStock,
    });
    
    // Optimistic update - decrease local stock
    setCurrentStock(prev => Math.max(0, prev - 1));
    
    onAddSuccess?.();
    
    setTimeout(() => setIsAdding(false), 500);
  };

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!isAuthenticated) {
      window.location.href = '/login?redirect=/products';
      return;
    }
    
    if (inWishlist) {
      removeFromWishlist(product.id);
    } else {
      addToWishlist(product.id);
    }
  };

  const formatPrice = (price: number) => {
    if (!price && price !== 0) return '₦0';
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const isInStock = currentStock > 0;
  const isLowStock = isInStock && currentStock <= 5;

  // Only show product if it's active
  if (!product.isActive) return null;

  return (
    <motion.div
      whileHover={{ y: -8 }}
      transition={{ duration: 0.3 }}
      className="group bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl transition-shadow"
    >
      <Link href={`/products/${product.id}`} className="block">
        {/* Image Container */}
        <div className="relative aspect-square w-full overflow-hidden bg-gray-100">
          <SafeImage
            src={product.image}
            alt={product.name}
            className="w-full h-full object-contain p-3 group-hover:scale-105 transition-transform duration-500"
            fallback={getValidImageUrl(null, product.category)}
          />
          
          {/* Discount Badge */}
          {product.isPromotional && showDiscount && product.discountPercentage && (
            <span className="absolute top-2 left-2 bg-red-500 text-white text-[10px] sm:text-xs font-bold px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full z-10">
              -{product.discountPercentage}%
            </span>
          )}
          
          {/* Low Stock Warning Badge */}
          {isLowStock && !product.isPromotional && (
            <span className="absolute top-2 left-2 bg-yellow-500 text-white text-[10px] sm:text-xs font-bold px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full z-10 flex items-center gap-1">
              <AlertTriangle size={10} />
              Low Stock
            </span>
          )}
          
          {/* Out of Stock Badge */}
          {!isInStock && (
            <span className="absolute top-2 right-2 bg-gray-800 text-white text-[10px] sm:text-xs font-bold px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full z-10">
              Out of Stock
            </span>
          )}
        </div>

        {/* Product Info */}
        <div className="p-3 sm:p-4">
          {/* Category Badge */}
          <span className="inline-block text-[10px] sm:text-xs font-medium text-blue-600 bg-blue-50 px-2 py-0.5 sm:py-1 rounded-full mb-2">
            {product.category}
          </span>
          
          {/* Product Name */}
          <h3 className="font-bold text-gray-800 mb-1 line-clamp-2 group-hover:text-blue-600 transition-colors text-sm sm:text-base">
            {product.name}
          </h3>
          
          {/* Description - Hidden on very small screens */}
          <p className="text-xs text-gray-500 line-clamp-2 mb-2 hidden sm:block">
            {product.description}
          </p>

          {/* Rating */}
          <div className="flex items-center gap-1 mb-2">
            <Star className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-400 fill-current" />
            <span className="text-xs sm:text-sm text-gray-600">{product.rating || '0.0'}</span>
          </div>

          {/* Price Section */}
          <div className="flex items-center justify-between flex-wrap gap-1">
            <div>
              <span className="text-sm sm:text-xl font-bold text-gray-800">
                {formatPrice(product.price)}
              </span>
              {product.originalPrice && product.originalPrice > product.price && (
                <span className="ml-1 sm:ml-2 text-xs sm:text-sm text-gray-400 line-through">
                  {formatPrice(product.originalPrice)}
                </span>
              )}
            </div>
            <span className={`text-[10px] sm:text-xs ${isInStock ? (isLowStock ? 'text-yellow-600' : 'text-green-600') : 'text-red-600'}`}>
              {isInStock 
                ? (isLowStock ? `Only ${currentStock} left!` : `${currentStock} in stock`)
                : 'Out of stock'}
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

export default ProductCard;