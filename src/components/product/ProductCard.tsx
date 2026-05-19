'use client';

import { motion } from 'framer-motion';
import { Heart, ShoppingCart, Star } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
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
  stockQuantity: number;  // ✅ Fixed field name
  isActive: boolean;      // ✅ Fixed field name
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

  const imageUrl = imageError 
    ? getValidImageUrl(null, product.category)
    : getValidImageUrl(product.image, product.category);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (product.stockQuantity <= 0) return;
    
    addItem({
      productId: product.id,
      name: product.name,
      price: product.price,
      quantity: 1,
      image: imageUrl,
      category: product.category,
      maxStock: product.stockQuantity,
    });
    
    onAddSuccess?.();
  };

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!isAuthenticated) {
      window.location.href = '/login';
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

  // ✅ Only show product if it's active
  if (!product.isActive) return null;

  return (
    <motion.div
      whileHover={{ y: -8 }}
      transition={{ duration: 0.3 }}
      className="group bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl transition-shadow"
    >
      <Link href={`/products/${product.id}`}>
        <div className="relative aspect-square w-full overflow-hidden bg-gray-100 product-image-container">
          <SafeImage
            src={product.image}
            alt={product.name}
            className="w-full h-full object-contain p-2 sm:p-3 group-hover:scale-105 transition-transform duration-500"
            fallback={getValidImageUrl(null, product.category)}
          />
          
          {/* Discount Badge */}
          {product.isPromotional && showDiscount && product.discountPercentage && (
            <span className="absolute top-2 left-2 bg-red-500 text-white text-[10px] sm:text-xs font-bold px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full z-10">
              -{product.discountPercentage}%
            </span>
          )}

          {/* In Stock / Out of Stock Badge */}
          {product.stockQuantity === 0 && (
            <span className="absolute top-2 right-2 bg-gray-800 text-white text-[10px] sm:text-xs font-bold px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full z-10">
              Out of Stock
            </span>
          )}

          {/* Wishlist Button */}
          <button 
            onClick={handleWishlist}
            className={`absolute top-2 right-2 p-1 sm:p-2 rounded-full transition-colors z-10 ${
              inWishlist 
                ? 'bg-red-500 text-white' 
                : 'bg-white/80 backdrop-blur-sm text-gray-600 hover:text-red-500'
            }`}
          >
            <Heart className={`w-3.5 h-3.5 sm:w-5 sm:h-5 ${inWishlist ? 'fill-current' : ''}`} />
          </button>

          {/* Quick Add Button */}
          {product.stockQuantity > 0 && (
            <button 
              onClick={handleAddToCart}
              className="absolute bottom-2 right-2 bg-blue-600 text-white p-1.5 sm:p-3 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all hover:bg-blue-700 z-10"
            >
              <ShoppingCart className="w-3.5 h-3.5 sm:w-5 sm:h-5" />
            </button>
          )}
        </div>

        {/* Product Info */}
        <div className="p-2 sm:p-4">
          <span className="inline-block text-[10px] sm:text-xs font-medium text-blue-600 bg-blue-50 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full mb-1 sm:mb-2">
            {product.category}
          </span>
          
          <h3 className="font-bold text-gray-800 mb-1 sm:mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors text-xs sm:text-base">
            {product.name}
          </h3>
          
          <p className="text-[10px] sm:text-sm text-gray-500 line-clamp-2 mb-2 sm:mb-3">
            {product.description}
          </p>

          {/* Rating */}
          <div className="flex items-center gap-1 mb-1 sm:mb-2">
            <Star className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-400 fill-current" />
            <span className="text-[10px] sm:text-sm text-gray-600">{product.rating || '0.0'}</span>
          </div>

          {/* Price Section */}
          <div className="flex items-center justify-between flex-wrap gap-1">
            <div>
              <span className="text-sm sm:text-xl font-bold text-gray-800">
                {formatPrice(product.price)}
              </span>
              {product.originalPrice && product.originalPrice > product.price && (
                <span className="ml-1 sm:ml-2 text-[10px] sm:text-sm text-gray-400 line-through">
                  {formatPrice(product.originalPrice)}
                </span>
              )}
            </div>
            <span className={`text-[9px] sm:text-xs ${product.stockQuantity > 0 ? 'text-green-600' : 'text-red-600'}`}>
              {product.stockQuantity > 0 ? `${product.stockQuantity} in stock` : 'Out of stock'}
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

export default ProductCard;