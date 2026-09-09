'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { Menu, X, Search } from 'lucide-react';

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [search, setSearch] = useState('');

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault();

    const value = search.trim();

    if (value) {
      window.location.href = `/products?search=${encodeURIComponent(value)}`;
    }
  };

  const closeMenu = () => {
    setMenuOpen(false);
  };

  return (
    <header className="site-header sticky top-0 z-[9999] w-full border-b border-gray-100 bg-white shadow-sm">
      <div className="mx-auto w-full max-w-7xl px-4">

        {/* =====================================================
            TOP ROW
            Mobile: Logo + Menu
            Desktop: Logo + Search + Navigation
        ====================================================== */}
        <div className="header-top-row flex min-h-[72px] items-center gap-3">

          {/* LOGO */}
          <Link
            href="/"
            className="header-logo flex min-w-0 shrink-0 items-center gap-2"
          >
            <div className="relative h-11 w-11 shrink-0">
              <Image
                src="/images/logo.png"
                alt="FitTrust Medicals"
                fill
                priority
                sizes="44px"
                className="object-contain"
              />
            </div>

            <div className="logo-text min-w-0">
              <div className="truncate text-sm font-extrabold leading-tight text-blue-700 sm:text-base">
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
            className="desktop-search mx-auto hidden w-full max-w-xl md:block"
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
                className="h-11 w-full rounded-full border border-gray-200 bg-gray-50 pl-11 pr-4 text-sm outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
              />
            </div>
          </form>

          {/* DESKTOP NAVIGATION */}
          <nav className="desktop-nav ml-auto hidden shrink-0 items-center gap-4 text-sm font-semibold text-gray-700 lg:flex xl:gap-6">
            <Link
              href="/"
              className="whitespace-nowrap transition hover:text-blue-600"
            >
              Home
            </Link>

            <Link
              href="/products"
              className="whitespace-nowrap transition hover:text-blue-600"
            >
              Products
            </Link>

            <Link
              href="/about"
              className="whitespace-nowrap transition hover:text-blue-600"
            >
              About
            </Link>

            <Link
              href="/contact"
              className="whitespace-nowrap transition hover:text-blue-600"
            >
              Contact
            </Link>
          </nav>

          {/* MOBILE MENU BUTTON */}
          <button
            type="button"
            onClick={() => setMenuOpen(true)}
            className="mobile-menu-button ml-auto shrink-0 rounded-lg p-2 text-gray-700 transition hover:bg-gray-100 md:hidden"
            aria-label="Open menu"
            aria-expanded={menuOpen}
          >
            <Menu size={26} />
          </button>
        </div>

        {/* =====================================================
            MOBILE NAVIGATION
            This is the ONLY mobile navigation.
            No duplicate Home/Products row.
        ====================================================== */}
        <nav className="mobile-nav-row flex items-center justify-between border-t border-gray-100 py-3 md:hidden">
          <Link
            href="/"
            className="px-1 text-sm font-semibold text-gray-700 hover:text-blue-600"
          >
            Home
          </Link>

          <Link
            href="/products"
            className="px-1 text-sm font-semibold text-gray-700 hover:text-blue-600"
          >
            Products
          </Link>

          <Link
            href="/about"
            className="px-1 text-sm font-semibold text-gray-700 hover:text-blue-600"
          >
            About
          </Link>

          <Link
            href="/contact"
            className="px-1 text-sm font-semibold text-gray-700 hover:text-blue-600"
          >
            Contact
          </Link>
        </nav>

        {/* =====================================================
            MOBILE SEARCH
            This is the ONLY mobile search bar.
            It sits BELOW the navigation and NEVER over the logo.
        ====================================================== */}
        <div className="mobile-search-row border-t border-gray-100 py-3 md:hidden">
          <form onSubmit={submitSearch} className="w-full">
            <div className="relative">
              <Search
                size={21}
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
              />

              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search medical products..."
                className="h-12 w-full rounded-xl border border-gray-200 bg-gray-50 pl-12 pr-4 text-base text-gray-700 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
              />
            </div>
          </form>
        </div>
      </div>

      {/* =====================================================
          MOBILE SLIDE-OUT MENU
      ====================================================== */}
      {menuOpen && (
        <>
          <div
            className="fixed inset-0 z-[10000] bg-black/40"
            onClick={closeMenu}
            aria-hidden="true"
          />

          <aside className="fixed right-0 top-0 z-[10001] h-full w-[88%] max-w-sm overflow-y-auto bg-white p-5 shadow-2xl">
            <div className="mb-7 flex items-center justify-between border-b border-gray-100 pb-4">
              <div className="flex items-center gap-2">
                <div className="relative h-10 w-10">
                  <Image
                    src="/images/logo.png"
                    alt="FitTrust Medicals"
                    fill
                    sizes="40px"
                    className="object-contain"
                  />
                </div>

                <span className="text-sm font-extrabold text-blue-700">
                  FITTRUST MEDICALS
                </span>
              </div>

              <button
                type="button"
                onClick={closeMenu}
                className="rounded-lg p-2 text-gray-700 hover:bg-gray-100"
                aria-label="Close menu"
              >
                <X size={24} />
              </button>
            </div>

            <nav className="space-y-2">
              <Link
                href="/"
                onClick={closeMenu}
                className="block rounded-xl px-4 py-3 font-semibold text-gray-700 hover:bg-blue-50 hover:text-blue-600"
              >
                Home
              </Link>

              <Link
                href="/products"
                onClick={closeMenu}
                className="block rounded-xl px-4 py-3 font-semibold text-gray-700 hover:bg-blue-50 hover:text-blue-600"
              >
                Products
              </Link>

              <Link
                href="/about"
                onClick={closeMenu}
                className="block rounded-xl px-4 py-3 font-semibold text-gray-700 hover:bg-blue-50 hover:text-blue-600"
              >
                About
              </Link>

              <Link
                href="/contact"
                onClick={closeMenu}
                className="block rounded-xl px-4 py-3 font-semibold text-gray-700 hover:bg-blue-50 hover:text-blue-600"
              >
                Contact
              </Link>
            </nav>
          </aside>
        </>
      )}
    </header>
  );
}

export default Header;
