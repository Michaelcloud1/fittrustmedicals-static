'use client';

import { motion } from 'framer-motion';
import { Heart, ShoppingCart, Star, AlertTriangle } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import SafeImage from '@/components/ui/SafeImage';
import { Product } from '@/data/products';

interface ProductCardProps {
  product: Product;
  showDiscount?: boolean;
}

export function ProductCard({
  product,
  showDiscount = true,
}: ProductCardProps) {
  const [imageError, setImageError] = useState(false);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const stock = product.stock ?? 0;
  const isInStock = stock > 0;
  const isLowStock = isInStock && stock <= 5;

  const discount =
    product.originalPrice && product.originalPrice > product.price
      ? Math.round(
          ((product.originalPrice - product.price) /
            product.originalPrice) *
            100
        )
      : product.discountPercentage;

  return (
    <motion.div
      whileHover={{ y: -6 }}
      transition={{ duration: 0.25 }}
      className="group relative bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-xl transition-shadow duration-300"
    >
      <Link href={`/products/${product.id}`} className="block">
        {/* Product Image */}
        <div className="relative aspect-square w-full overflow-hidden bg-gray-50">
          {!imageError ? (
            <SafeImage
              src={product.image}
              alt={product.name}
              className="w-full h-full object-contain p-4 group-hover:scale-105 transition-transform duration-500"
              fallback="/placeholder.svg"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
              <div className="text-4xl mb-2">📦</div>
              <span className="text-xs">Image unavailable</span>
            </div>
          )}

          {/* Discount */}
          {showDiscount && discount && discount > 0 && (
            <span className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
              -{discount}%
            </span>
          )}

          {/* Promotional Badge */}
          {product.isPromotional && (
            <span className="absolute top-3 right-3 bg-orange-500 text-white text-[10px] font-semibold px-2 py-1 rounded-full">
              SALE
            </span>
          )}

          {/* Stock */}
          {!isInStock ? (
            <span className="absolute bottom-3 left-3 bg-gray-800 text-white text-xs font-semibold px-2 py-1 rounded-full">
              Out of Stock
            </span>
          ) : isLowStock ? (
            <span className="absolute bottom-3 left-3 bg-yellow-500 text-white text-xs font-semibold px-2 py-1 rounded-full flex items-center gap-1">
              <AlertTriangle className="w-3 h-3" />
              Only {stock} left
            </span>
          ) : null}
        </div>

        {/* Product Information */}
        <div className="p-4">
          {/* Category */}
          <div className="mb-2">
            <span className="inline-block text-[11px] font-semibold text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
              {product.category}
            </span>
          </div>

          {/* Name */}
          <h3 className="font-semibold text-gray-800 text-sm sm:text-base line-clamp-2 min-h-[40px] group-hover:text-blue-600 transition-colors">
            {product.name}
          </h3>

          {/* Description */}
          {product.description && (
            <p className="text-xs text-gray-500 mt-2 line-clamp-2 hidden sm:block">
              {product.description}
            </p>
          )}

          {/* Rating */}
          <div className="flex items-center gap-1 mt-2">
            <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />

            <span className="text-xs text-gray-600">
              {product.rating ?? 0}
            </span>

            {product.reviewCount !== undefined && (
              <span className="text-xs text-gray-400">
                ({product.reviewCount})
              </span>
            )}
          </div>

          {/* Price */}
          <div className="mt-3">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-lg sm:text-xl font-bold text-gray-900">
                {formatPrice(product.price)}
              </span>

              {product.originalPrice &&
                product.originalPrice > product.price && (
                  <span className="text-xs sm:text-sm text-gray-400 line-through">
                    {formatPrice(product.originalPrice)}
                  </span>
                )}
            </div>
          </div>

          {/* Stock Text */}
          <div className="mt-2">
            {isInStock ? (
              <span
                className={`text-xs ${
                  isLowStock ? 'text-yellow-600' : 'text-green-600'
                }`}
              >
                {isLowStock
                  ? `Only ${stock} remaining`
                  : 'In stock'}
              </span>
            ) : (
              <span className="text-xs text-red-600">
                Currently unavailable
              </span>
            )}
          </div>

          {/* View Product */}
          <div className="mt-4">
            <div className="w-full bg-blue-600 hover:bg-blue-700 text-white text-center text-sm font-semibold py-2.5 rounded-lg transition-colors">
              View Product
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

export default ProductCard;