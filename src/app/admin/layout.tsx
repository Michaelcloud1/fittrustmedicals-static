'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, 
  Package, 
  PlusCircle, 
  ShoppingCart, 
  Users, 
  Image as ImageIcon, 
  Settings,
  Store,
  LogOut,
  TrendingUp,
  Megaphone,
  ChevronRight,
  Bell,
  UserCog,
  BarChart3,
  Receipt,
  AlertTriangle,
  Wallet,
  Menu,
  X,
  ChevronDown
} from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';

const sidebarItems = [
  { href: '/admin', icon: LayoutDashboard, label: 'Dashboard', color: 'blue' },
  { href: '/admin/products', icon: Package, label: 'Products', color: 'indigo' },
  { href: '/admin/products/add', icon: PlusCircle, label: 'Add Product', color: 'green' },
  { href: '/admin/orders', icon: ShoppingCart, label: 'Orders', color: 'orange' },
  { href: '/admin/customers', icon: Users, label: 'Customers', color: 'purple' },
  { href: '/admin/users', icon: UserCog, label: 'Users', color: 'red' },
  { href: '/admin/staff-performance', icon: BarChart3, label: 'Staff Performance', color: 'cyan' },
  { href: '/admin/inventory', icon: AlertTriangle, label: 'Inventory', color: 'yellow' },
  { href: '/admin/finance', icon: TrendingUp, label: 'Financials', color: 'emerald' },
  { href: '/admin/wallet', icon: Wallet, label: 'Wallet & Payments', color: 'emerald' },
  { href: '/admin/receipts', icon: Receipt, label: 'Receipts', color: 'pink' },
  { href: '/admin/promotions', icon: Megaphone, label: 'Promotions', color: 'pink' },
  { href: '/admin/analytics', icon: BarChart3, label: 'Analytics', color: 'cyan' },
  { href: '/admin/media', icon: ImageIcon, label: 'Media Library', color: 'teal' },
  { href: '/admin/settings', icon: Settings, label: 'Settings', color: 'gray' },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [isClient, setIsClient] = useState(false);
  
  const { 
    isAuthenticated, 
    isAdmin, 
    logout, 
    _hasHydrated, 
    wallet,
    customer
  } = useAuthStore();

  // Safe fallbacks for functions that don't exist
  const getInventoryAlerts = () => [];
  const getUnreadCount = () => 0;

  const inventoryAlertCount = getInventoryAlerts().filter((a: any) => a.status === 'low' || a.status === 'out').length;
  const unreadCount = getUnreadCount();

  // Get logged-in user's name and email
  const userName = customer?.name || customer?.firstName || 'Administrator';
  const userEmail = customer?.email || 'admin@fittrust.com';
  const userInitial = userName.charAt(0).toUpperCase();

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    const checkMobile = () => {
      if (window.innerWidth >= 1024) {
        setMobileMenuOpen(false);
      }
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (isClient && _hasHydrated && (!isAuthenticated || !isAdmin)) {
      router.push('/login?redirect=/admin');
    }
  }, [isAuthenticated, isAdmin, _hasHydrated, router, isClient]);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  const handleLogout = () => {
    logout();
    router.push('/');
    setMobileMenuOpen(false);
    setUserDropdownOpen(false);
  };

  if (!isClient || !_hasHydrated || !isAuthenticated || !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const SidebarContent = () => (
    <>
      <div className="p-4 sm:p-6 bg-gradient-to-br from-blue-600 to-blue-800 text-white">
        <div className="flex items-center space-x-3">
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="bg-white/20 p-2 rounded-xl backdrop-blur-sm"
          >
            <LayoutDashboard className="w-5 h-5 sm:w-7 sm:h-7" />
          </motion.div>
          <div>
            <h2 className="font-bold text-base sm:text-xl">Fittrustmedicals</h2>
            <p className="text-[10px] sm:text-xs text-blue-200 font-medium">Admin Console</p>
          </div>
        </div>
      </div>
      
      <nav className="flex-1 overflow-y-auto py-4 sm:py-6 px-2 sm:px-4 space-y-1">
        {sidebarItems.map((item, index) => {
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;
          
          return (
            <motion.div
              key={item.href}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Link 
                href={item.href}
                className={`flex items-center justify-between px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl transition-all duration-200 group ${
                  isActive 
                    ? `bg-${item.color}-50 text-${item.color}-600 shadow-sm` 
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <div className="flex items-center space-x-2 sm:space-x-3">
                  <Icon className={`w-4 h-4 sm:w-5 sm:h-5 transition-transform group-hover:scale-110 ${isActive ? 'scale-110' : ''}`} />
                  <span className="font-medium text-sm sm:text-base">{item.label}</span>
                </div>
                {item.label === 'Inventory' && inventoryAlertCount > 0 && (
                  <span className="bg-red-500 text-white text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 rounded-full">
                    {inventoryAlertCount}
                  </span>
                )}
                {item.label === 'Wallet & Payments' && wallet?.pendingWithdrawals > 0 && (
                  <span className="bg-yellow-500 text-white text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 rounded-full">
                    Pending
                  </span>
                )}
                {isActive && (
                  <motion.div
                    layoutId="activeIndicator"
                    className={`w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-${item.color}-500`}
                  />
                )}
              </Link>
            </motion.div>
          );
        })}
      </nav>

      <div className="p-3 sm:p-4 border-t border-gray-100 space-y-1 sm:space-y-2">
        <Link 
          href="/"
          className="flex items-center space-x-2 sm:space-x-3 px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl text-blue-600 hover:bg-blue-50 transition-colors"
        >
          <Store className="w-4 h-4 sm:w-5 sm:h-5" />
          <span className="font-medium text-sm sm:text-base">View Store</span>
          <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4 ml-auto" />
        </Link>
        
        <button 
          onClick={handleLogout}
          className="w-full flex items-center space-x-2 sm:space-x-3 px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl text-red-600 hover:bg-red-50 transition-colors"
        >
          <LogOut className="w-4 h-4 sm:w-5 sm:h-5" />
          <span className="font-medium text-sm sm:text-base">Logout</span>
        </button>
      </div>
    </>
  );

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex lg:w-64 xl:w-72 bg-white shadow-xl flex-col z-20 transition-all duration-300">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'tween', duration: 0.3 }}
              className="fixed left-0 top-0 bottom-0 w-72 bg-white shadow-xl flex flex-col z-50 lg:hidden"
            >
              <div className="p-4 border-b border-gray-100 flex justify-end">
                <button 
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <X className="w-5 h-5 text-gray-600" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto">
                <SidebarContent />
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content - ADMIN ONLY HEADER */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* ADMIN HEADER */}
        <header className="bg-white shadow-sm px-4 sm:px-6 lg:px-8 py-3 sm:py-4 flex justify-between items-center sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <Menu className="w-5 h-5 text-gray-600" />
            </button>
            
            <div className="hidden lg:block">
              <h1 className="text-xl sm:text-2xl font-bold text-gray-800">
                {sidebarItems.find(item => pathname === item.href || pathname.startsWith(`${item.href}/`))?.label || 'Dashboard'}
              </h1>
              <p className="text-xs sm:text-sm text-gray-500 mt-0.5 sm:mt-1">
                {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 sm:gap-4">
            <div className="lg:hidden text-right">
              <h1 className="text-sm font-semibold text-gray-800">
                {sidebarItems.find(item => pathname === item.href || pathname.startsWith(`${item.href}/`))?.label || 'Dashboard'}
              </h1>
              <p className="text-[10px] text-gray-500">
                {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </p>
            </div>

            {/* Wallet Balance */}
            <Link 
              href="/admin/wallet"
              className="hidden xs:flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-1.5 sm:py-2 bg-emerald-50 text-emerald-700 rounded-lg hover:bg-emerald-100 transition-colors"
            >
              <Wallet className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="font-medium text-xs sm:text-sm">₦{(wallet?.balance || 0).toLocaleString()}</span>
            </Link>
            
            {/* Bell Icon */}
            <button className="relative p-2 text-gray-600 hover:text-gray-800 transition-colors">
              <Bell className="w-5 h-5 sm:w-6 sm:h-6" />
              {unreadCount > 0 && (
                <span className="absolute top-0 right-0 w-4 h-4 sm:w-5 sm:h-5 bg-red-500 text-white text-[10px] sm:text-xs rounded-full flex items-center justify-center animate-pulse">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>
            
            {/* Admin User Dropdown */}
            <div className="relative">
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center gap-2 sm:gap-3 pl-2 sm:pl-6 border-l border-gray-200"
              >
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold shadow-lg text-sm sm:text-base">
                  {userInitial}
                </div>
                <div className="hidden sm:block text-left">
                  <p className="font-medium text-gray-800 text-sm">{userName}</p>
                  <p className="text-xs text-gray-500">{userEmail}</p>
                </div>
                <ChevronDown size={16} className="text-gray-400 hidden sm:block" />
              </button>

              {/* User Dropdown Menu */}
              {userDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border py-1 z-50">
                  <div className="px-4 py-2 border-b">
                    <p className="text-sm font-semibold text-gray-800">{userName}</p>
                    <p className="text-xs text-gray-500">{userEmail}</p>
                  </div>
                  <Link href="/admin/profile" onClick={() => setUserDropdownOpen(false)} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                    Profile Settings
                  </Link>
                  <hr className="my-1" />
                  <button onClick={handleLogout} className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50">
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-4 md:p-6 lg:p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={pathname}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}