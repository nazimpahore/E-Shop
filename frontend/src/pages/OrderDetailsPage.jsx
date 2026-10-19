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
  AlertCircle,
  AlertTriangle,
  XCircle,
  X,
  RotateCcw
} from 'lucide-react';
import Breadcrumbs from '../components/common/Breadcrumbs.jsx';
import EmptyState from '../components/common/EmptyState.jsx';
import { apiService } from '../services/api.js';
import { useToast } from '../context/ToastContext.jsx';

export default function OrderDetailsPage() {
  const { id } = useParams();
  const { showToast } = useToast();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Cancellation State
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('Changed my mind');
  const [customReason, setCustomReason] = useState('');
  const [cancelling, setCancelling] = useState(false);
  const [cancelError, setCancelError] = useState(null);

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

  // 24-Hour Cancellation Window Calculation
  const orderTime = new Date(order.createdAt).getTime();
  const now = Date.now();
  const msElapsed = now - orderTime;
  const msIn24Hours = 24 * 60 * 60 * 1000;
  const isWithin24Hours = msElapsed <= msIn24Hours;
  const remainingMs = Math.max(0, msIn24Hours - msElapsed);
  const hoursRemaining = Math.floor(remainingMs / (1000 * 60 * 60));
  const minutesRemaining = Math.floor((remainingMs % (1000 * 60 * 60)) / (1000 * 60));

  const isCancelled = order.status === 'Cancelled';
  const isDelivered = order.status === 'Delivered';
  const isShipped = order.status === 'Shipped';
  const canCancel = isWithin24Hours && !isCancelled && !isDelivered && !isShipped;

  const handleCancelOrder = async () => {
    const finalReason = cancelReason === 'Other' ? customReason.trim() || 'Other reason' : cancelReason;
    try {
      setCancelling(true);
      setCancelError(null);
      const res = await apiService.cancelOrder(order.id, finalReason, order.customer?.email);
      setOrder(prev => ({
        ...prev,
        status: 'Cancelled',
        cancellationReason: finalReason,
        cancelledAt: new Date().toISOString()
      }));
      setShowCancelModal(false);
      showToast('Order cancelled successfully. Refund initiated.', 'success');
    } catch (err) {
      setCancelError(err.message || 'Failed to cancel order.');
      showToast(err.message || 'Failed to cancel order.', 'error');
    } finally {
      setCancelling(false);
    }
  };

  // Status timeline steps
  const steps = [
    { label: 'Order Placed', date: new Date(order.createdAt).toLocaleDateString(), completed: true },
    { label: 'Processing', date: isCancelled ? 'Cancelled' : 'In progress', completed: !isCancelled },
    { label: 'Shipped', date: isCancelled ? 'N/A' : 'Expected soon', completed: (isDelivered || isShipped) && !isCancelled },
    { label: 'Delivered', date: isCancelled ? 'N/A' : order.estimatedDelivery, completed: isDelivered && !isCancelled }
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

        {/* 24-Hour Cancellation Banner Alert */}
        {canCancel && (
          <div className="mt-4 mb-4 bg-amber-50 border border-amber-200 rounded-xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-full bg-amber-100 flex items-center justify-center text-amber-700 shrink-0 mt-0.5">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xs sm:text-sm font-bold text-amber-900">
                    24-Hour Free Cancellation Available
                  </h2>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-200/70 text-amber-900">
                    {hoursRemaining}h {minutesRemaining}m remaining
                  </span>
                </div>
                <p className="text-xs text-amber-800/90 mt-0.5">
                  You can cancel this order with a full refund within 24 hours of placement without penalty.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowCancelModal(true)}
              className="px-4 py-2 rounded-lg bg-white border border-rose-300 text-rose-700 hover:bg-rose-50 hover:border-rose-400 font-semibold text-xs transition-colors shrink-0 flex items-center gap-1.5 shadow-2xs"
            >
              <XCircle className="w-4 h-4 text-rose-600" />
              <span>Cancel Order</span>
            </button>
          </div>
        )}

        {/* Order Cancelled Notification Banner */}
        {isCancelled && (
          <div className="mt-4 mb-4 bg-rose-50 border border-rose-200 rounded-xl p-4 sm:p-5 flex items-start gap-3.5">
            <div className="w-9 h-9 rounded-full bg-rose-100 flex items-center justify-center text-rose-700 shrink-0 mt-0.5">
              <XCircle className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-rose-900">This Order Has Been Cancelled</h2>
              <p className="text-xs text-rose-800 mt-0.5">
                {order.cancellationReason ? `Reason: "${order.cancellationReason}".` : 'Cancelled within the 24-hour customer window.'}{' '}
                All reserved items have been restocked and payment status marked as refunded.
              </p>
              {order.cancelledAt && (
                <p className="text-[11px] text-rose-700/80 mt-1">
                  Cancelled on: {new Date(order.cancelledAt).toLocaleString()}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Success / Status Header */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 sm:p-8 mt-2 mb-6 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-100 gap-4">
            <div className="flex items-center gap-3.5">
              <div
                className={`w-12 h-12 rounded-full border flex items-center justify-center shrink-0 ${
                  isCancelled
                    ? 'bg-rose-50 border-rose-200 text-rose-700'
                    : 'bg-teal-50 border-teal-200 text-teal-700'
                }`}
              >
                {isCancelled ? <XCircle className="w-6 h-6" /> : <CheckCircle2 className="w-6 h-6" />}
              </div>
              <div>
                <span
                  className={`text-[11px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full inline-block mb-1 ${
                    isCancelled
                      ? 'bg-rose-100 text-rose-800'
                      : 'bg-teal-50 text-teal-700 border border-teal-200'
                  }`}
                >
                  {order.status}
                </span>
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
                  Order #{order.id}
                </h1>
                <p className="text-xs text-slate-500 mt-0.5">
                  Placed on{' '}
                  {new Date(order.createdAt).toLocaleDateString('en-US', {
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric'
                  })}{' '}
                  at {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
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
                className={`absolute left-0 top-1/2 -translate-y-1/2 h-0.5 -z-0 transition-all duration-500 ${
                  isCancelled ? 'bg-rose-500' : 'bg-teal-600'
                }`}
                style={{
                  width: isCancelled
                    ? '100%'
                    : order.status === 'Delivered'
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
                      isCancelled && idx === 1
                        ? 'bg-rose-600 text-white shadow-xs'
                        : step.completed
                        ? 'bg-teal-700 text-white shadow-xs'
                        : 'bg-white border-2 border-slate-300 text-slate-400'
                    }`}
                  >
                    {isCancelled && idx === 1 ? '✕' : step.completed ? '✓' : idx + 1}
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
                    ${((item.product?.price || item.price || 0) * item.quantity).toFixed(2)}
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
              <p className="text-slate-600">
                {order.shippingAddress?.addressLine1} {order.shippingAddress?.apartment}
              </p>
              <p className="text-slate-600">
                {order.shippingAddress?.city}, {order.shippingAddress?.state} {order.shippingAddress?.postalCode}
              </p>
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

          <div className="flex items-center gap-3">
            {canCancel && (
              <button
                type="button"
                onClick={() => setShowCancelModal(true)}
                className="px-4 py-2.5 rounded-lg border border-rose-300 text-rose-700 hover:bg-rose-50 text-xs font-semibold transition-colors"
              >
                Cancel Order
              </button>
            )}
            <Link
              to="/account?tab=orders"
              className="px-5 py-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition-colors"
            >
              Manage Orders in Account
            </Link>
          </div>
        </div>
      </div>

      {/* Cancel Order Confirmation Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-rose-100 flex items-center justify-center text-rose-600">
                  <AlertTriangle className="w-4 h-4" />
                </div>
                <h3 className="text-base font-bold text-slate-900">Cancel Order #{order.id}</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowCancelModal(false)}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Are you sure you want to cancel this order? This action cannot be reversed. Reserved stock will be returned to inventory and your payment will be refunded.
            </p>

            <div className="space-y-3 pt-1 text-xs">
              <label className="block font-semibold text-slate-800">Reason for cancellation</label>
              <select
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:bg-white focus:border-slate-800"
              >
                <option value="Changed my mind">Changed my mind</option>
                <option value="Found a better price elsewhere">Found a better price elsewhere</option>
                <option value="Ordered duplicate or wrong items">Ordered duplicate or wrong items</option>
                <option value="Delivery time is too long">Delivery time is too long</option>
                <option value="Need to change shipping address">Need to change shipping address</option>
                <option value="Other">Other reason</option>
              </select>

              {cancelReason === 'Other' && (
                <textarea
                  rows="2"
                  placeholder="Please specify your reason..."
                  value={customReason}
                  onChange={(e) => setCustomReason(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-800 focus:outline-none focus:bg-white focus:border-slate-800"
                />
              )}
            </div>

            {cancelError && (
              <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs">
                {cancelError}
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowCancelModal(false)}
                disabled={cancelling}
                className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-colors"
              >
                Keep Order
              </button>
              <button
                type="button"
                onClick={handleCancelOrder}
                disabled={cancelling}
                className="px-5 py-2 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs transition-colors flex items-center gap-1.5 shadow-xs"
              >
                {cancelling ? (
                  <span>Cancelling...</span>
                ) : (
                  <>
                    <XCircle className="w-3.5 h-3.5" />
                    <span>Confirm Cancellation</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
