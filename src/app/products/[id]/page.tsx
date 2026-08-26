'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Breadcrumb } from '@/components/ui/Breadcrumb';
import { products } from '@/data/products';
import { useCartStore } from '@/stores/cartStore';
import {
  Star,
  Heart,
  ShoppingCart,
  Truck,
  Shield,
  ArrowLeft,
  Minus,
  Plus,
} from 'lucide-react';

export function generateStaticParams() {
  return products.map((product) => ({
    id: product.id,
  }));
}

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();

  const addItem = useCartStore((state) => state.addItem);

  const [quantity, setQuantity] = useState(1);
  const [isFavorite, setIsFavorite] = useState(false);
  const [adding, setAdding] = useState(false);

  const productId = params.id as string;

  const product = products.find(
    (item) => item.id === productId
  );

  const formatNaira = (price: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const handleAddToCart = () => {
    if (!product || !product.stock) return;

    setAdding(true);

    addItem({
      productId: product.id,
      name: product.name,
      price: product.price,
      quantity,
      image: product.image || '/placeholder.svg',
      category: product.category,
      maxStock: product.stock,
    });

    setTimeout(() => {
      setAdding(false);
      router.push('/cart');
    }, 500);
  };

  const toggleWishlist = () => {
    if (!product) return;

    try {
      const wishlist = JSON.parse(
        localStorage.getItem('wishlist') || '[]'
      );

      if (isFavorite) {
        const updatedWishlist = wishlist.filter(
          (item: any) => item.id !== product.id
        );

        localStorage.setItem(
          'wishlist',
          JSON.stringify(updatedWishlist)
        );

        setIsFavorite(false);
      } else {
        wishlist.push({
          id: product.id,
          name: product.name,
          price: product.price,
          originalPrice: product.originalPrice,
          image: product.image,
          rating: product.rating,
        });

        localStorage.setItem(
          'wishlist',
          JSON.stringify(wishlist)
        );

        setIsFavorite(true);
      }
    } catch (error) {
      console.error('Error updating wishlist:', error);
    }
  };

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="text-center max-w-md p-8 bg-white rounded-xl shadow-lg">
          <div className="text-red-500 text-6xl mb-4">
            🔍
          </div>

          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Product Not Found
          </h2>

          <p className="text-gray-600 mb-6">
            The product you are looking for does not exist.
          </p>

          <Button
            onClick={() => router.push('/products')}
            variant="primary"
          >
            Browse Products
          </Button>
        </div>
      </div>
    );
  }

  const stock = product.stock ?? 0;
  const isInStock = stock > 0;

  const discountPercentage =
    product.originalPrice &&
    product.originalPrice > product.price
      ? Math.round(
          ((product.originalPrice - product.price) /
            product.originalPrice) *
            100
        )
      : product.discountPercentage ?? 0;

  const rating = product.rating ?? 0;

  const stars = Array.from({ length: 5 }, (_, index) => (
    <Star
      key={index}
      size={20}
      className={
        index < Math.floor(rating)
          ? 'fill-yellow-400 text-yellow-400'
          : 'text-gray-300'
      }
    />
  ));

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

        <button
          onClick={() => router.push('/products')}
          className="flex items-center gap-2 text-gray-600 hover:text-blue-600 mb-6 mt-4"
        >
          <ArrowLeft size={18} />
          Back to Products
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

          {/* Product Image */}
          <Card className="p-6">
            <div className="relative aspect-square bg-gray-50 rounded-xl overflow-hidden flex items-center justify-center">
              <img
                src={product.image || '/placeholder.svg'}
                alt={product.name}
                className="w-full h-full object-contain p-8"
              />

              {discountPercentage > 0 && (
                <Badge className="absolute top-4 left-4">
                  -{discountPercentage}%
                </Badge>
              )}
            </div>
          </Card>

          {/* Product Information */}
          <div>
            <div className="mb-3">
              <span className="inline-block text-sm font-semibold text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                {product.category}
              </span>
            </div>

            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              {product.name}
            </h1>

            <div className="flex items-center gap-2 mb-5">
              <div className="flex items-center gap-1">
                {stars}
              </div>

              <span className="text-gray-500">
                {rating.toFixed(1)}
              </span>

              {product.reviewCount !== undefined && (
                <span className="text-gray-400">
                  ({product.reviewCount} reviews)
                </span>
              )}
            </div>

            <div className="mb-6">
              <div className="flex items-center gap-3 flex-wrap">
                <span className="text-3xl font-bold text-gray-900">
                  {formatNaira(product.price)}
                </span>

                {product.originalPrice &&
                  product.originalPrice > product.price && (
                    <span className="text-lg text-gray-400 line-through">
                      {formatNaira(product.originalPrice)}
                    </span>
                  )}
              </div>
            </div>

            <div className="mb-6">
              <p className="text-gray-600 leading-relaxed">
                {product.description ||
                  'Quality medical product from FitTrust Medicals.'}
              </p>
            </div>

            {/* Stock */}
            <div
              className={`rounded-lg p-4 mb-6 ${
                isInStock
                  ? stock <= 5
                    ? 'bg-yellow-50'
                    : 'bg-green-50'
                  : 'bg-red-50'
              }`}
            >
              <p
                className={`font-semibold ${
                  isInStock
                    ? stock <= 5
                      ? 'text-yellow-700'
                      : 'text-green-700'
                    : 'text-red-700'
                }`}
              >
                {isInStock
                  ? stock <= 5
                    ? `Only ${stock} remaining`
                    : 'In stock'
                  : 'Currently unavailable'}
              </p>
            </div>

            {/* Quantity */}
            {isInStock && (
              <div className="flex items-center gap-4 mb-6">
                <span className="font-semibold">
                  Quantity
                </span>

                <div className="flex items-center border border-gray-300 rounded-lg">
                  <button
                    onClick={() =>
                      setQuantity((current) =>
                        Math.max(1, current - 1)
                      )
                    }
                    className="p-3 hover:bg-gray-100"
                  >
                    <Minus size={16} />
                  </button>

                  <span className="px-5 font-semibold">
                    {quantity}
                  </span>

                  <button
                    onClick={() =>
                      setQuantity((current) =>
                        Math.min(stock, current + 1)
                      )
                    }
                    className="p-3 hover:bg-gray-100"
                  >
                    <Plus size={16} />
                  </button>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3 mb-8">
              <button
                onClick={handleAddToCart}
                disabled={!isInStock || adding}
                className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                <ShoppingCart size={20} />
                {adding
                  ? 'Adding...'
                  : isInStock
                    ? 'Add to Cart'
                    : 'Out of Stock'}
              </button>

              <button
                onClick={toggleWishlist}
                className="p-3 border border-gray-300 rounded-lg hover:bg-gray-50"
                aria-label="Add to wishlist"
              >
                <Heart
                  size={22}
                  className={
                    isFavorite
                      ? 'fill-red-500 text-red-500'
                      : 'text-gray-600'
                  }
                />
              </button>
            </div>

            {/* Benefits */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-t pt-6">
              <div className="flex items-center gap-3">
                <Truck className="text-blue-600" />
                <span className="text-sm text-gray-600">
                  Reliable Delivery
                </span>
              </div>

              <div className="flex items-center gap-3">
                <Shield className="text-blue-600" />
                <span className="text-sm text-gray-600">
                  Quality Products
                </span>
              </div>

              <div className="flex items-center gap-3">
                <ShoppingCart className="text-blue-600" />
                <span className="text-sm text-gray-600">
                  Easy Ordering
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
