'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuthStore } from '@/stores/authStore';
import { 
  ArrowLeft,
  Package,
  Truck,
  CheckCircle,
  Clock,
  MapPin,
  CreditCard
} from 'lucide-react';

interface OrderItem {
  name: string;
  quantity: number;
  price: number;
  image?: string;
}

interface Order {
  id: string;
  orderNumber: string;
  total: number;
  status: string;
  createdAt: string;
  items: OrderItem[];
  shippingAddress?: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  trackingNumber?: string;
  user?: {
    email: string;
  };
  customerEmail?: string;
}

export default function OrderTrackingPage() {
  const params = useParams();
  const router = useRouter();
  const { customer, getOrderById, orders } = useAuthStore();
  const [order, setOrder] = useState<Order | null>(null);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get the order by ID
    const foundOrder = getOrderById(params.id as string);
    
    if (!foundOrder) {
      setOrder(null);
      setLoading(false);
      return;
    }

    // CRITICAL SECURITY CHECK: Verify this order belongs to the logged-in customer
    const orderCustomerEmail = foundOrder.user?.email || foundOrder.customerEmail;
    const currentCustomerEmail = customer?.email;

    if (currentCustomerEmail && orderCustomerEmail === currentCustomerEmail) {
      setOrder(foundOrder);
      setIsAuthorized(true);
    } else {
      // Order doesn't belong to this customer
      setIsAuthorized(false);
      setOrder(null);
    }
    
    setLoading(false);
  }, [params.id, getOrderById, customer]);

  // Redirect unauthorized users
  if (!loading && !isAuthorized) {
    return (
      <div className="text-center py-12">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
          <p className="text-red-600 font-semibold mb-2">Access Denied</p>
          <p className="text-gray-600 mb-4">
            You don't have permission to view this order.
          </p>
          <Link href="/account/orders" className="text-blue-600 hover:underline">
            Back to My Orders
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Order not found</p>
        <Link href="/account/orders" className="text-blue-600 hover:underline mt-2 inline-block">
          Back to Orders
        </Link>
      </div>
    );
  }

  const trackingSteps = [
    { status: 'pending', label: 'Order Placed', icon: Clock },
    { status: 'payment_pending', label: 'Payment Pending', icon: CreditCard },
    { status: 'processing', label: 'Processing', icon: Package },
    { status: 'shipped', label: 'Shipped', icon: Truck },
    { status: 'delivered', label: 'Delivered', icon: CheckCircle },
  ];

  // Find current step index based on order status
  let currentStepIndex = trackingSteps.findIndex(step => step.status === order.status);
  // If status is 'paid', treat as 'processing'
  if (order.status === 'paid') {
    currentStepIndex = trackingSteps.findIndex(step => step.status === 'processing');
  }
  // If status is 'cancelled', show all steps up to cancelled
  if (order.status === 'cancelled') {
    currentStepIndex = trackingSteps.length;
  }

  const getStatusDisplay = (status: string) => {
    switch (status) {
      case 'delivered': return 'Delivered';
      case 'shipped': return 'Shipped';
      case 'processing': return 'Processing';
      case 'paid': return 'Paid';
      case 'cancelled': return 'Cancelled';
      case 'pending': return 'Pending';
      default: return status?.replace('_', ' ') || 'Pending';
    }
  };

  return (
    <div className="space-y-6">
      <Link href="/account/orders" className="inline-flex items-center text-gray-600 hover:text-gray-900">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Orders
      </Link>

      <div>
        <h1 className="text-2xl font-bold text-gray-900">Order #{order.orderNumber}</h1>
        <p className="text-gray-500 mt-1">Placed on {new Date(order.createdAt).toLocaleDateString()}</p>
        {order.status === 'cancelled' && (
          <span className="inline-block mt-2 px-3 py-1 bg-red-100 text-red-700 text-sm rounded-full">
            Order Cancelled
          </span>
        )}
      </div>

      {/* Tracking Timeline - Only show if not cancelled */}
      {order.status !== 'cancelled' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Order Status</h2>
          <div className="relative">
            <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200"></div>
            <div className="space-y-8">
              {trackingSteps.map((step, index) => {
                const Icon = step.icon;
                const isCompleted = index <= currentStepIndex;
                const isCurrent = index === currentStepIndex;

                return (
                  <div key={step.status} className="relative flex items-start">
                    <div className={`absolute left-0 w-8 h-8 rounded-full flex items-center justify-center z-10 ${
                      isCompleted ? 'bg-blue-600' : 'bg-gray-200'
                    }`}>
                      <Icon className={`w-4 h-4 ${isCompleted ? 'text-white' : 'text-gray-500'}`} />
                    </div>
                    <div className="ml-12">
                      <p className={`font-medium ${isCompleted ? 'text-gray-900' : 'text-gray-500'}`}>
                        {step.label}
                      </p>
                      {isCurrent && (
                        <p className="text-sm text-blue-600 mt-1">
                          {order.status === 'paid' ? 'Payment confirmed, processing your order' : 'Current Status'}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Cancelled Order Message */}
      {order.status === 'cancelled' && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
              <XCircle className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <h3 className="font-semibold text-red-800">Order Cancelled</h3>
              <p className="text-red-600 text-sm">This order has been cancelled. Contact support for more information.</p>
            </div>
          </div>
        </div>
      )}

      {/* Order Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Items</h2>
          <div className="space-y-4">
            {order.items?.map((item, index) => (
              <div key={index} className="flex justify-between items-center">
                <div>
                  <p className="font-medium text-gray-900">{item.name}</p>
                  <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                </div>
                <p className="font-medium text-gray-900">₦{((item.quantity || 0) * (item.price || 0)).toLocaleString()}</p>
              </div>
            ))}
            <div className="border-t pt-4 mt-4">
              <div className="flex justify-between items-center text-lg font-bold">
                <span>Total</span>
                <span>₦{(order.total || 0).toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Shipping Details</h2>
          <div className="space-y-4">
            {order.shippingAddress ? (
              <div className="flex items-start space-x-3">
                <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="font-medium text-gray-900">Delivery Address</p>
                  <p className="text-sm text-gray-600 mt-1">
                    {order.shippingAddress.street}<br />
                    {order.shippingAddress.city}, {order.shippingAddress.state}<br />
                    {order.shippingAddress.zipCode}, {order.shippingAddress.country}
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex items-start space-x-3">
                <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="font-medium text-gray-900">Delivery Address</p>
                  <p className="text-sm text-gray-600 mt-1">No address information available</p>
                </div>
              </div>
            )}
            {order.trackingNumber && (
              <div className="flex items-start space-x-3">
                <Truck className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="font-medium text-gray-900">Tracking Number</p>
                  <p className="text-sm text-gray-600 mt-1 font-mono">{order.trackingNumber}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}