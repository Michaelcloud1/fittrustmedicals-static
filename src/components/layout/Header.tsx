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
  Menu,
  X,
  ChevronDown
} from 'lucide-react';

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
  const [mobileCategoriesOpen, setMobileCategoriesOpen] = useState(false);

  const accountRef = useRef<HTMLDivElement>(null);
  const dropdownTimeoutRef = useRef<NodeJS.Timeout | null>(null);

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

  // Mouse enter handlers for hover functionality
  const handleMouseEnter = () => {
    if (dropdownTimeoutRef.current) {
      clearTimeout(dropdownTimeoutRef.current);
    }
    setAccountDropdownOpen(true);
  };

  const handleMouseLeave = () => {
    dropdownTimeoutRef.current = setTimeout(() => {
      setAccountDropdownOpen(false);
    }, 200);
  };

  return (
    <header className="sticky top-0 z-50 bg-white shadow-sm w-full">
      {/* Top Bar - Logo and Icons */}
      <div className="border-b border-gray-100 bg-white">
        <div className="container mx-auto px-4 py-3">
          {/* DESKTOP: Logo + Search + Icons in one row */}
          <div className="hidden md:flex items-center justify-between gap-4">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3 flex-shrink-0">
              <div className="relative w-10 h-10 md:w-12 md:h-12">
                <Image
                  src="/images/logo.png"
                  alt="Fittrust Medicals"
                  fill
                  className="object-contain"
                  priority
                />
              </div>
              <div className="flex flex-col">
                <span className="text-lg md:text-xl font-bold text-blue-600">
                  FITTRUST MEDICALS
                </span>
                <span className="text-[10px] md:text-xs text-gray-500">
                  Healthcare Supplies
                </span>
              </div>
            </Link>

            {/* Search Bar - Desktop (in the middle with flex-1) */}
            <div className="flex-1 max-w-xl mx-4">
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
                  className="w-full py-2.5 pl-10 pr-4 rounded-full border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm bg-gray-50"
                />
              </form>
            </div>

            {/* Icons - Cart & User */}
            <div className="flex items-center gap-2 flex-shrink-0">
              {/* User/Login Dropdown */}
              <div 
                className="relative" 
                ref={accountRef}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
              >
                <button
                  onClick={() => setAccountDropdownOpen(!accountDropdownOpen)}
                  className="p-2 rounded-lg hover:bg-gray-100"
                >
                  <User size={20} />
                </button>
                {accountDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 border border-gray-100 z-[9999]">
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

          {/* MOBILE: Logo + Icons row, Search below */}
          <div className="md:hidden">
            <div className="flex items-center justify-between">
              <Link href="/" className="flex items-center gap-3">
                <div className="relative w-8 h-8">
                  <Image
                    src="/images/logo.png"
                    alt="Fittrust Medicals"
                    fill
                    className="object-contain"
                  />
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-blue-600">
                    FITTRUST MEDICALS
                  </span>
                  <span className="text-[8px] text-gray-500">
                    Healthcare Supplies
                  </span>
                </div>
              </Link>

              <div className="flex items-center gap-1">
                <div 
                  className="relative" 
                  ref={accountRef}
                >
                  <button
                    onClick={() => setAccountDropdownOpen(!accountDropdownOpen)}
                    className="p-2 rounded-lg hover:bg-gray-100"
                  >
                    <User size={18} />
                  </button>
                </div>

                <Link href="/cart" className="relative p-2">
                  <ShoppingCart size={18} />
                  {cartItemCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[9px] rounded-full min-w-[14px] h-3.5 flex items-center justify-center px-0.5">
                      {cartItemCount > 99 ? '99+' : cartItemCount}
                    </span>
                  )}
                </Link>

                <button
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="p-2 rounded-lg hover:bg-gray-100"
                >
                  <Menu size={20} />
                </button>
              </div>
            </div>

            {/* Search Bar - Mobile (BELOW logo row - NO OVERLAP) */}
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

              {/* Categories dropdown for mobile */}
              <div>
                <button
                  onClick={() => setMobileCategoriesOpen(!mobileCategoriesOpen)}
                  className="flex items-center justify-between w-full py-2 text-gray-800 font-semibold"
                >
                  Categories
                  <ChevronDown size={16} className={`transition-transform ${mobileCategoriesOpen ? 'rotate-180' : ''}`} />
                </button>
                {mobileCategoriesOpen && (
                  <div className="mt-2 space-y-1 pl-4 border-l-2 border-blue-200">
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
                )}
              </div>

              {/* Quick Links */}
              <div className="pt-3 border-t">
                <h3 className="font-semibold text-gray-800 mb-2 text-sm">Quick Links</h3>
                <Link href="/products" onClick={() => setMobileMenuOpen(false)} className="block px-2 py-2 text-sm text-gray-600 hover:text-blue-600 rounded-lg">
                  All Products
                </Link>
                <Link href="/sale" onClick={() => setMobileMenuOpen(false)} className="block px-2 py-2 text-sm text-red-600 hover:text-red-700 rounded-lg">
                  Hot Deals
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