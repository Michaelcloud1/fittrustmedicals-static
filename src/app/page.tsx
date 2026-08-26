'use client';

import Link from 'next/link';
import {
  ArrowRight,
  ChevronRight,
  Microscope,
  ShieldCheck,
  Stethoscope,
  Syringe,
} from 'lucide-react';

import { Header } from '@/components/layout/Header';
import { ProductCard } from '@/components/product/ProductCard';

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

/*
|--------------------------------------------------------------------------
| STATIC PRODUCTS
|--------------------------------------------------------------------------
| These are the products currently displayed on the website.
|
| To add/change an image, simply place the image inside:
|
| public/images/products/
|
| and change the image path below.
|--------------------------------------------------------------------------
*/

const PRODUCTS: Product[] = [
  {
    id: '1775520478118',
    name: 'Digital Thermometer2',
    price: 4999,
    originalPrice: 1000,
    category: 'Diagnostics',
    description: 'Digital thermometer for fast and convenient temperature measurement.',
    image: '/images/products/digital-thermometer.jpg',
    stockQuantity: 1,
    isActive: true,
    isPromotional: true,
    discountPercentage: 25,
    featured: true,
    rating: 0,
    reviewCount: 0,
  },

  {
    id: '1775524087587',
    name: 'Blood Transfusion Set',
    price: 6000,
    originalPrice: 10000,
    category: 'IV Sets & Accessories',
    description:
      'Sterile single-use blood transfusion set with integrated blood filter.',
    image: '/images/products/blood-transfusion-set.jpg',
    stockQuantity: 4,
    isActive: true,
    isPromotional: true,
    discountPercentage: 25,
    featured: true,
    rating: 0,
    reviewCount: 0,
  },

  {
    id: '1775558956188-5nxgcjxvh',
    name: 'Widal-2 Antigens',
    price: 3000,
    originalPrice: 6000,
    category: 'Serological Reagent',
    description:
      'Serological reagent for Widal agglutination testing.',
    image: '/images/products/widal-2-antigens.webp',
    stockQuantity: 3,
    isActive: true,
    isPromotional: true,
    discountPercentage: 20,
    featured: false,
    rating: 0,
    reviewCount: 0,
  },

  {
    id: '1775659282198-v1mlx5ak8',
    name: 'Cryovial Tube',
    price: 1000,
    originalPrice: 3000,
    category: 'Diagnostics & Research',
    description:
      'Medical-grade cryogenic storage tube suitable for laboratory and research applications.',
    image: '/images/products/cryovial-tube.jpeg',
    stockQuantity: 1,
    isActive: true,
    isPromotional: true,
    discountPercentage: 25,
    featured: true,
    rating: 0,
    reviewCount: 0,
  },

  {
    id: '1775664194025-iuuy58yrd',
    name: 'Micro Slides',
    price: 1499.99,
    originalPrice: 5000,
    category: 'Diagnostics & Research',
    description:
      'Optical-quality microscope slides suitable for laboratory and educational applications.',
    image: '/images/products/micro-slides.jpeg',
    stockQuantity: 2,
    isActive: true,
    isPromotional: true,
    discountPercentage: 25,
    featured: true,
    rating: 0,
    reviewCount: 0,
  },

  {
    id: '1775819075513-4g14d95a4',
    name: 'Lithium Heparin Non-Vacuum Blood Collection Tube',
    price: 10002,
    originalPrice: 40000,
    category: 'Blood Collection Tubes',
    description:
      'Lithium heparin blood collection tubes designed for plasma-based laboratory testing.',
    image: '/images/products/lithium-heparin-tube.jpeg',
    stockQuantity: 1,
    isActive: true,
    isPromotional: true,
    discountPercentage: 25,
    featured: true,
    rating: 0,
    reviewCount: 0,
  },

  {
    id: '1775908113105-u3genoaql',
    name: 'Blood Grouping Sera Anti D',
    price: 1000,
    originalPrice: 4000,
    category: 'Blood Collection Tubes',
    description: 'Blood grouping serum Anti-D reagent.',
    image: '/images/products/blood-grouping-sera-anti-d.jpeg',
    stockQuantity: 13,
    isActive: true,
    isPromotional: true,
    discountPercentage: 19,
    featured: true,
    rating: 0,
    reviewCount: 0,
  },

  {
    id: '1776025727212-dfv4e951a',
    name: 'U-100 Insulin Syringe',
    price: 1000,
    originalPrice: 3000,
    category: 'Diabetes Care',
    description:
      'Sterile disposable U-100 insulin syringe designed for accurate insulin administration.',
    image: '/images/products/insulin-syringe.jpeg',
    stockQuantity: 33,
    isActive: true,
    isPromotional: true,
    discountPercentage: 19,
    featured: true,
    rating: 0,
    reviewCount: 0,
  },
];

