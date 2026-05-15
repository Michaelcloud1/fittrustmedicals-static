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
  LogOut,
  Heart,
  ChevronDown,
  Menu,
  X
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

  const cartItemCount = isClient ? calculateCartCount(items) : 0;

  const allCategories = [
    { name: 'Diagnostic Equipment', href: '/products?category=diagnostic' },
    { name: 'Surgical Supplies', href: '/products?category=surgical' },
    { name: 'Patient Monitoring', href: '/products?category=monitoring' },
    { name: 'PPE & Safety', href: '/products?category=ppe' },
    { name: 'First Aid', href: '/products?category=first-aid' },
    { name: 'Lab Equipment', href: '/products?category=lab' },
    { name: 'Mobility Aids', href: '/products?category=mobility' },
    { name: 'Hospital Furniture', href: '/products?category=furniture' },
    { name: 'Pharmaceuticals', href: '/products?category=pharma' },
    { name: 'Dental Equipment', href: '/products?category=dental' },
  ];

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
    <header className="sticky top-0 z-50 bg-white shadow-sm w-full">
      {/* Top Bar - Company Name Centered (Jumia Style) */}
      <div className="border-b border-gray-100 bg-white">
        <div className="container mx-auto px-4 py-3">
          {/* Logo + Company Name - Centered */}
          <div className="flex flex-col items-center justify-center text-center">
            <Link href="/" className="flex flex-col items-center">
              <div className="relative w-12 h-12 mb-1">
                <Image
                  src="/images/logo.png"
                  alt="Fittrust Medicals"
                  fill
                  className="object-contain"
                  priority
                />
              </div>
              <span className="text-xl md:text-2xl font-bold text-blue-600">
                FITTRUST MEDICALS
              </span>
              <span className="text-[10px] md:text-xs text-gray-500">
                Healthcare Supplies
              </span>
            </Link>
          </div>
        </div>
      </div>

      {/* Search Bar - Centered Below Company Name (Jumia Style) */}
      <div className="bg-white pb-4">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <form onSubmit={handleSearch} className="relative">
              <Search 
                size={20} 
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                placeholder="Search products, brands and categories..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full py-3 pl-12 pr-4 rounded-full border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm bg-gray-50"
              />
              <button
                type="submit"
                className="absolute right-1 top-1/2 -translate-y-1/2 bg-blue-600 text-white px-6 py-1.5 rounded-full text-sm font-medium hover:bg-blue-700 transition"
              >
                Search
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Navigation Menu - Jumia Style Category Bar */}
      <div className="border-t border-gray-100 bg-gray-50">
        <div className="container mx-auto px-4">
          {/* Desktop Categories - Horizontal Scroll */}
          <div className="hidden md:flex items-center gap-6 py-3 overflow-x-auto whitespace-nowrap scrollbar-hide">
            <Link href="/products" className="text-gray-700 hover:text-blue-600 text-sm font-medium">
              All Products
            </Link>
            {allCategories.slice(0, 8).map((cat) => (
              <Link
                key={cat.name}
                href={cat.href}
                className="text-gray-700 hover:text-blue-600 text-sm font-medium"
              >
                {cat.name}
              </Link>
            ))}
            <Link href="/sale" className="text-red-600 hover:text-red-700 text-sm font-medium">
              🔥 Hot Deals
            </Link>
          </div>

          {/* Mobile Category Row - Simple Icons/Text */}
          <div className="md:hidden py-2">
            <div className="flex items-center justify-around">
              <Link href="/products" className="flex flex-col items-center">
                <span className="text-xs text-gray-600">🛒</span>
                <span className="text-[10px] text-gray-500">Shop</span>
              </Link>
              <Link href="/categories/diagnostic" className="flex flex-col items-center">
                <span className="text-xs text-gray-600">🔬</span>
                <span className="text-[10px] text-gray-500">Diagnostic</span>
              </Link>
              <Link href="/categories/ppe" className="flex flex-col items-center">
                <span className="text-xs text-gray-600">🛡️</span>
                <span className="text-[10px] text-gray-500">PPE</span>
              </Link>
              <Link href="/categories/surgical" className="flex flex-col items-center">
                <span className="text-xs text-gray-600">⚕️</span>
                <span className="text-[10px] text-gray-500">Surgical</span>
              </Link>
              <Link href="/sale" className="flex flex-col items-center">
                <span className="text-xs text-red-500">🔥</span>
                <span className="text-[10px] text-red-500">Deals</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Icons Row - Cart & User (Floating on Desktop, Fixed on Mobile) */}
      {/* Desktop Icons - Top Right */}
      <div className="hidden md:block absolute top-4 right-8">
        <div className="flex items-center gap-3">
          {/* User/Login Icon */}
          <div className="relative" ref={accountRef}>
            <button
              onClick={() => setAccountDropdownOpen(!accountDropdownOpen)}
              className="p-2 rounded-lg hover:bg-gray-100"
            >
              <User size={20} />
            </button>
            {accountDropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border">
                {isAuthenticated ? (
                  <>
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
                    <button onClick={handleLogout} className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50">
                      Logout
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
            className="relative p-2 rounded-lg hover:bg-gray-100"
            aria-label="Shopping cart"
          >
            <ShoppingCart size={20} />
            {cartItemCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] rounded-full min-w-[16px] h-4 flex items-center justify-center px-1">
                {cartItemCount > 99 ? '99+' : cartItemCount}
              </span>
            )}
          </Link>
        </div>
      </div>

      {/* Mobile Bottom Navigation Bar (Cart & User) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 py-2 px-4 z-50">
        <div className="flex justify-around items-center">
          <Link href="/" className="flex flex-col items-center">
            <span className="text-xl">🏠</span>
            <span className="text-[10px] text-gray-500">Home</span>
          </Link>
          <Link href="/products" className="flex flex-col items-center">
            <span className="text-xl">🛍️</span>
            <span className="text-[10px] text-gray-500">Shop</span>
          </Link>
          <Link href="/wishlist" className="flex flex-col items-center">
            <span className="text-xl">❤️</span>
            <span className="text-[10px] text-gray-500">Wishlist</span>
          </Link>
          <Link href="/account" className="flex flex-col items-center">
            <span className="text-xl">👤</span>
            <span className="text-[10px] text-gray-500">Account</span>
          </Link>
          <Link href="/cart" className="relative flex flex-col items-center">
            <span className="text-xl">🛒</span>
            {cartItemCount > 0 && (
              <span className="absolute -top-1 -right-2 bg-red-500 text-white text-[10px] rounded-full min-w-[16px] h-4 flex items-center justify-center px-1">
                {cartItemCount}
              </span>
            )}
            <span className="text-[10px] text-gray-500">Cart</span>
          </Link>
        </div>
      </div>

      {/* MOBILE SIDEBAR MENU */}
      {mobileMenuOpen && (
        <>
          <div className="fixed inset-0 bg-black/50 z-50" onClick={() => setMobileMenuOpen(false)} />
          <div className="fixed left-0 top-0 bottom-0 w-80 bg-white z-50 shadow-xl overflow-y-auto">
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
                      <button onClick={handleLogout} className="text-xs text-red-600">Logout</button>
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

              {/* All Categories in Mobile Menu */}
              <div>
                <h3 className="font-semibold text-gray-800 mb-2 text-sm">All Categories</h3>
                <div className="space-y-1">
                  {allCategories.map((cat) => (
                    <Link
                      key={cat.name}
                      href={cat.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className="block px-2 py-2 text-sm text-gray-600 hover:text-blue-600 rounded-lg"
                    >
                      {cat.name}
                    </Link>
                  ))}
                </div>
              </div>

              {/* Quick Links */}
              <div className="pt-3 border-t">
                <h3 className="font-semibold text-gray-800 mb-2 text-sm">Quick Links</h3>
                <Link href="/" onClick={() => setMobileMenuOpen(false)} className="block px-2 py-2 text-sm text-gray-600 hover:text-blue-600 rounded-lg">
                  Home
                </Link>
                <Link href="/about" onClick={() => setMobileMenuOpen(false)} className="block px-2 py-2 text-sm text-gray-600 hover:text-blue-600 rounded-lg">
                  About Us
                </Link>
                <Link href="/contact" onClick={() => setMobileMenuOpen(false)} className="block px-2 py-2 text-sm text-gray-600 hover:text-blue-600 rounded-lg">
                  Contact
                </Link>
              </div>

              {/* Seller Links */}
              <div className="pt-3 border-t">
                <h3 className="font-semibold text-gray-800 mb-2 text-sm">For Sellers</h3>
                <Link href="/sell" onClick={() => setMobileMenuOpen(false)} className="block px-2 py-2 text-sm text-gray-600 hover:text-blue-600 rounded-lg">
                  Sell on Fittrust
                </Link>
                <Link href="/partner" onClick={() => setMobileMenuOpen(false)} className="block px-2 py-2 text-sm text-gray-600 hover:text-blue-600 rounded-lg">
                  Partner Hub
                </Link>
              </div>

              {/* Support */}
              <div className="pt-3 border-t">
                <h3 className="font-semibold text-gray-800 mb-2 text-sm">Support</h3>
                <Link href="/payment-shipping" onClick={() => setMobileMenuOpen(false)} className="block px-2 py-2 text-sm text-gray-600 hover:text-blue-600 rounded-lg">
                  Payment & Shipping
                </Link>
                <Link href="/faq" onClick={() => setMobileMenuOpen(false)} className="block px-2 py-2 text-sm text-gray-600 hover:text-blue-600 rounded-lg">
                  Help & FAQ
                </Link>
              </div>
            </div>
          </div>
        </>
      )}
    </header>
  );
}