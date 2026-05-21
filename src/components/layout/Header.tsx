'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
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

  // Common Logo Component to avoid duplication
  const Logo = () => (
    <Link href="/" className="flex items-center gap-2">
      <div className="relative w-8 h-8 md:w-10 md:h-10">
        <Image
          src="/images/logo.png"
          alt="Fittrust Medicals"
          fill
          className="object-contain"
          priority
        />
      </div>
      <div>
        <div className="text-sm md:text-lg font-bold text-blue-600 whitespace-nowrap">FITTRUST MEDICALS</div>
        <div className="text-[9px] md:text-xs text-gray-500 whitespace-nowrap">Healthcare Supplies</div>
      </div>
    </Link>
  );

  return (
    <header className="sticky top-0 z-50 bg-white shadow-sm w-full">
      <div className="border-b border-gray-100 bg-white">
        <div className="container mx-auto px-4 py-3">
          {/* SINGLE HEADER - responsive design without duplication */}
          <div className="flex items-center justify-between gap-4">
            {/* Logo - ONE TIME ONLY */}
            <Logo />

            {/* Search Bar - Desktop only */}
            <form onSubmit={handleSearch} className="hidden md:block flex-1 max-w-xl">
              <div className="relative">
                <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search products, brands and more..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full py-2.5 pl-11 pr-4 rounded-full border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-gray-50"
                />
              </div>
            </form>

            {/* Right Icons */}
            <div className="flex items-center gap-2">
              {/* Account Icon */}
              <div className="relative" ref={accountRef}>
                <button
                  onClick={() => setAccountDropdownOpen(!accountDropdownOpen)}
                  className="flex items-center gap-1 px-2 py-2 text-sm font-medium text-gray-700 hover:text-blue-600"
                >
                  <User size={18} />
                  <span className="hidden lg:inline">
                    {isAuthenticated && customer?.name ? customer.name.split(' ')[0] : 'Sign In'}
                  </span>
                  <ChevronDown size={14} className="hidden lg:block" />
                </button>
              </div>

              {/* Cart Icon */}
              <Link href="/cart" className="relative p-2">
                <ShoppingCart size={20} />
                {cartItemCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] rounded-full min-w-[16px] h-4 flex items-center justify-center px-1">
                    {cartItemCount > 99 ? '99+' : cartItemCount}
                  </span>
                )}
              </Link>

              {/* Mobile Menu Button */}
              <button onClick={() => setMobileMenuOpen(true)} className="md:hidden p-2">
                <Menu size={20} />
              </button>
            </div>
          </div>

          {/* Search Bar - Mobile only (below the header) */}
          <div className="md:hidden mt-3">
            <form onSubmit={handleSearch} className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
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

      {/* MOBILE ACCOUNT DROPDOWN */}
      {accountDropdownOpen && (
        <div className="md:hidden bg-white border-b shadow-lg">
          <div className="container mx-auto px-4 py-3">
            {isAuthenticated ? (
              <div className="space-y-2">
                <div className="pb-2 border-b">
                  <p className="font-semibold text-gray-800">{customer?.name || 'User'}</p>
                  <p className="text-xs text-gray-500">{customer?.email}</p>
                </div>
                <Link href="/account" onClick={() => setAccountDropdownOpen(false)} className="block py-2 text-sm text-gray-700">
                  My Account
                </Link>
                <Link href="/orders" onClick={() => setAccountDropdownOpen(false)} className="block py-2 text-sm text-gray-700">
                  My Orders
                </Link>
                <Link href="/wishlist" onClick={() => setAccountDropdownOpen(false)} className="block py-2 text-sm text-gray-700">
                  Wishlist
                </Link>
                <button onClick={handleLogout} className="block w-full text-left py-2 text-sm text-red-600">
                  Logout
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <Link href="/login" onClick={() => setAccountDropdownOpen(false)} className="block py-2 text-sm text-gray-700">
                  Sign In
                </Link>
                <Link href="/register" onClick={() => setAccountDropdownOpen(false)} className="block py-2 text-sm text-gray-700">
                  Create Account
                </Link>
              </div>
            )}
          </div>
        </div>
      )}

      {/* MOBILE SIDEBAR MENU */}
      {mobileMenuOpen && (
        <>
          <div className="fixed inset-0 bg-black/50 z-[100]" onClick={() => setMobileMenuOpen(false)} />
          <div className="fixed left-0 top-0 bottom-0 w-80 bg-white z-[101] shadow-xl overflow-y-auto">
            <div className="sticky top-0 bg-white border-b p-4 flex justify-between items-center">
              <span className="font-bold text-blue-600">Menu</span>
              <button onClick={() => setMobileMenuOpen(false)} className="p-2">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-4 space-y-4">
              {isAuthenticated && (
                <div className="pb-3 border-b">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <div className="font-semibold">{customer?.name}</div>
                      <div className="text-xs text-gray-500">{customer?.email}</div>
                    </div>
                  </div>
                </div>
              )}

              <div>
                <h3 className="font-semibold text-gray-800 mb-2">Categories</h3>
                <div className="space-y-1 pl-2">
                  {allCategories.map((cat) => (
                    <Link
                      key={cat.name}
                      href={cat.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className="block py-2 text-sm text-gray-600 hover:text-blue-600"
                    >
                      {cat.name}
                    </Link>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t">
                <h3 className="font-semibold text-gray-800 mb-2">Quick Links</h3>
                <div className="space-y-1 pl-2">
                  <Link href="/products" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-sm text-gray-600 hover:text-blue-600">
                    All Products
                  </Link>
                  <Link href="/sale" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-sm text-red-600 hover:text-red-700">
                    Hot Deals
                  </Link>
                  <Link href="/contact" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-sm text-gray-600 hover:text-blue-600">
                    Contact Us
                  </Link>
                </div>
              </div>

              {isAuthenticated && (
                <button onClick={handleLogout} className="w-full mt-4 py-2 text-center text-red-600 border-t pt-4">
                  Logout
                </button>
              )}
            </div>
          </div>
        </>
      )}
    </header>
  );
}