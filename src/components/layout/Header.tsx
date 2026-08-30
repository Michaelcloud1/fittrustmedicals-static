'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { products } from '@/data/products';

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  const categories = Array.from(
    new Set(
      products
        .map((product) => product.category)
        .filter(Boolean)
    )
  ).map((category) => ({
    name: category,
    href: `/products?category=${encodeURIComponent(category)}`,
  }));

  return (
    <header className="sticky top-0 z-50 border-b border-gray-100 bg-white shadow-sm">
      <div className="container mx-auto px-3 sm:px-4">

        {/* TOP HEADER */}
        <div className="flex min-h-[64px] items-center gap-2 sm:min-h-[72px] sm:gap-4">

          {/* LOGO + BRAND */}
          <Link
            href="/"
            className="flex min-w-0 shrink-0 items-center gap-2 sm:gap-3"
          >
            {/* Logo */}
            <div className="relative h-10 w-10 shrink-0 sm:h-11 sm:w-11">
              <Image
                src="/images/logo.png"
                alt="FitTrust Medicals"
                fill
                priority
                sizes="44px"
                className="object-contain"
              />
            </div>

            {/* Brand text */}
            <div className="min-w-0">
              <div className="truncate text-sm font-extrabold leading-tight text-blue-700 sm:text-base">
                FITTRUST MEDICALS
              </div>

              <div className="truncate text-[10px] leading-tight text-gray-500 sm:text-xs">
                Healthcare Supplies
              </div>
            </div>
          </Link>

          {/* DESKTOP NAVIGATION */}
          <nav className="ml-auto hidden items-center gap-5 text-sm font-semibold text-gray-700 lg:flex">
            <Link
              href="/"
              className="transition hover:text-blue-600"
            >
              Home
            </Link>

            <Link
              href="/products"
              className="transition hover:text-blue-600"
            >
              Products
            </Link>

            <Link
              href="/about"
              className="transition hover:text-blue-600"
            >
              About
            </Link>

            <Link
              href="/contact"
              className="transition hover:text-blue-600"
            >
              Contact
            </Link>
          </nav>

          {/* MOBILE MENU BUTTON */}
          <button
            type="button"
            onClick={() => setMenuOpen(true)}
            className="ml-auto flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-gray-700 transition hover:bg-gray-100 active:bg-gray-200 lg:hidden"
            aria-label="Open navigation menu"
            aria-expanded={menuOpen}
          >
            <Menu size={24} />
          </button>

        </div>
      </div>

      {/* MOBILE MENU */}
      {menuOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-[1px]"
            onClick={() => setMenuOpen(false)}
            aria-hidden="true"
          />

          {/* Drawer */}
          <aside
            className="fixed right-0 top-0 z-[101] h-full w-[88%] max-w-sm overflow-y-auto bg-white shadow-2xl"
            aria-label="Mobile navigation"
          >
            {/* Drawer Header */}
            <div className="flex min-h-[72px] items-center justify-between border-b border-gray-100 px-5">
              <Link
                href="/"
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-3"
              >
                <div className="relative h-10 w-10 shrink-0">
                  <Image
                    src="/images/logo.png"
                    alt="FitTrust Medicals"
                    fill
                    sizes="40px"
                    className="object-contain"
                  />
                </div>

                <div>
                  <div className="text-sm font-extrabold leading-tight text-blue-700">
                    FITTRUST MEDICALS
                  </div>

                  <div className="text-[10px] leading-tight text-gray-500">
                    Healthcare Supplies
                  </div>
                </div>
              </Link>

              <button
                type="button"
                onClick={() => setMenuOpen(false)}
                className="flex h-10 w-10 items-center justify-center rounded-lg text-gray-700 hover:bg-gray-100"
                aria-label="Close navigation menu"
              >
                <X size={22} />
              </button>
            </div>

            {/* Navigation */}
            <nav className="px-4 py-5">

              <Link
                href="/"
                onClick={() => setMenuOpen(false)}
                className="block rounded-xl px-4 py-3.5 text-sm font-semibold text-gray-700 transition hover:bg-blue-50 hover:text-blue-700"
              >
                Home
              </Link>

              <Link
                href="/products"
                onClick={() => setMenuOpen(false)}
                className="block rounded-xl px-4 py-3.5 text-sm font-semibold text-gray-700 transition hover:bg-blue-50 hover:text-blue-700"
              >
                All Products
              </Link>

              <Link
                href="/products?category=Diagnostics"
                onClick={() => setMenuOpen(false)}
                className="block rounded-xl px-4 py-3.5 text-sm font-semibold text-gray-700 transition hover:bg-blue-50 hover:text-blue-700"
              >
                Diagnostic Supplies
              </Link>

              <div className="my-4 border-t border-gray-100" />

              <Link
                href="/about"
                onClick={() => setMenuOpen(false)}
                className="block rounded-xl px-4 py-3.5 text-sm font-semibold text-gray-700 transition hover:bg-blue-50 hover:text-blue-700"
              >
                About
              </Link>

              <Link
                href="/contact"
                onClick={() => setMenuOpen(false)}
                className="block rounded-xl px-4 py-3.5 text-sm font-semibold text-gray-700 transition hover:bg-blue-50 hover:text-blue-700"
              >
                Contact
              </Link>

              {categories.length > 0 && (
                <>
                  <div className="my-4 border-t border-gray-100" />

                  <p className="px-4 pb-2 text-xs font-bold uppercase tracking-wider text-gray-400">
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
                </>
              )}

            </nav>
          </aside>
        </>
      )}
    </header>
  );
}

export default Header;