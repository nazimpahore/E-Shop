import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  CheckCircle2,
  Package,
  Truck,
  Clock,
  ArrowLeft,
  ShieldCheck,
  MapPin,
  CreditCard,
  AlertCircle
} from 'lucide-react';
import Breadcrumbs from '../components/common/Breadcrumbs.jsx';
import EmptyState from '../components/common/EmptyState.jsx';
import { apiService } from '../services/api.js';

export default function OrderDetailsPage() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadOrder() {
      try {
        setLoading(true);
        setError(null);
        const res = await apiService.getOrderById(id);
        setOrder(res.data);
      } catch (err) {
        setError(err.message || 'Order could not be found.');
      } finally {
        setLoading(false);
      }
    }

    if (id) {
      loadOrder();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 animate-pulse space-y-6">
        <div className="h-6 bg-slate-100 rounded w-1/4" />
        <div className="h-32 bg-slate-100 rounded-xl" />
        <div className="h-48 bg-slate-100 rounded-xl" />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16">
        <EmptyState
          icon={AlertCircle}
          title="Order Not Found"
          description={`We couldn't locate any record matching reference number "${id}".`}
          actionLabel="View All Orders"
          actionTo="/account?tab=orders"
        />
      </div>
    );
  }

  // Status timeline steps
  const steps = [
    { label: 'Order Placed', date: new Date(order.createdAt).toLocaleDateString(), completed: true },
    { label: 'Processing', date: 'In progress', completed: true },
    { label: 'Shipped', date: 'Expected tomorrow', completed: order.status === 'Delivered' || order.status === 'Shipped' },
    { label: 'Delivered', date: order.estimatedDelivery, completed: order.status === 'Delivered' }
  ];

  return (
    <div className="min-h-screen bg-slate-50/50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <Breadcrumbs
          items={[
            { label: 'Account', to: '/account' },
            { label: 'Orders', to: '/account?tab=orders' },
            { label: order.id }
          ]}
        />

        {/* Success / Status Header */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 sm:p-8 mt-4 mb-6 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-100 gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-full bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-700 shrink-0">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[11px] font-semibold uppercase tracking-wider text-teal-700">
                  {order.status}
                </span>
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
                  Order #{order.id}
                </h1>
                <p className="text-xs text-slate-500 mt-0.5">
                  Placed on {new Date(order.createdAt).toLocaleDateString('en-US', {
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </p>
              </div>
            </div>

            <div className="sm:text-right">
              <span className="text-xs text-slate-500">Tracking Reference</span>
              <p className="text-xs font-mono font-semibold text-slate-800">{order.trackingNumber}</p>
            </div>
          </div>

          {/* Timeline */}
          <div className="pt-8">
            <div className="relative flex items-center justify-between">
              {/* Connecting Bar */}
              <div className="absolute left-0 top-1/2 -translate-y-1/2 h-0.5 w-full bg-slate-200 -z-0" />
              <div
                className="absolute left-0 top-1/2 -translate-y-1/2 h-0.5 bg-teal-600 -z-0 transition-all duration-500"
                style={{
                  width:
                    order.status === 'Delivered'
                      ? '100%'
                      : order.status === 'Shipped'
                      ? '66%'
                      : '33%'
                }}
              />

              {steps.map((step, idx) => (
                <div key={idx} className="relative z-10 flex flex-col items-center text-center">
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                      step.completed
                        ? 'bg-teal-700 text-white shadow-xs'
                        : 'bg-white border-2 border-slate-300 text-slate-400'
                    }`}
                  >
                    {step.completed ? '✓' : idx + 1}
                  </div>
                  <span className="text-[11px] font-semibold text-slate-800 mt-2">{step.label}</span>
                  <span className="text-[10px] text-slate-400 hidden sm:inline">{step.date}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Ordered Items & Summary Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Items */}
          <div className="md:col-span-2 bg-white border border-slate-200 rounded-xl p-5 sm:p-6 space-y-4">
            <h2 className="text-sm font-bold text-slate-900 pb-3 border-b border-slate-100 flex items-center gap-2">
              <Package className="w-4 h-4 text-slate-600" />
              Items in this shipment
            </h2>

            <div className="divide-y divide-slate-100">
              {order.items.map((item, idx) => (
                <div key={idx} className="py-3 flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-3">
                    <img
                      src={item.product?.images?.[0] || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=300&q=80'}
                      alt={item.product?.name}
                      className="w-12 h-12 rounded object-cover border border-slate-200 bg-slate-50 shrink-0"
                    />
                    <div>
                      <p className="font-semibold text-slate-900 line-clamp-1">{item.product?.name}</p>
                      {item.variant && (
                        <p className="text-[11px] text-slate-500">Variant: {item.variant.name}</p>
                      )}
                      <p className="text-[11px] text-slate-500">Qty: {item.quantity}</p>
                    </div>
                  </div>

                  <span className="font-bold text-slate-900">
                    ${((item.product?.price || 0) * item.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Logistics & Cost Breakdown */}
          <div className="space-y-6">
            {/* Delivery address */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-2 text-xs">
              <h3 className="font-bold text-slate-900 flex items-center gap-1.5 pb-2 border-b border-slate-100">
                <MapPin className="w-3.5 h-3.5 text-slate-500" />
                Shipping Destination
              </h3>
              <p className="font-semibold text-slate-800">{order.shippingAddress?.fullName}</p>
              <p className="text-slate-600">{order.shippingAddress?.addressLine1} {order.shippingAddress?.apartment}</p>
              <p className="text-slate-600">{order.shippingAddress?.city}, {order.shippingAddress?.state} {order.shippingAddress?.postalCode}</p>
              <p className="text-slate-600">{order.shippingAddress?.country}</p>
            </div>

            {/* Payment Summary */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-2.5 text-xs text-slate-600">
              <h3 className="font-bold text-slate-900 flex items-center gap-1.5 pb-2 border-b border-slate-100">
                <CreditCard className="w-3.5 h-3.5 text-slate-500" />
                Payment Breakdown
              </h3>
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-semibold text-slate-900">${order.pricing?.subtotal?.toFixed(2)}</span>
              </div>
              {order.pricing?.discount > 0 && (
                <div className="flex justify-between text-teal-700">
                  <span>Discount</span>
                  <span>-${order.pricing.discount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Shipping</span>
                <span>{order.pricing?.shipping === 0 ? 'FREE' : `$${order.pricing?.shipping?.toFixed(2)}`}</span>
              </div>
              <div className="flex justify-between">
                <span>Tax</span>
                <span>${order.pricing?.tax?.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm font-bold text-slate-900 pt-2 border-t border-slate-100">
                <span>Total</span>
                <span>${order.pricing?.total?.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <Link
            to="/shop"
            className="text-xs font-semibold text-slate-700 hover:text-slate-900 flex items-center gap-1.5"
          >
            ← Back to All Products
          </Link>

          <Link
            to="/account?tab=orders"
            className="px-5 py-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold"
          >
            Manage Orders in Account
          </Link>
        </div>
      </div>
    </div>
  );
}
