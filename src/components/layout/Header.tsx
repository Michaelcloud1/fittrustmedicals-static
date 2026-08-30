'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { Menu, X, Search } from 'lucide-react';
import { products } from '@/data/products';

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [search, setSearch] = useState('');

  const categories = Array.from(
    new Set(products.map((product) => product.category).filter(Boolean))
  ).map((category) => ({
    name: category,
    href: `/products?category=${encodeURIComponent(category)}`,
  }));

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault();

    const value = search.trim();

    if (value) {
      window.location.href = `/products?search=${encodeURIComponent(value)}`;
    }
  };

  return (
    <header className="sticky top-0 z-50 border-b border-gray-100 bg-white shadow-sm">
      <div className="container mx-auto px-3 sm:px-4">

        {/* =====================================================
            TOP HEADER ROW
        ====================================================== */}
        <div className="flex min-h-[58px] items-center justify-between gap-2 sm:min-h-[64px]">

          {/* LOGO + BRAND */}
          <Link
            href="/"
            className="flex min-w-0 items-center gap-2"
          >
            <div className="relative h-9 w-9 shrink-0 sm:h-10 sm:w-10">
              <Image
                src="/images/logo.png"
                alt="FitTrust Medicals"
                fill
                priority
                sizes="40px"
                className="object-contain"
              />
            </div>

            <div className="min-w-0 leading-tight">
              <div className="truncate text-xs font-extrabold text-blue-700 sm:text-sm">
                FITTRUST MEDICALS
              </div>

              <div className="truncate text-[9px] text-gray-500 sm:text-[10px]">
                Healthcare Supplies
              </div>
            </div>
          </Link>

          {/* =====================================================
              DESKTOP SEARCH
              Hidden on mobile.
          ====================================================== */}
          <form
            onSubmit={submitSearch}
            className="mx-4 hidden max-w-xl flex-1 md:block"
          >
            <div className="relative">
              <Search
                size={18}
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
              />

              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search medical products..."
                className="w-full rounded-full border border-gray-200 bg-gray-50 py-2.5 pl-11 pr-4 text-sm text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>
          </form>

          {/* =====================================================
              DESKTOP NAVIGATION
          ====================================================== */}
          <nav className="hidden shrink-0 items-center gap-5 text-sm font-semibold text-gray-700 lg:flex">
            <Link href="/" className="transition hover:text-blue-600">
              Home
            </Link>

            <Link href="/products" className="transition hover:text-blue-600">
              Products
            </Link>

            <Link href="/about" className="transition hover:text-blue-600">
              About
            </Link>

            <Link href="/contact" className="transition hover:text-blue-600">
              Contact
            </Link>
          </nav>

          {/* =====================================================
              MOBILE MENU BUTTON
          ====================================================== */}
          <button
            type="button"
            onClick={() => setMenuOpen(true)}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-gray-700 transition hover:bg-gray-100 sm:h-10 sm:w-10 lg:hidden"
            aria-label="Open menu"
            aria-expanded={menuOpen}
          >
            <Menu size={22} />
          </button>
        </div>

        {/* =====================================================
            MOBILE SEARCH
            THIS IS THE ONLY SEARCH BAR SHOWN ON MOBILE.
        ====================================================== */}
        <div className="pb-3 md:hidden">
          <form onSubmit={submitSearch}>
            <div className="relative">
              <Search
                size={17}
                className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
              />

              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search medical products..."
                className="h-10 w-full rounded-xl border border-gray-200 bg-gray-50 pl-10 pr-4 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
              />
            </div>
          </form>
        </div>

      </div>

      {/* =======================================================
          MOBILE SIDE MENU
      ======================================================== */}
      {menuOpen && (
        <>
          {/* Overlay */}
          <div
            className="fixed inset-0 z-[100] bg-black/40"
            onClick={() => setMenuOpen(false)}
          />

          {/* Drawer */}
          <aside className="fixed right-0 top-0 z-[101] h-full w-[88%] max-w-sm overflow-y-auto bg-white shadow-2xl">

            {/* Drawer Header */}
            <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">

              <div>
                <div className="text-sm font-extrabold text-blue-700">
                  FITTRUST MEDICALS
                </div>

                <div className="text-[10px] text-gray-500">
                  Healthcare Supplies
                </div>
              </div>

              <button
                type="button"
                onClick={() => setMenuOpen(false)}
                className="flex h-10 w-10 items-center justify-center rounded-lg text-gray-700 transition hover:bg-gray-100"
                aria-label="Close menu"
              >
                <X size={22} />
              </button>

            </div>

            {/* Drawer Navigation */}
            <nav className="space-y-1 p-4">

              <Link
                href="/"
                onClick={() => setMenuOpen(false)}
                className="block rounded-xl px-4 py-3 font-medium text-gray-700 transition hover:bg-blue-50 hover:text-blue-700"
              >
                Home
              </Link>

              <Link
                href="/products"
                onClick={() => setMenuOpen(false)}
                className="block rounded-xl px-4 py-3 font-medium text-gray-700 transition hover:bg-blue-50 hover:text-blue-700"
              >
                All Products
              </Link>

              <Link
                href="/about"
                onClick={() => setMenuOpen(false)}
                className="block rounded-xl px-4 py-3 font-medium text-gray-700 transition hover:bg-blue-50 hover:text-blue-700"
              >
                About
              </Link>

              <Link
                href="/contact"
                onClick={() => setMenuOpen(false)}
                className="block rounded-xl px-4 py-3 font-medium text-gray-700 transition hover:bg-blue-50 hover:text-blue-700"
              >
                Contact
              </Link>

              <div className="my-4 border-t border-gray-100" />

              <p className="px-4 pb-2 text-xs font-bold uppercase tracking-wide text-gray-400">
                Categories
              </p>

              {categories.map((category) => (
                <Link
                  key={category.name}
                  href={category.href}
                  onClick={() => setMenuOpen(false)}
                  className="block rounded-xl px-4 py-3 text-sm text-gray-600 transition hover:bg-blue-50 hover:text-blue-700"
                >
                  {category.name}
                </Link>
              ))}

            </nav>
          </aside>
        </>
      )}
    </header>
  );
}

export default Header;
