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

        {/* =========================
            TOP HEADER ROW
        ========================== */}
        <div className="flex min-h-[64px] items-center gap-2 sm:gap-3">

          {/* LOGO + BRAND */}
          <Link
            href="/"
            className="flex min-w-0 shrink items-center gap-2 sm:gap-3"
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

            <div className="min-w-0">
              <div className="truncate text-[15px] font-extrabold leading-tight text-blue-700 sm:text-lg">
                FITTRUST MEDICALS
              </div>

              <div className="truncate text-[10px] leading-tight text-gray-500 sm:text-xs">
                Healthcare Supplies
              </div>
            </div>
          </Link>

          {/* DESKTOP SEARCH ONLY */}
          <form
            onSubmit={submitSearch}
            className="mx-auto hidden max-w-xl flex-1 md:block"
          >
            <div className="relative">
              <Search
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
              />

              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search medical products..."
                className="w-full rounded-full border border-gray-200 bg-gray-50 py-2.5 pl-11 pr-4 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>
          </form>

          {/* DESKTOP NAVIGATION */}
          <nav className="hidden shrink-0 items-center gap-5 text-sm font-semibold text-gray-700 lg:flex">
            <Link href="/" className="hover:text-blue-600">
              Home
            </Link>

            <Link href="/products" className="hover:text-blue-600">
              Products
            </Link>

            <Link href="/about" className="hover:text-blue-600">
              About
            </Link>

            <Link href="/contact" className="hover:text-blue-600">
              Contact
            </Link>
          </nav>

          {/* MOBILE MENU BUTTON */}
          <button
            type="button"
            onClick={() => setMenuOpen(true)}
            className="ml-auto shrink-0 rounded-lg p-2 text-gray-700 transition hover:bg-gray-100"
            aria-label="Open menu"
          >
            <Menu size={23} />
          </button>
        </div>

        {/* =========================
            MOBILE SEARCH ROW
            Only visible below md
        ========================== */}
        <div className="pb-3 md:hidden">
          <form onSubmit={submitSearch}>
            <div className="relative">
              <Search
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
              />

              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search medical products..."
                className="h-11 w-full rounded-xl border border-gray-200 bg-gray-50 pl-11 pr-4 text-sm text-gray-800 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
              />
            </div>
          </form>
        </div>
      </div>

      {/* =========================
          MOBILE SIDE MENU
      ========================== */}
      {menuOpen && (
        <>
          {/* Overlay */}
          <div
            className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-[1px]"
            onClick={() => setMenuOpen(false)}
          />

          {/* Drawer */}
          <aside className="fixed right-0 top-0 z-[101] h-full w-[88%] max-w-sm overflow-y-auto bg-white shadow-2xl">

            {/* Drawer Header */}
            <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
              <div className="flex items-center gap-2">
                <div className="relative h-9 w-9">
                  <Image
                    src="/images/logo.png"
                    alt="FitTrust Medicals"
                    fill
                    sizes="36px"
                    className="object-contain"
                  />
                </div>

                <div>
                  <div className="text-sm font-extrabold text-blue-700">
                    FITTRUST MEDICALS
                  </div>

                  <div className="text-[10px] text-gray-500">
                    Healthcare Supplies
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setMenuOpen(false)}
                className="rounded-lg p-2 text-gray-600 transition hover:bg-gray-100"
                aria-label="Close menu"
              >
                <X size={22} />
              </button>
            </div>

            {/* Drawer Navigation */}
            <nav className="space-y-1 px-4 py-5">

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

              <div className="px-4 pb-2 text-xs font-bold uppercase tracking-wide text-gray-400">
                Categories
              </div>

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