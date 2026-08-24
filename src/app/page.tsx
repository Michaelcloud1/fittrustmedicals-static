'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { ProductCard } from '@/components/product/ProductCard';
import { Button } from '@/components/ui/Button';
import { 
  ChevronRight, 
  Sparkles,
  Zap,
  Stethoscope,
  Microscope,
  Activity,
  ArrowRight,
  Tag,
  Gift,
  Shield
} from 'lucide-react';
// REMOVED: import { usePromotionsStore } from '@/stores/promotionsStore';
import { Header } from '@/components/layout/Header';

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
  isPromotional?: boolean;
  discountPercentage?: number;
  featured?: boolean;
  campaignCode?: string;
  campaignName?: string;
}

// ✅ ADDED: Hardcoded products data
const HARDCODED_PRODUCTS: Product[] = [
  {
    id: '1',
    name: 'Digital Blood Pressure Monitor',
    price: 45000,
    originalPrice: 55000,
    category: 'diagnostic',
    description: 'High precision digital blood pressure monitor',
    image: '/images/products/blood-pressure.jpg',
    stock: 50,
    status: 'active',
    rating: 4.5,
    reviewCount: 120,
    featured: true,
    discountPercentage: 18
  },
  {
    id: '2',
    name: 'Medical Grade Stethoscope',
    price: 35000,
    category: 'diagnostic',
    description: 'Professional medical stethoscope',
    image: '/images/products/stethoscope.jpg',
    stock: 30,
    status: 'active',
    rating: 4.8,
    reviewCount: 95,
    featured: true
  },
  {
    id: '3',
    name: 'Surgical Face Masks (Box of 50)',
    price: 15000,
    originalPrice: 20000,
    category: 'ppe',
    description: 'High quality surgical face masks',
    image: '/images/products/masks.jpg',
    stock: 200,
    status: 'active',
    rating: 4.3,
    reviewCount: 200,
    featured: true,
    discountPercentage: 25
  },
  {
    id: '4',
    name: 'Digital Thermometer',
    price: 12000,
    category: 'diagnostic',
    description: 'Fast and accurate digital thermometer',
    image: '/images/products/thermometer.jpg',
    stock: 75,
    status: 'active',
    rating: 4.6,
    reviewCount: 150,
    featured: true
  },
  {
    id: '5',
    name: 'Hospital Bed',
    price: 250000,
    originalPrice: 300000,
    category: 'equipment',
    description: 'Adjustable hospital bed with mattress',
    image: '/images/products/hospital-bed.jpg',
    stock: 10,
    status: 'active',
    rating: 4.9,
    reviewCount: 45,
    featured: true,
    discountPercentage: 16
  },
  {
    id: '6',
    name: 'IV Stand',
    price: 45000,
    category: 'equipment',
    description: 'Stainless steel IV stand with wheels',
    image: '/images/products/iv-stand.jpg',
    stock: 25,
    status: 'active',
    rating: 4.4,
    reviewCount: 68,
    featured: true
  },
  {
    id: '7',
    name: 'Medical Gloves (Box of 100)',
    price: 8000,
    originalPrice: 10000,
    category: 'ppe',
    description: 'Premium medical examination gloves',
    image: '/images/products/gloves.jpg',
    stock: 500,
    status: 'active',
    rating: 4.2,
    reviewCount: 180,
    featured: false,
    discountPercentage: 20
  },
  {
    id: '8',
    name: 'Pulse Oximeter',
    price: 28000,
    category: 'diagnostic',
    description: 'Accurate blood oxygen saturation monitor',
    image: '/images/products/oximeter.jpg',
    stock: 40,
    status: 'active',
    rating: 4.7,
    reviewCount: 110,
    featured: false
  }
];

// ✅ ADDED: Hardcoded campaign products
const HARDCODED_CAMPAIGN_PRODUCTS: Product[] = [
  {
    id: '9',
    name: 'Campaign Special: Medical Kit',
    price: 65000,
    originalPrice: 85000,
    category: 'equipment',
    description: 'Complete medical emergency kit',
    image: '/images/products/medical-kit.jpg',
    stock: 15,
    status: 'active',
    rating: 4.8,
    reviewCount: 30,
    isPromotional: true,
    discountPercentage: 23,
    campaignCode: 'SUMMER20',
    campaignName: 'Summer Sale'
  },
  {
    id: '10',
    name: 'Campaign Special: Digital Scale',
    price: 32000,
    originalPrice: 40000,
    category: 'diagnostic',
    description: 'High precision digital medical scale',
    image: '/images/products/scale.jpg',
    stock: 20,
    status: 'active',
    rating: 4.5,
    reviewCount: 55,
    isPromotional: true,
    discountPercentage: 20,
    campaignCode: 'SUMMER20',
    campaignName: 'Summer Sale'
  }
];

