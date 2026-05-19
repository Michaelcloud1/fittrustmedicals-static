'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { useCartStore } from '@/stores/cartStore';
import {
  ShoppingCart,
  User,
  Search,
  Menu,
  X,
  ChevronDown,
  Heart,
  LogOut
} from 'lucide-react';

// Helper function to calculate cart item count
const calculateCartCount = (items: any[]) => {
  return items.reduce((total, item) => total + (item.quantity || 1), 0);
};

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isClient, setIsClient] = useState(false);
  const [accountDropdownOpen, setAccountDropdownOpen] = useState(false);

  const accountRef = useRef<HTMLDivElement>(null);

  const { customer, isAuthenticated, logout } = useAuthStore();
  const { items } = useCartStore();

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (accountRef.current && !accountRef.current.contains(event.target as Node)) {
        setAccountDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [mobileMenuOpen]);

  const cartItemCount = isClient ? calculateCartCount(items) : 0;

  const handleLogout = async () => {
    await logout();
    router.push('/');
    setMobileMenuOpen(false);
    setAccountDropdownOpen(false);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/products?search=${encodeURIComponent(searchQuery)}`);
      setSearchQuery('');
      setMobileMenuOpen(false);
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-white shadow-md w-full">
      {/* Top Bar - Logo and Company Name with Icons - FIXED LAYOUT NO OVERLAP */}
      <div className="bg-white">
        <div className="container mx-auto px-4 py-4">
          {/* Desktop Layout: Logo Left | Search Center | Icons Right */}
          <div className="hidden md:grid md:grid-cols-3 items-center gap-6">
            {/* Logo Section - Left */}
            <Link href="/" className="flex items-center gap-3 flex-shrink-0 justify-start">
              <div className="relative w-12 h-12">
                <Image
                  src="/images/logo.png"
                  alt="Fittrust Medicals"
                  fill
                  className="object-contain"
                  priority
                />
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-bold text-blue-600 tracking-tight">
                  FITTRUST MEDICALS
                </span>
                <span className="text-xs text-gray-500">
                  Healthcare Supplies
                </span>
              </div>
            </Link>

            {/* Search Bar - Center (NO OVERLAP, separate column) */}
            <div className="w-full">
              <form onSubmit={handleSearch} className="relative">
                <Search 
                  size={18} 
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  type="text"
                  placeholder="Search products, brands and more..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full py-3 pl-11 pr-4 rounded-full border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm bg-gray-50"
                />
              </form>
            </div>

            {/* Icons Section - Right (Wishlist, User, Cart) */}
            <div className="flex items-center justify-end gap-5">
              {/* Wishlist Link */}
              <Link 
                href="/wishlist" 
                className="flex items-center gap-2 text-gray-700 hover:text-blue-600 transition-colors"
              >
                <Heart size={20} />
                <span className="text-sm font-medium hidden lg:inline">Wishlist</span>
              </Link>

              {/* User/Login Dropdown */}
              <div className="relative" ref={accountRef}>
                <button
                  onClick={() => setAccountDropdownOpen(!accountDropdownOpen)}
                  className="flex items-center gap-2 text-gray-700 hover:text-blue-600 transition-colors"
                >
                  <User size={20} />
                  <span className="text-sm font-medium hidden lg:inline">
                    {isAuthenticated ? customer?.name?.split(' ')[0] : 'Account'}
                  </span>
                </button>
                {accountDropdownOpen && (
                  <div className="absolute right-0 mt-3 w-56 bg-white rounded-lg shadow-xl py-2 z-[200] border border-gray-100">
                    {isAuthenticated ? (
                      <>
                        <div className="px-4 py-2 border-b border-gray-100 mb-1">
                          <p className="text-sm font-semibold text-gray-800">{customer?.name}</p>
                          <p className="text-xs text-gray-500">{customer?.email}</p>
                        </div>
                        <Link href="/account" onClick={() => setAccountDropdownOpen(false)} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                          My Account
                        </Link>
                        <Link href="/orders" onClick={() => setAccountDropdownOpen(false)} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                          My Orders
                        </Link>
                        <Link href="/wishlist" onClick={() => setAccountDropdownOpen(false)} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                          Wishlist
                        </Link>
                        <hr className="my-1" />
                        <button onClick={handleLogout} className="flex items-center gap-2 w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50">
                          <LogOut size={14} /> Logout
                        </button>
                      </>
                    ) : (
                      <>
                        <Link href="/login" onClick={() => setAccountDropdownOpen(false)} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                          Sign In
                        </Link>
                        <Link href="/register" onClick={() => setAccountDropdownOpen(false)} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                          Create Account
                        </Link>
                      </>
                    )}
                  </div>
                )}
              </div>

              {/* Cart */}
              <Link 
                href="/cart" 
                className="relative text-gray-700 hover:text-blue-600 transition-colors"
                aria-label="Shopping cart"
              >
                <ShoppingCart size={22} />
                {cartItemCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1 font-bold">
                    {cartItemCount > 99 ? '99+' : cartItemCount}
                  </span>
                )}
              </Link>
            </div>
          </div>

          {/* Mobile Layout: Logo + Icons row, Search below */}
          <div className="md:hidden">
            {/* Top row: Logo and icons */}
            <div className="flex items-center justify-between">
              <Link href="/" className="flex items-center gap-2">
                <div className="relative w-9 h-9">
                  <Image
                    src="/images/logo.png"
                    alt="Fittrust Medicals"
                    fill
                    className="object-contain"
                  />
                </div>
                <div className="flex flex-col">
                  <span className="text-base font-bold text-blue-600">
                    FITTRUST MEDICALS
                  </span>
                  <span className="text-[9px] text-gray-500">
                    Healthcare Supplies
                  </span>
                </div>
              </Link>

              <div className="flex items-center gap-3">
                <Link href="/wishlist" className="p-2">
                  <Heart size={20} className="text-gray-600" />
                </Link>
                <div className="relative" ref={accountRef}>
                  <button onClick={() => setAccountDropdownOpen(!accountDropdownOpen)} className="p-2">
                    <User size={20} className="text-gray-600" />
                  </button>
                </div>
                <Link href="/cart" className="relative p-2">
                  <ShoppingCart size={20} className="text-gray-600" />
                  {cartItemCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[9px] rounded-full min-w-[16px] h-4 flex items-center justify-center px-1">
                      {cartItemCount > 99 ? '99+' : cartItemCount}
                    </span>
                  )}
                </Link>
                <button
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="p-2"
                >
                  <Menu size={22} className="text-gray-600" />
                </button>
              </div>
            </div>

            {/* Search Bar - Full width below on mobile */}
            <div className="mt-3">
              <form onSubmit={handleSearch} className="relative">
                <Search 
                  size={16} 
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  type="text"
                  placeholder="Search products, brands and more..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full py-2.5 pl-9 pr-3 rounded-full border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-gray-50"
                />
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Hero Sale Section - Medical Equipment Sale */}
      <div className="bg-gradient-to-r from-blue-600 to-teal-500 text-white">
        <div className="container mx-auto px-4 py-12 md:py-16 text-center">
          <h2 className="text-3xl md:text-5xl font-bold mb-3">Medical Equipment Sale</h2>
          <p className="text-lg md:text-xl text-blue-50 mb-6">Premium quality healthcare supplies</p>
          <Link 
            href="/sale" 
            className="inline-flex items-center gap-2 bg-white text-blue-600 hover:bg-gray-100 px-6 py-3 rounded-full font-semibold transition-all shadow-lg hover:shadow-xl"
          >
            Shop Now
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>

      {/* Categories Promo Section - Diagnostic Tools & PPE Supplies */}
      <div className="bg-gray-50 border-b border-gray-200">
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Diagnostic Tools Card */}
            <Link href="/products?category=diagnostic" className="group block">
              <div className="bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300">
                <div className="p-6 text-center">
                  <div className="w-16 h-16 mx-auto mb-4 bg-blue-100 rounded-full flex items-center justify-center group-hover:bg-blue-200 transition">
                    <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 9h-6L8 4z" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-2">Diagnostic Tools</h3>
                  <p className="text-red-500 font-semibold text-lg">Up to 30% off</p>
                  <span className="inline-block mt-3 text-blue-600 group-hover:underline">Shop Now →</span>
                </div>
              </div>
            </Link>

            {/* PPE Supplies Card */}
            <Link href="/products?category=ppe" className="group block">
              <div className="bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300">
                <div className="p-6 text-center">
                  <div className="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center group-hover:bg-green-200 transition">
                    <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-2">PPE Supplies</h3>
                  <p className="text-red-500 font-semibold text-lg">Up to 25% off</p>
                  <span className="inline-block mt-3 text-blue-600 group-hover:underline">Shop Now →</span>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </div>

      {/* MOBILE SIDEBAR MENU */}
      {mobileMenuOpen && (
        <>
          <div className="fixed inset-0 bg-black/50 z-[100]" onClick={() => setMobileMenuOpen(false)} />
          <div className="fixed left-0 top-0 bottom-0 w-80 bg-white z-[101] shadow-xl overflow-y-auto">
            <div className="sticky top-0 bg-white border-b p-4 flex justify-between items-center">
              <span className="font-bold text-blue-600">Menu</span>
              <button onClick={() => setMobileMenuOpen(false)} className="p-2 rounded-lg hover:bg-gray-100">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-4 space-y-4">
              {/* User section */}
              {isAuthenticated ? (
                <div className="pb-3 border-b">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <div className="font-semibold">{customer?.name}</div>
                      <button onClick={handleLogout} className="text-xs text-red-600 flex items-center gap-1">
                        <LogOut size={12} /> Logout
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-2 pb-3 border-b">
                  <Link href="/login" onClick={() => setMobileMenuOpen(false)} className="block w-full bg-blue-600 text-white text-center py-2 rounded-md text-sm font-semibold">
                    Sign In
                  </Link>
                  <Link href="/register" onClick={() => setMobileMenuOpen(false)} className="block w-full border border-blue-600 text-blue-600 text-center py-2 rounded-md text-sm font-semibold">
                    Create Account
                  </Link>
                </div>
              )}

              {/* Quick Links */}
              <div>
                <Link href="/wishlist" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 py-3 text-gray-700 border-b border-gray-100">
                  <Heart size={18} /> Wishlist
                </Link>
              </div>

              <div className="pt-2">
                <h3 className="font-semibold text-gray-800 mb-2 text-sm">Quick Links</h3>
                <Link href="/products" onClick={() => setMobileMenuOpen(false)} className="block px-2 py-2 text-sm text-gray-600 hover:text-blue-600 rounded-lg">
                  All Products
                </Link>
                <Link href="/sale" onClick={() => setMobileMenuOpen(false)} className="block px-2 py-2 text-sm text-red-600 hover:text-red-700 rounded-lg">
                  Medical Equipment Sale
                </Link>
                <Link href="/products?category=diagnostic" onClick={() => setMobileMenuOpen(false)} className="block px-2 py-2 text-sm text-gray-600 hover:text-blue-600 rounded-lg">
                  Diagnostic Tools (30% off)
                </Link>
                <Link href="/products?category=ppe" onClick={() => setMobileMenuOpen(false)} className="block px-2 py-2 text-sm text-gray-600 hover:text-blue-600 rounded-lg">
                  PPE Supplies (25% off)
                </Link>
                <Link href="/contact" onClick={() => setMobileMenuOpen(false)} className="block px-2 py-2 text-sm text-gray-600 hover:text-blue-600 rounded-lg">
                  Contact Us
                </Link>
              </div>
            </div>
          </div>
        </>
      )}
    </header>
  );
}