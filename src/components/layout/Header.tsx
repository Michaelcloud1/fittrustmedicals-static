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
  new Set(products.map((product) => product.category))
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
    <header className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center gap-4 py-3">

          <Link href="/" className="flex items-center gap-3 shrink-0">
            <div className="relative w-10 h-10">
              <Image
                src="/images/logo.png"
                alt="FitTrust Medicals"
                fill
                priority
                className="object-contain"
              />
            </div>

            <div className="hidden sm:block">
              <div className="font-extrabold text-blue-700">
                FITTRUST MEDICALS
              </div>

              <div className="text-xs text-gray-500">
                Healthcare Supplies
              </div>
            </div>
          </Link>

          <form
            onSubmit={submitSearch}
            className="hidden md:block flex-1 max-w-xl mx-auto"
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
                className="w-full rounded-full border border-gray-200 bg-gray-50 py-2.5 pl-11 pr-4 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>
          </form>

          <nav className="hidden lg:flex items-center gap-5 text-sm font-semibold text-gray-700">
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

          <button
            onClick={() => setMenuOpen(true)}
            className="ml-auto lg:hidden rounded-lg p-2 hover:bg-gray-100"
            aria-label="Open menu"
          >
            <Menu size={22} />
          </button>
        </div>
      </div>

      {menuOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/40 z-[100]"
            onClick={() => setMenuOpen(false)}
          />

          <aside className="fixed left-0 top-0 bottom-0 w-80 max-w-[85vw] bg-white z-[101] shadow-2xl p-5 overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <span className="font-bold text-blue-700">
                FITTRUST MEDICALS
              </span>

              <button
                onClick={() => setMenuOpen(false)}
                className="p-2 rounded-lg hover:bg-gray-100"
              >
                <X size={20} />
              </button>
            </div>

            <nav className="space-y-1">
              <Link
                href="/"
                onClick={() => setMenuOpen(false)}
                className="block rounded-lg px-3 py-3 hover:bg-blue-50"
              >
                Home
              </Link>

              <Link
                href="/products"
                onClick={() => setMenuOpen(false)}
                className="block rounded-lg px-3 py-3 hover:bg-blue-50"
              >
                All Products
              </Link>

              {categories.map((category) => (
                <Link
                  key={category.name}
                  href={category.href}
                  onClick={() => setMenuOpen(false)}
                  className="block rounded-lg px-3 py-3 hover:bg-blue-50"
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