import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// ... (keep all your existing interfaces: Address, Notification, CustomerProfile, Order, etc.)

interface AuthStore {
  isAuthenticated: boolean;
  isAdmin: boolean;
  isStaff: boolean;
  customer: CustomerProfile | null;
  orders: Order[];
  staffPerformance: StaffPerformance[];
  inventoryAlerts: InventoryAlert[];
  wallet: Wallet;
  _hasHydrated: boolean;
  
  // Auth actions
  login: (email: string, password: string) => Promise<boolean>;
  register: (data: any) => Promise<boolean>;
  logout: () => void;
  
  // ... (keep all your other method signatures)
  
  setHydrated: (hydrated: boolean) => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      isAuthenticated: false,
      isAdmin: false,
      isStaff: false,
      customer: null,
      orders: [],
      staffPerformance: [],
      inventoryAlerts: [],
      wallet: {
        balance: 0,
        totalEarned: 0,
        totalWithdrawn: 0,
        pendingWithdrawals: 0,
        transactions: [],
        bankAccounts: [],
        withdrawalRequests: [],
      },
      _hasHydrated: false,

      setHydrated: (hydrated) => set({ _hasHydrated: hydrated }),

      login: async (email, password) => {
        // STEP 1: FIRST check localStorage for registered users
        const storedUsers = JSON.parse(localStorage.getItem('fittrust-users') || '[]');
        const matchedUser = storedUsers.find((u: any) => u.email === email && u.password === password);
        
        if (matchedUser) {
          console.log('✅ User found in localStorage:', matchedUser);
          
          const userRole = matchedUser.role?.toLowerCase() || 'customer';
          const isAdmin = userRole === 'admin';
          const isStaff = userRole === 'staff';
          
          const customerProfile: CustomerProfile = {
            id: matchedUser.id,
            name: matchedUser.name || matchedUser.fullName || email.split('@')[0],
            email: email,
            phone: matchedUser.phone || '',
            role: userRole,
            addresses: [],
            wishlist: [],
            notifications: [],
            createdAt: matchedUser.createdAt || new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          
          set({
            isAuthenticated: true,
            isAdmin: isAdmin,
            isStaff: isStaff,
            customer: customerProfile,
          });
          
          console.log('Login successful. Role:', userRole, 'isAdmin:', isAdmin, 'isStaff:', isStaff);
          return true;
        }
        
        // STEP 2: If not in localStorage, try backend API
        const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://fittrustmedicals-backend.onrender.com';
        
        try {
          const response = await fetch(`${BACKEND_URL}/api/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
          });

          if (response.ok) {
            const data = await response.json();
            const userRole = data.user?.role || data.role || 'CUSTOMER';
            const isAdmin = userRole.toLowerCase() === 'admin';
            const isStaff = userRole.toLowerCase() === 'staff';
            
            const customerProfile: CustomerProfile = {
              id: data.user?.id || 'user-' + Date.now(),
              name: data.user?.name || data.user?.fullName || email.split('@')[0],
              email: email,
              phone: data.user?.phone || '',
              role: userRole.toLowerCase(),
              addresses: [],
              wishlist: [],
              notifications: [],
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            };
            
            set({
              isAuthenticated: true,
              isAdmin: isAdmin,
              isStaff: isStaff,
              customer: customerProfile,
            });
            
            console.log('Backend login successful. Role:', userRole);
            return true;
          }
        } catch (error) {
          console.error('Backend login error:', error);
        }
        
        // STEP 3: ONLY use hardcoded credentials as LAST RESORT (for testing only)
        if (email === 'admin@fittrust.com' && password === 'admin123') {
          const adminProfile: CustomerProfile = {
            id: 'admin-1',
            name: 'Super Admin',
            email: email,
            phone: '+234 800 123 4567',
            role: 'admin',
            addresses: [],
            wishlist: [],
            notifications: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          
          set({
            isAuthenticated: true,
            isAdmin: true,
            isStaff: false,
            customer: adminProfile,
          });
          return true;
        }
        
        if (email === 'staff@fittrust.com' && password === 'staff123') {
          const staffProfile: CustomerProfile = {
            id: 'staff-1',
            name: 'Staff Member',
            email: email,
            phone: '+234 800 123 4568',
            role: 'staff',
            addresses: [],
            wishlist: [],
            notifications: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          
          set({
            isAuthenticated: true,
            isAdmin: false,
            isStaff: true,
            customer: staffProfile,
          });
          return true;
        }
        
        console.log('Login failed: No matching user found');
        return false;
      },

      register: async (data) => {
        const storedUsers = JSON.parse(localStorage.getItem('fittrust-users') || '[]');
        
        // Check if email already exists
        if (storedUsers.some((u: any) => u.email === data.email)) {
          console.log('User already exists');
          return false;
        }
        
        const userRole = data.role?.toLowerCase() || 'customer';
        
        const newUser = {
          id: 'user-' + Date.now(),
          name: data.fullName || data.name || data.email.split('@')[0],
          fullName: data.fullName || data.name,
          email: data.email,
          password: data.password,
          phone: data.phone || '',
          role: userRole,
          status: 'active',
          createdAt: new Date().toISOString(),
        };
        
        // Save to fittrust-users
        storedUsers.push(newUser);
        localStorage.setItem('fittrust-users', JSON.stringify(storedUsers));
        
        // ALSO save to registered-users for backup
        const registeredUsers = JSON.parse(localStorage.getItem('registered-users') || '[]');
        registeredUsers.push(newUser);
        localStorage.setItem('registered-users', JSON.stringify(registeredUsers));
        
        // ALSO save to admin-created-users
        const adminUsers = JSON.parse(localStorage.getItem('admin-created-users') || '[]');
        adminUsers.push(newUser);
        localStorage.setItem('admin-created-users', JSON.stringify(adminUsers));
        
        const isAdmin = userRole === 'admin';
        const isStaff = userRole === 'staff';
        
        const customerProfile: CustomerProfile = {
          id: newUser.id,
          name: newUser.name,
          email: data.email,
          phone: data.phone || '',
          role: userRole,
          addresses: [],
          wishlist: [],
          notifications: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        
        set({
          isAuthenticated: true,
          isAdmin: isAdmin,
          isStaff: isStaff,
          customer: customerProfile,
        });
        
        console.log('Registration successful. Role:', userRole);
        return true;
      },

      logout: () => {
        set({ 
          isAuthenticated: false, 
          isAdmin: false, 
          isStaff: false, 
          customer: null,
          orders: [],
          staffPerformance: [],
        });
      },

      // ... (keep all your other existing methods unchanged)
      // updateProfile, addAddress, updateAddress, deleteAddress, setDefaultAddress,
      // addToWishlist, removeFromWishlist, isInWishlist, addNotification,
      // markNotificationAsRead, markAllNotificationsAsRead, deleteNotification,
      // getUnreadCount, addOrder, updateOrderStatus, getOrderById, assignOrderToStaff,
      // markReceiptSent, recordStaffSale, getStaffPerformance, getTopPerformingStaff,
      // updateInventory, getInventoryAlerts, addInventoryAlert, getFinancialMetrics,
      // getSalesByDateRange, getRevenueChartData, sendOrderReceipt, sendBulkReceipts,
      // addPaymentToWallet, getWalletBalance, getWalletTransactions, addBankAccount,
      // removeBankAccount, setDefaultBankAccount, requestWithdrawal, processWithdrawal,
      // getPendingWithdrawals, getWithdrawalHistory
      
      // ... (rest of your existing methods remain exactly the same)
    }),
    {
      name: 'fittrust-auth',
      onRehydrateStorage: () => (state) => {
        state?.setHydrated(true);
      },
    }
  )
);