/*
|--------------------------------------------------------------------------
| Helpers
|--------------------------------------------------------------------------
*/

const formatPrice = (price: number) =>
  new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);

const featuredProducts = PRODUCTS.filter((product) => product.featured);

const diagnosticProducts = PRODUCTS.filter((product) =>
  product.category.toLowerCase().includes('diagnostic') ||
  product.category.toLowerCase().includes('research') ||
  product.category.toLowerCase().includes('serological')
);

const laboratoryProducts = PRODUCTS.filter((product) =>
  product.category.toLowerCase().includes('blood') ||
  product.category.toLowerCase().includes('iv') ||
  product.category.toLowerCase().includes('syringe')
);

/*
|--------------------------------------------------------------------------
| Homepage
|--------------------------------------------------------------------------
*/

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-50">
      <Header />

      {/* HERO */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-700 via-blue-600 to-indigo-700">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.16),transparent_35%)]" />

        <div className="relative container mx-auto px-4 py-14 sm:py-20 lg:py-24">
          <div className="max-w-3xl text-white">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-medium backdrop-blur">
              <ShieldCheck className="h-4 w-4" />
              Quality Medical Supplies
            </span>

            <h1 className="mt-6 text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
              Medical supplies you can trust.
            </h1>

            <p className="mt-5 max-w-2xl text-base leading-7 text-blue-100 sm:text-lg">
              Discover medical equipment, diagnostic supplies, laboratory
              products and healthcare essentials from FitTrust Medicals.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/products"
                className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 font-bold text-blue-700 shadow-lg transition hover:-translate-y-0.5 hover:shadow-xl"
              >
                Browse Products
                <ArrowRight className="h-4 w-4" />
              </Link>

              <Link
                href="/products?category=Diagnostics"
                className="inline-flex items-center gap-2 rounded-xl border border-white/30 bg-white/10 px-6 py-3 font-semibold text-white backdrop-blur transition hover:bg-white/20"
              >
                Diagnostic Supplies
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CATEGORY CARDS */}
      <section className="container mx-auto px-4 -mt-8 relative z-10">
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <Link
            href="/products?category=Diagnostics"
            className="group rounded-2xl bg-white p-5 shadow-md transition hover:-translate-y-1 hover:shadow-xl"
          >
            <Stethoscope className="h-8 w-8 text-blue-600" />
            <h3 className="mt-3 font-bold text-gray-900">Diagnostics</h3>
            <p className="mt-1 text-xs text-gray-500">Diagnostic supplies</p>
          </Link>

          <Link
            href="/products?category=Laboratory"
            className="group rounded-2xl bg-white p-5 shadow-md transition hover:-translate-y-1 hover:shadow-xl"
          >
            <Microscope className="h-8 w-8 text-purple-600" />
            <h3 className="mt-3 font-bold text-gray-900">Laboratory</h3>
            <p className="mt-1 text-xs text-gray-500">Lab & research supplies</p>
          </Link>

          <Link
            href="/products?category=IV Sets"
            className="group rounded-2xl bg-white p-5 shadow-md transition hover:-translate-y-1 hover:shadow-xl"
          >
            <Syringe className="h-8 w-8 text-green-600" />
            <h3 className="mt-3 font-bold text-gray-900">IV & Injection</h3>
            <p className="mt-1 text-xs text-gray-500">IV sets and syringes</p>
          </Link>

          <Link
            href="/products"
            className="group rounded-2xl bg-white p-5 shadow-md transition hover:-translate-y-1 hover:shadow-xl"
          >
            <ShieldCheck className="h-8 w-8 text-orange-500" />
            <h3 className="mt-3 font-bold text-gray-900">All Products</h3>
            <p className="mt-1 text-xs text-gray-500">Browse our catalogue</p>
          </Link>
        </div>
      </section>

      {/* FEATURED PRODUCTS */}
      <section className="container mx-auto px-4 py-12">
        <div className="mb-6 flex items-end justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-blue-600">
              Our Catalogue
            </p>

            <h2 className="mt-1 text-2xl font-extrabold text-gray-900 sm:text-3xl">
              Featured Products
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Browse some of our available medical supplies.
            </p>
          </div>

          <Link
            href="/products"
            className="hidden items-center gap-1 text-sm font-semibold text-blue-600 sm:flex"
          >
            View all
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {featuredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              showDiscount
            />
          ))}
        </div>

        <div className="mt-6 text-center sm:hidden">
          <Link
            href="/products"
            className="inline-flex items-center gap-1 font-semibold text-blue-600"
          >
            View all products
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* DIAGNOSTICS */}
      {diagnosticProducts.length > 0 && (
        <section className="bg-white border-y border-gray-100">
          <div className="container mx-auto px-4 py-12">
            <div className="mb-6 flex items-end justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-wider text-purple-600">
                  Diagnostics & Research
                </p>

                <h2 className="mt-1 text-2xl font-extrabold text-gray-900">
                  Diagnostic & Laboratory Supplies
                </h2>
              </div>

              <Link
                href="/products?category=Diagnostics"
                className="hidden items-center gap-1 text-sm font-semibold text-blue-600 sm:flex"
              >
                See all
                <ChevronRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {diagnosticProducts.slice(0, 4).map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  showDiscount
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* LAB / HEALTHCARE */}
      {laboratoryProducts.length > 0 && (
        <section className="container mx-auto px-4 py-12">
          <div className="mb-6">
            <p className="text-sm font-semibold uppercase tracking-wider text-green-600">
              Healthcare Essentials
            </p>

            <h2 className="mt-1 text-2xl font-extrabold text-gray-900">
              Medical & Laboratory Essentials
            </h2>
          </div>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {laboratoryProducts.slice(0, 4).map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                showDiscount
              />
            ))}
          </div>
        </section>
      )}

      {/* TRUST SECTION */}
      <section className="bg-blue-700">
        <div className="container mx-auto px-4 py-12">
          <div className="grid gap-8 text-center text-white md:grid-cols-3">
            <div>
              <ShieldCheck className="mx-auto h-9 w-9" />
              <h3 className="mt-3 font-bold">Quality Products</h3>
              <p className="mt-1 text-sm text-blue-100">
                Medical supplies selected for quality and reliability.
              </p>
            </div>

            <div>
              <Stethoscope className="mx-auto h-9 w-9" />
              <h3 className="mt-3 font-bold">Healthcare Focused</h3>
              <p className="mt-1 text-sm text-blue-100">
                Products for hospitals, clinics, laboratories and professionals.
              </p>
            </div>

            <div>
              <ArrowRight className="mx-auto h-9 w-9" />
              <h3 className="mt-3 font-bold">Browse Our Catalogue</h3>
              <p className="mt-1 text-sm text-blue-100">
                Explore the complete range of available products.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER CTA */}
      <section className="bg-slate-900">
        <div className="container mx-auto px-4 py-10 text-center">
          <h2 className="text-2xl font-bold text-white">
            Looking for a specific medical product?
          </h2>

          <p className="mt-2 text-sm text-slate-400">
            Browse our complete product catalogue.
          </p>

          <Link
            href="/products"
            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 font-bold text-white transition hover:bg-blue-500"
          >
            View Products
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
