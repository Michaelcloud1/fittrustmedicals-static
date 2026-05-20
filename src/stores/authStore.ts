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
        // Remove this in production!
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
        
        storedUsers.push(newUser);
        localStorage.setItem('fittrust-users', JSON.stringify(storedUsers));
        
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

      // ... (keep all your other existing methods: updateProfile, addAddress, etc.)
      // Make sure to copy all the other methods from your original authStore.ts
      
      updateProfile: (updates) => {
        set((state) => ({
          customer: state.customer
            ? { ...state.customer, ...updates, updatedAt: new Date().toISOString() }
            : null,
        }));
      },

      updatePassword: () => true,

      addAddress: (address) => {
        const newAddress: Address = { ...address, id: 'addr-' + Date.now() };
        set((state) => ({
          customer: state.customer
            ? { ...state.customer, addresses: [...state.customer.addresses, newAddress] }
            : null,
        }));
      },

      updateAddress: (id, updates) => {
        set((state) => ({
          customer: state.customer
            ? {
                ...state.customer,
                addresses: state.customer.addresses.map((addr) =>
                  addr.id === id ? { ...addr, ...updates } : addr
                ),
              }
            : null,
        }));
      },

      deleteAddress: (id) => {
        set((state) => ({
          customer: state.customer
            ? { ...state.customer, addresses: state.customer.addresses.filter((addr) => addr.id !== id) }
            : null,
        }));
      },

      setDefaultAddress: (id) => {
        set((state) => ({
          customer: state.customer
            ? {
                ...state.customer,
                addresses: state.customer.addresses.map((addr) => ({
                  ...addr,
                  isDefault: addr.id === id,
                })),
              }
            : null,
        }));
      },

      addToWishlist: (productId) => {
        set((state) => ({
          customer: state.customer
            ? { ...state.customer, wishlist: [...new Set([...state.customer.wishlist, productId])] }
            : null,
        }));
        get().addNotification({
          title: 'Added to Wishlist',
          message: 'Product has been added to your wishlist',
          type: 'order',
          read: false,
        });
      },

      removeFromWishlist: (productId) => {
        set((state) => ({
          customer: state.customer
            ? { ...state.customer, wishlist: state.customer.wishlist.filter((id) => id !== productId) }
            : null,
        }));
      },

      isInWishlist: (productId) => get().customer?.wishlist.includes(productId) || false,

      addNotification: (notification) => {
        const newNotification: Notification = {
          ...notification,
          id: 'notif-' + Date.now(),
          createdAt: new Date().toISOString(),
        };
        set((state) => ({
          customer: state.customer
            ? { ...state.customer, notifications: [newNotification, ...state.customer.notifications] }
            : null,
        }));
      },

      markNotificationAsRead: (id) => {
        set((state) => ({
          customer: state.customer
            ? {
                ...state.customer,
                notifications: state.customer.notifications.map((notif) =>
                  notif.id === id ? { ...notif, read: true } : notif
                ),
              }
            : null,
        }));
      },

      markAllNotificationsAsRead: () => {
        set((state) => ({
          customer: state.customer
            ? {
                ...state.customer,
                notifications: state.customer.notifications.map((notif) => ({ ...notif, read: true })),
              }
            : null,
        }));
      },

      deleteNotification: (id) => {
        set((state) => ({
          customer: state.customer
            ? { ...state.customer, notifications: state.customer.notifications.filter((n) => n.id !== id) }
            : null,
        }));
      },

      getUnreadCount: () => get().customer?.notifications.filter((n) => !n.read).length || 0,

      addOrder: (order) => {
        const newOrder: Order = {
          ...order,
          id: 'order-' + Date.now(),
          orderNumber: 'FT' + Date.now().toString().slice(-8),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          receiptSent: false,
        };
        
        set((state) => ({ orders: [...state.orders, newOrder] }));
        
        get().addPaymentToWallet(newOrder.total, newOrder.id, order.customerEmail || '');
        get().sendOrderReceipt(newOrder.id, order.customerEmail || '');
        
        get().addNotification({
          title: 'Order Placed',
          message: `Order ${newOrder.orderNumber} has been placed`,
          type: 'order',
          read: false,
        });
      },

      updateOrderStatus: (orderId, status, staffId) => {
        set((state) => ({
          orders: state.orders.map((order) =>
            order.id === orderId
              ? { ...order, status, updatedAt: new Date().toISOString(), staffId: staffId || order.staffId }
              : order
          ),
        }));

        const order = get().getOrderById(orderId);
        if (order && staffId) {
          get().recordStaffSale(staffId, 'Staff Member', order.total);
        }

        const statusMessages: Record<string, string> = {
          processing: 'Your order is being processed',
          shipped: 'Your order has been shipped',
          delivered: 'Your order has been delivered',
        };

        if (statusMessages[status]) {
          get().addNotification({
            title: 'Order Update',
            message: statusMessages[status],
            type: 'shipping',
            read: false,
          });
        }
      },

      getOrderById: (orderId) => get().orders.find((order) => order.id === orderId),

      assignOrderToStaff: (orderId, staffId) => {
        set((state) => ({
          orders: state.orders.map((order) =>
            order.id === orderId ? { ...order, staffId } : order
          ),
        }));
      },

      markReceiptSent: (orderId) => {
        set((state) => ({
          orders: state.orders.map((order) =>
            order.id === orderId ? { ...order, receiptSent: true } : order
          ),
        }));
      },

      recordStaffSale: (staffId, staffName, orderTotal) => {
        set((state) => {
          const existing = state.staffPerformance.find((s) => s.staffId === staffId);
          let updatedPerformance;
          
          if (existing) {
            updatedPerformance = state.staffPerformance.map((s) =>
              s.staffId === staffId
                ? {
                    ...s,
                    ordersProcessed: s.ordersProcessed + 1,
                    totalSales: s.totalSales + orderTotal,
                    lastActive: new Date().toISOString(),
                  }
                : s
            );
          } else {
            updatedPerformance = [
              ...state.staffPerformance,
              {
                staffId,
                staffName,
                ordersProcessed: 1,
                totalSales: orderTotal,
                customersServed: 1,
                lastActive: new Date().toISOString(),
              },
            ];
          }
          
          return { staffPerformance: updatedPerformance };
        });
      },

      getStaffPerformance: () => get().staffPerformance,

      getTopPerformingStaff: (limit = 5) => {
        return [...get().staffPerformance]
          .sort((a, b) => b.totalSales - a.totalSales)
          .slice(0, limit);
      },

      updateInventory: (productId, newStock) => {
        if (newStock <= 5) {
          get().addInventoryAlert({
            productId,
            productName: 'Product ' + productId,
            currentStock: newStock,
            threshold: 5,
          });
        }
      },

      getInventoryAlerts: () => get().inventoryAlerts,

      addInventoryAlert: (alert) => {
        const status = alert.currentStock === 0 ? 'out' : alert.currentStock <= alert.threshold ? 'low' : 'ok';
        set((state) => ({
          inventoryAlerts: [
            ...state.inventoryAlerts.filter((a) => a.productId !== alert.productId),
            { ...alert, status },
          ],
        }));
      },

      getFinancialMetrics: (period) => {
        const now = new Date();
        const orders = get().orders;
        
        let filteredOrders = orders;
        if (period === 'daily') {
          const today = now.toISOString().split('T')[0];
          filteredOrders = orders.filter((o) => o.createdAt.startsWith(today));
        } else if (period === 'weekly') {
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          filteredOrders = orders.filter((o) => new Date(o.createdAt) >= weekAgo);
        } else if (period === 'monthly') {
          const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          filteredOrders = orders.filter((o) => new Date(o.createdAt) >= monthAgo);
        }

        const totalRevenue = filteredOrders.reduce((sum, o) => sum + o.total, 0);
        
        return {
          dailyRevenue: period === 'daily' ? totalRevenue : totalRevenue / 30,
          weeklyRevenue: period === 'weekly' ? totalRevenue : totalRevenue / 4,
          monthlyRevenue: totalRevenue,
          totalOrders: filteredOrders.length,
          averageOrderValue: filteredOrders.length > 0 ? totalRevenue / filteredOrders.length : 0,
          topProducts: [],
          walletBalance: get().wallet.balance,
        };
      },

      getSalesByDateRange: (startDate, endDate) => {
        const orders = get().orders.filter(
          (o) => o.createdAt >= startDate && o.createdAt <= endDate
        );
        return orders.reduce((sum, o) => sum + o.total, 0);
      },

      getRevenueChartData: (days) => {
        const data = [];
        const now = new Date();
        
        for (let i = days - 1; i >= 0; i--) {
          const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
          const dateStr = date.toISOString().split('T')[0];
          
          const dayOrders = get().orders.filter((o) => o.createdAt.startsWith(dateStr));
          const revenue = dayOrders.reduce((sum, o) => sum + o.total, 0);
          
          data.push({
            date: dateStr,
            revenue,
            orders: dayOrders.length,
          });
        }
        
        return data;
      },

      sendOrderReceipt: async (orderId, email) => {
        const order = get().getOrderById(orderId);
        if (!order) return false;
        
        console.log(`Sending receipt for order ${order.orderNumber} to ${email}`);
        get().markReceiptSent(orderId);
        
        get().addNotification({
          title: 'Receipt Sent',
          message: `Receipt for order ${order.orderNumber} has been sent`,
          type: 'order',
          read: false,
        });
        
        return true;
      },

      sendBulkReceipts: async (orderIds) => {
        let sent = 0;
        let failed = 0;
        
        for (const orderId of orderIds) {
          const success = await get().sendOrderReceipt(orderId, '');
          if (success) sent++;
          else failed++;
        }
        
        return { sent, failed };
      },

      addPaymentToWallet: (amount, orderId, customerEmail) => {
        const transaction: WalletTransaction = {
          id: 'txn-' + Date.now(),
          type: 'credit',
          amount,
          description: `Payment for order ${orderId}`,
          orderId,
          customerEmail,
          status: 'completed',
          createdAt: new Date().toISOString(),
          processedAt: new Date().toISOString(),
        };
        
        set((state) => ({
          wallet: {
            ...state.wallet,
            balance: state.wallet.balance + amount,
            totalEarned: state.wallet.totalEarned + amount,
            transactions: [transaction, ...state.wallet.transactions],
          },
        }));
        
        get().addNotification({
          title: 'Payment Received',
          message: `₦${amount.toLocaleString()} received from ${customerEmail}`,
          type: 'payment',
          read: false,
        });
      },

      getWalletBalance: () => get().wallet.balance,

      getWalletTransactions: (limit = 50) => {
        return get().wallet.transactions.slice(0, limit);
      },

      addBankAccount: (account) => {
        const newAccount: BankAccount = {
          ...account,
          id: 'bank-' + Date.now(),
        };
        
        set((state) => ({
          wallet: {
            ...state.wallet,
            bankAccounts: [...state.wallet.bankAccounts, newAccount],
          },
        }));
      },

      removeBankAccount: (id) => {
        set((state) => ({
          wallet: {
            ...state.wallet,
            bankAccounts: state.wallet.bankAccounts.filter((a) => a.id !== id),
          },
        }));
      },

      setDefaultBankAccount: (id) => {
        set((state) => ({
          wallet: {
            ...state.wallet,
            bankAccounts: state.wallet.bankAccounts.map((a) => ({
              ...a,
              isDefault: a.id === id,
            })),
          },
        }));
      },

      requestWithdrawal: (amount, bankAccountId) => {
        const state = get();
        if (amount > state.wallet.balance) {
          return false;
        }
        
        const withdrawal: WithdrawalRequest = {
          id: 'wdr-' + Date.now(),
          amount,
          bankAccountId,
          status: 'pending',
          requestedAt: new Date().toISOString(),
        };
        
        set((state) => ({
          wallet: {
            ...state.wallet,
            balance: state.wallet.balance - amount,
            pendingWithdrawals: state.wallet.pendingWithdrawals + amount,
            withdrawalRequests: [withdrawal, ...state.wallet.withdrawalRequests],
          },
        }));
        
        return true;
      },

      processWithdrawal: (withdrawalId, approve, reason) => {
        set((state) => {
          const withdrawal = state.wallet.withdrawalRequests.find((w) => w.id === withdrawalId);
          if (!withdrawal) return state;
          
          const updatedRequests = state.wallet.withdrawalRequests.map((w) =>
            w.id === withdrawalId
              ? {
                  ...w,
                  status: approve ? 'completed' : 'rejected',
                  processedAt: new Date().toISOString(),
                  rejectionReason: approve ? undefined : reason,
                }
              : w
          );
          
          return {
            wallet: {
              ...state.wallet,
              pendingWithdrawals: approve 
                ? state.wallet.pendingWithdrawals - withdrawal.amount
                : state.wallet.pendingWithdrawals,
              totalWithdrawn: approve
                ? state.wallet.totalWithdrawn + withdrawal.amount
                : state.wallet.totalWithdrawn,
              balance: approve
                ? state.wallet.balance
                : state.wallet.balance + withdrawal.amount,
              withdrawalRequests: updatedRequests,
            },
          };
        });
      },

      getPendingWithdrawals: () => {
        return get().wallet.withdrawalRequests.filter((w) => w.status === 'pending');
      },

      getWithdrawalHistory: () => {
        return get().wallet.withdrawalRequests.filter((w) => w.status !== 'pending');
      },
    }),
    {
      name: 'fittrust-auth',
      onRehydrateStorage: () => (state) => {
        state?.setHydrated(true);
      },
    }
  )
);