// ✅ ADDED: Hardcoded active campaigns
const HARDCODED_CAMPAIGNS = [
  {
    id: 'camp1',
    name: 'Summer Sale',
    code: 'SUMMER20',
    description: 'Get 20% off on selected items',
    bannerText: 'Summer Sale: Get 20% OFF on selected medical supplies!'
  }
];

export default function Home() {
  // ✅ CHANGED: Use hardcoded data instead of fetching
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [campaignProducts, setCampaignProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCampaigns, setActiveCampaigns] = useState<any[]>([]);

  // ✅ REMOVED: usePromotionsStore - not needed for static site

  useEffect(() => {
    // ✅ CHANGED: Use hardcoded data instead of API calls
    const loadProducts = () => {
      try {
        // Use hardcoded products
        const productsData = HARDCODED_PRODUCTS;
        const campaignData = HARDCODED_CAMPAIGN_PRODUCTS;
        const campaigns = HARDCODED_CAMPAIGNS;
        
        // Set featured products
        const featured = productsData.filter((p: Product) => p.featured);
        setFeaturedProducts(featured.length > 0 ? featured : productsData.slice(0, 8));
        
        // Set campaign products
        setCampaignProducts(campaignData);
        setActiveCampaigns(campaigns);
        
        console.log('✅ Static data loaded successfully!');
      } catch (err) {
        console.error('Error loading products:', err);
        setCampaignProducts([]);
        setActiveCampaigns([]);
      } finally {
        setLoading(false);
      }
    };
    
    loadProducts();
  }, []);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-NG', { 
      style: 'currency', 
      currency: 'NGN', 
      minimumFractionDigits: 0 
    }).format(price);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full shadow-lg"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header - from separate file */}
      <Header />

      {/* ✅ CHANGED: Use hardcoded promotions instead of store */}
      {HARDCODED_CAMPAIGNS.length > 0 && (
        <motion.div 
          initial={{ y: -50 }}
          animate={{ y: 0 }}
          className="relative bg-gradient-to-r from-purple-600 via-pink-600 to-red-500 text-white py-3 text-center text-sm font-medium overflow-hidden"
        >
          <div className="absolute inset-0 bg-white/10 backdrop-blur-sm" />
          <div className="relative z-10">
            <Sparkles className="inline-block w-4 h-4 mr-2 animate-pulse" />
            {HARDCODED_CAMPAIGNS[0]?.bannerText || 'Special Offer: Get 20% OFF!'}
            <Link href="/products" className="ml-3 inline-flex items-center font-semibold hover:text-yellow-200 transition-colors">
              Shop Now 
              <ChevronRight className="w-4 h-4 ml-1" />
            </Link>
          </div>
        </motion.div>
      )}

      {/* Hero Banner Area */}
      <div className="container mx-auto px-4 py-4">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          <Link href="/products" className="lg:col-span-3 block">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-lg overflow-hidden relative h-64 lg:h-80 cursor-pointer group">
              <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-all duration-300" />
              <div className="relative z-10 p-8 text-white">
                <span className="inline-block px-3 py-1 bg-white/20 rounded-full text-sm mb-4 group-hover:scale-105 transition-transform duration-300">
                  Up to 40% Off
                </span>
                <h2 className="text-3xl lg:text-4xl font-bold mb-2 group-hover:translate-x-1 transition-transform duration-300">
                  Medical Equipment Sale
                </h2>
                <p className="text-lg mb-4 group-hover:translate-x-1 transition-transform duration-300">
                  Premium quality healthcare supplies
                </p>
                <button className="bg-white text-blue-600 px-6 py-2 rounded-md font-semibold hover:shadow-lg transition-all duration-300 cursor-pointer group-hover:scale-105">
                  Shop Now →
                </button>
              </div>
            </div>
          </Link>

          <div className="grid grid-cols-2 gap-4">
            <Link href="/products?category=diagnostic">
              <div className="bg-blue-500 rounded-lg p-4 text-white text-center hover:opacity-90 transition cursor-pointer">
                <Stethoscope className="w-8 h-8 mx-auto mb-2" />
                <div className="font-bold text-sm">Diagnostic Tools</div>
                <div className="text-xs opacity-90">Up to 30% off</div>
              </div>
            </Link>
            <Link href="/products?category=ppe">
              <div className="bg-green-500 rounded-lg p-4 text-white text-center hover:opacity-90 transition cursor-pointer">
                <Shield className="w-8 h-8 mx-auto mb-2" />
                <div className="font-bold text-sm">PPE Supplies</div>
                <div className="text-xs opacity-90">Up to 25% off</div>
              </div>
            </Link>
          </div>
        </div>
      </div>

      {/* Flash Sales Section */}
      <section className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="bg-red-500 text-white px-6 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5" />
              <h2 className="font-bold text-lg">FLASH SALES</h2>
            </div>
            <Link href="/products?filter=flash-sales" className="text-sm hover:underline">View All &gt;</Link>
          </div>
          <div className="p-4">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {featuredProducts.slice(0, 6).map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Featured Medical Equipment Section */}
      <section className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="px-6 py-3 border-b flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-blue-600" />
              <h2 className="font-bold text-lg text-gray-800">Featured Medical Equipment</h2>
            </div>
            <Link href="/products" className="text-blue-600 text-sm hover:underline flex items-center gap-1">
              See All <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="p-4">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {featuredProducts.slice(0, 6).map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Diagnostic & Lab Equipment Section */}
      <section className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="px-6 py-3 border-b flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Microscope className="w-5 h-5 text-purple-600" />
              <h2 className="font-bold text-lg text-gray-800">Diagnostic & Lab Equipment</h2>
            </div>
            <Link href="/products?category=diagnostic" className="text-blue-600 text-sm hover:underline flex items-center gap-1">
              See All <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="p-4">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {featuredProducts.slice(3, 9).map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Special Offer Banner */}
      {campaignProducts.length > 0 ? (
        <section className="container mx-auto px-4 py-8">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg overflow-hidden">
            <div className="px-6 py-4">
              <div className="flex items-center gap-2">
                <Tag className="w-6 h-6 text-yellow-300" />
                <h2 className="text-white font-bold text-xl">Special Offer | Limited Time</h2>
              </div>
              <p className="text-blue-100 text-sm mt-1">Get up to 50% off on selected medical supplies</p>
              {activeCampaigns.length > 0 && activeCampaigns[0]?.code && (
                <p className="text-yellow-200 text-xs mt-2 font-medium">
                  ✨ Use code: {activeCampaigns[0].code} at checkout
                </p>
              )}
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 p-6 pt-2">
              {campaignProducts.map((product) => (
                <div key={product.id} className="bg-white rounded-lg p-4 text-center hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                  <div className="relative">
                    <img 
                      src={product.image || '/placeholder.svg'} 
                      alt={product.name} 
                      className="w-full h-28 object-contain mb-2"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/placeholder.svg';
                      }}
                    />
                    {product.discountPercentage && (
                      <span className="absolute top-0 right-0 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                        -{product.discountPercentage}%
                      </span>
                    )}
                    {product.campaignCode && (
                      <span className="absolute bottom-0 left-0 bg-green-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
                        {product.campaignCode}
                      </span>
                    )}
                  </div>
                  <h3 className="text-xs font-medium text-gray-800 mb-1 line-clamp-2 h-10">{product.name}</h3>
                  <div className="text-base font-bold text-blue-600">{formatPrice(product.price)}</div>
                  {product.originalPrice && (
                    <div className="text-xs text-gray-400 line-through">
                      {formatPrice(product.originalPrice)}
                    </div>
                  )}
                  <Link href={`/product/${product.id}`}>
                    <button className="mt-2 w-full bg-blue-600 text-white py-1.5 rounded-md text-xs font-semibold hover:bg-blue-700 transition-all">
                      Shop Now →
                    </button>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>
      ) : (
        <section className="container mx-auto px-4 py-8">
          <div className="bg-gradient-to-r from-gray-100 to-gray-200 rounded-lg overflow-hidden">
            <div className="px-6 py-12 text-center">
              <Gift className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-600 mb-2">No Active Campaigns</h2>
              <p className="text-gray-500 text-sm">
                Check back soon for special offers and discounts!
              </p>
            </div>
          </div>
        </section>
      )}

      {/* Newsletter Section */}
      <section className="py-16 bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold mb-2">Subscribe to Our Newsletter</h2>
          <p className="text-blue-100 mb-6">Get the latest updates on new products and special offers</p>
          <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
            <input 
              type="email" 
              placeholder="Enter your email address"
              className="flex-1 px-4 py-2 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-300"
            />
            <Button className="bg-blue-700 hover:bg-blue-800 px-6">
              Subscribe
              <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}