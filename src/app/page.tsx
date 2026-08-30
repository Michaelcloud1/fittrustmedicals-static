'use client';

import Link from 'next/link';
import { ArrowRight, ShieldCheck } from 'lucide-react';

import { Header } from '@/components/layout/Header';
import { ProductCard } from '@/components/product/ProductCard';
import { products } from '@/data/products';

const featuredProducts = products.filter((product) => product.featured);

const diagnosticProducts = products.filter((product) =>
  product.category.toLowerCase().includes('diagnostic')
);

const laboratoryProducts = products.filter((product) =>
  product.category.toLowerCase().includes('laboratory')
);

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-50">
      <Header />

      {/* HERO */}
      <section className="relative isolate overflow-hidden bg-gradient-to-br from-blue-700 via-blue-600 to-indigo-700">
        {/* Decorative background - MUST NOT receive clicks */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.16),transparent_35%)]"
        />

        <div className="relative z-10 container mx-auto px-4 py-14 sm:py-20 lg:py-24">
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

            {/* HERO BUTTONS */}
            <div className="relative z-20 mt-8 flex flex-col gap-3 sm:flex-row">

              <Link
                href="/products"
                className="relative z-20 inline-flex min-h-12 cursor-pointer items-center justify-center gap-2 rounded-xl bg-white px-6 py-3 font-bold text-blue-700 shadow-lg transition hover:-translate-y-0.5 hover:shadow-xl"
              >
                Browse Products
                <ArrowRight className="h-4 w-4" />
              </Link>

              <Link
                href="/products?category=Diagnostics"
                className="relative z-20 inline-flex min-h-12 cursor-pointer items-center justify-center rounded-xl border border-white/30 bg-white/10 px-6 py-3 font-semibold text-white backdrop-blur transition hover:bg-white/20"
              >
                Diagnostic Supplies
              </Link>

            </div>
          </div>
        </div>
      </section>

      {/* FEATURED PRODUCTS */}
      {featuredProducts.length > 0 && (
        <section className="container mx-auto px-4 py-12">

          <div className="mb-6 flex items-end justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl">
                Featured Products
              </h2>

              <p className="mt-2 text-gray-600">
                Browse some of our selected medical supplies.
              </p>
            </div>

            <Link
              href="/products"
              className="hidden items-center gap-1 text-sm font-bold text-blue-600 hover:text-blue-700 sm:flex"
            >
              View all
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {featuredProducts.slice(0, 8).map((product) => (
              <ProductCard
                key={product.id}
                product={product}
              />
            ))}
          </div>

          {/* MOBILE VIEW ALL */}
          <Link
            href="/products"
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl border border-blue-200 bg-white px-5 py-3 text-sm font-bold text-blue-600 sm:hidden"
          >
            View All Products
            <ArrowRight className="h-4 w-4" />
          </Link>

        </section>
      )}

      {/* DIAGNOSTICS */}
      {diagnosticProducts.length > 0 && (
        <section className="border-y border-gray-100 bg-white">

          <div className="container mx-auto px-4 py-12">

            <div className="mb-6 flex items-end justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl">
                  Diagnostic Supplies
                </h2>

                <p className="mt-2 text-gray-600">
                  Rapid tests and diagnostic products for healthcare
                  professionals.
                </p>
              </div>

              <Link
                href="/products?category=Diagnostics"
                className="hidden items-center gap-1 text-sm font-bold text-blue-600 hover:text-blue-700 sm:flex"
              >
                View all
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {diagnosticProducts.slice(0, 8).map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                />
              ))}
            </div>

            {/* MOBILE VIEW ALL */}
            <Link
              href="/products?category=Diagnostics"
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl border border-blue-200 bg-blue-50 px-5 py-3 text-sm font-bold text-blue-600 sm:hidden"
            >
              View All Diagnostic Supplies
              <ArrowRight className="h-4 w-4" />
            </Link>

          </div>
        </section>
      )}

      {/* LABORATORY */}
      {laboratoryProducts.length > 0 && (
        <section className="container mx-auto px-4 py-12">

          <div className="mb-6 flex items-end justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl">
                Laboratory Products
              </h2>

              <p className="mt-2 text-gray-600">
                Laboratory supplies and equipment for professional use.
              </p>
            </div>

            <Link
              href="/products?category=Laboratory"
              className="hidden items-center gap-1 text-sm font-bold text-blue-600 hover:text-blue-700 sm:flex"
            >
              View all
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {laboratoryProducts.slice(0, 8).map((product) => (
              <ProductCard
                key={product.id}
                product={product}
              />
            ))}
          </div>

          {/* MOBILE VIEW ALL */}
          <Link
            href="/products?category=Laboratory"
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl border border-blue-200 bg-white px-5 py-3 text-sm font-bold text-blue-600 sm:hidden"
          >
            View All Laboratory Products
            <ArrowRight className="h-4 w-4" />
          </Link>

        </section>
      )}

      {/* CTA */}
      <section className="bg-blue-700">

        <div className="container mx-auto px-4 py-12 text-center text-white">

          <h2 className="text-2xl font-bold sm:text-3xl">
            Looking for a specific medical product?
          </h2>

          <p className="mx-auto mt-3 max-w-2xl text-blue-100">
            Browse our catalogue or contact FitTrust Medicals directly on
            WhatsApp for product information and pricing.
          </p>

          <Link
            href="/products"
            className="mt-6 inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-white px-6 py-3 font-bold text-blue-700 transition hover:bg-blue-50"
          >
            Browse Products
            <ArrowRight className="h-4 w-4" />
          </Link>

        </div>
      </section>

    </div>
  );
}