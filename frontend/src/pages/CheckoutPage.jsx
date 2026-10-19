import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  CreditCard,
  Truck,
  ShieldCheck,
  CheckCircle2,
  Lock,
  ArrowLeft,
  AlertCircle
} from 'lucide-react';
import Breadcrumbs from '../components/common/Breadcrumbs.jsx';
import { useCart } from '../context/CartContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { apiService } from '../services/api.js';

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { user, addOrder } = useAuth();
  const {
    items,
    subtotal,
    discountAmount,
    shippingFee,
    estimatedTax,
    orderTotal,
    appliedPromo,
    clearCart
  } = useCart();
  const { showToast } = useToast();

  // If cart is empty, redirect or prompt
  const defaultAddr = user?.addresses?.find((a) => a.isDefault) || user?.addresses?.[0];

  // Form state
  const [formData, setFormData] = useState({
    email: user?.email || '',
    phone: user?.phone || defaultAddr?.phone || '',
    fullName: defaultAddr?.fullName || user?.name || '',
    addressLine1: defaultAddr?.addressLine1 || '',
    apartment: defaultAddr?.apartment || '',
    city: defaultAddr?.city || '',
    state: defaultAddr?.state || '',
    country: defaultAddr?.country || '',
    postalCode: defaultAddr?.postalCode || '',
    shippingMethod: 'standard', // 'standard' or 'express'
    paymentMethod: 'cod', // 'card', 'paypal', 'cod'
    cardNumber: '',
    cardExpiry: '',
    cardCvc: ''
  });

  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  // If cart is empty
  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
          <h2 className="text-xl font-bold text-slate-900 mb-2">No items to checkout</h2>
          <p className="text-xs text-slate-500 mb-6">Your shopping cart is currently empty.</p>
          <Link
            to="/shop"
            className="inline-flex px-5 py-2.5 rounded-lg bg-slate-900 text-white text-xs font-semibold"
          >
            Go to Shop
          </Link>
        </div>
      </div>
    );
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const errs = {};
    if (!formData.email.trim() || !formData.email.includes('@')) {
      errs.email = 'Valid email is required for confirmation.';
    }
    if (!formData.fullName.trim()) {
      errs.fullName = 'Full recipient name is required.';
    }
    if (!formData.addressLine1.trim()) {
      errs.addressLine1 = 'Street address is required.';
    }
    if (!formData.city.trim()) {
      errs.city = 'City is required.';
    }
    if (!formData.state.trim()) {
      errs.state = 'State / Province is required.';
    }
    if (!formData.country.trim()) {
      errs.country = 'Country is required.';
    }
    if (!formData.postalCode.trim()) {
      errs.postalCode = 'Postal / ZIP code is required.';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      showToast('Please fill all required shipping fields.', 'error');
      return;
    }

    try {
      setSubmitting(true);

      const finalShippingPrice = formData.shippingMethod === 'express' ? 12.00 : shippingFee;
      const finalTotal = subtotal - discountAmount + finalShippingPrice + estimatedTax;

      const orderPayload = {
        customer: {
          fullName: formData.fullName,
          email: formData.email,
          phone: formData.phone
        },
        shippingAddress: {
          fullName: formData.fullName,
          addressLine1: formData.addressLine1,
          apartment: formData.apartment,
          city: formData.city,
          state: formData.state,
          postalCode: formData.postalCode,
          country: formData.country
        },
        shippingMethod: {
          name: formData.shippingMethod === 'express' ? 'Priority Express Courier' : 'Standard Insured Delivery',
          price: finalShippingPrice
        },
        paymentMethod: {
          type: formData.paymentMethod,
          cardBrand: formData.paymentMethod === 'card' ? 'Visa' : null,
          last4: formData.paymentMethod === 'card' ? '4242' : null
        },
        items: [...items],
        pricing: {
          subtotal,
          discount: discountAmount,
          shipping: finalShippingPrice,
          tax: estimatedTax,
          total: finalTotal
        }
      };

      const result = await apiService.createOrder(orderPayload);
      addOrder(result.data);
      clearCart();
      showToast('Order confirmed! Generating your receipt...', 'success');
      navigate(`/orders/${result.data.id}`);
    } catch (err) {
      showToast(err.message || 'Failed to place order.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const effectiveShipping = formData.shippingMethod === 'express' ? 12.00 : shippingFee;
  const currentTotal = subtotal - discountAmount + effectiveShipping + estimatedTax;

  return (
    <div className="min-h-screen bg-slate-50/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Breadcrumbs
          items={[
            { label: 'Cart', to: '/cart' },
            { label: 'Checkout' }
          ]}
        />

        <div className="flex items-center justify-between py-4 mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            Checkout
          </h1>
          <Link
            to="/cart"
            className="text-xs font-semibold text-slate-600 hover:text-slate-900 flex items-center gap-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Cart
          </Link>
        </div>

        <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Form: Customer, Shipping & Payment */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* 1. Contact Information */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-slate-900 text-white text-[11px] flex items-center justify-center font-bold">1</span>
                  Contact Information
                </h2>
                <span className="text-[11px] text-slate-500">Order updates sent here</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className={`w-full bg-slate-50 border rounded-lg px-3 py-2 text-xs text-slate-800 focus:outline-none focus:bg-white ${
                      errors.email ? 'border-rose-500' : 'border-slate-200 focus:border-slate-800'
                    }`}
                  />
                  {errors.email && <p className="text-[11px] text-rose-600 mt-1">{errors.email}</p>}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Phone Number (Optional)
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 focus:outline-none focus:bg-white focus:border-slate-800"
                  />
                </div>
              </div>
            </div>

            {/* 2. Shipping Address */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-slate-900 text-white text-[11px] flex items-center justify-center font-bold">2</span>
                  Delivery Address
                </h2>
              </div>

              {/* Quick Select from Saved Addresses */}
              {user?.addresses && user.addresses.length > 0 && (
                <div className="pb-3 border-b border-slate-100">
                  <label className="block text-xs font-semibold text-slate-700 mb-2">
                    Select a Saved Address:
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {user.addresses.map((addr) => {
                      const isSelected =
                        formData.addressLine1 === addr.addressLine1 &&
                        formData.city === addr.city &&
                        formData.postalCode === addr.postalCode;
                      return (
                        <button
                          key={addr.id}
                          type="button"
                          onClick={() => {
                            setFormData((prev) => ({
                              ...prev,
                              fullName: addr.fullName || prev.fullName,
                              addressLine1: addr.addressLine1 || '',
                              apartment: addr.apartment || '',
                              city: addr.city || '',
                              state: addr.state || '',
                              country: addr.country || '',
                              postalCode: addr.postalCode || '',
                              phone: addr.phone || prev.phone
                            }));
                            setErrors((prev) => ({
                              ...prev,
                              fullName: '',
                              addressLine1: '',
                              city: '',
                              state: '',
                              country: '',
                              postalCode: ''
                            }));
                          }}
                          className={`text-left p-2.5 rounded-lg border text-xs transition-colors cursor-pointer ${
                            isSelected
                              ? 'border-slate-900 bg-slate-50 ring-1 ring-slate-900'
                              : 'border-slate-200 hover:border-slate-300 bg-white'
                          }`}
                        >
                          <div className="flex items-center justify-between font-semibold text-slate-900">
                            <span>{addr.fullName}</span>
                            {addr.isDefault && (
                              <span className="text-[10px] text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.2 rounded">
                                Default
                              </span>
                            )}
                          </div>
                          <p className="text-slate-600 truncate mt-0.5">
                            {addr.addressLine1} {addr.apartment && `(${addr.apartment})`}
                          </p>
                          <p className="text-slate-500 text-[11px]">
                            {addr.city}, {addr.state}, {addr.country || 'N/A'} {addr.postalCode}
                          </p>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Full Recipient Name *
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    className={`w-full bg-slate-50 border rounded-lg px-3 py-2 text-xs text-slate-800 focus:outline-none focus:bg-white ${
                      errors.fullName ? 'border-rose-500' : 'border-slate-200 focus:border-slate-800'
                    }`}
                  />
                  {errors.fullName && <p className="text-[11px] text-rose-600 mt-1">{errors.fullName}</p>}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Street Address *
                    </label>
                    <input
                      type="text"
                      name="addressLine1"
                      value={formData.addressLine1}
                      onChange={handleInputChange}
                      className={`w-full bg-slate-50 border rounded-lg px-3 py-2 text-xs text-slate-800 focus:outline-none focus:bg-white ${
                        errors.addressLine1 ? 'border-rose-500' : 'border-slate-200 focus:border-slate-800'
                      }`}
                    />
                    {errors.addressLine1 && <p className="text-[11px] text-rose-600 mt-1">{errors.addressLine1}</p>}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Apt / Suite
                    </label>
                    <input
                      type="text"
                      name="apartment"
                      value={formData.apartment}
                      onChange={handleInputChange}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 focus:outline-none focus:bg-white focus:border-slate-800"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      City *
                    </label>
                    <input
                      type="text"
                      name="city"
                      placeholder="e.g. Karachi"
                      value={formData.city}
                      onChange={handleInputChange}
                      className={`w-full bg-slate-50 border rounded-lg px-3 py-2 text-xs text-slate-800 focus:outline-none focus:bg-white ${
                        errors.city ? 'border-rose-500' : 'border-slate-200 focus:border-slate-800'
                      }`}
                    />
                    {errors.city && <p className="text-[11px] text-rose-600 mt-1">{errors.city}</p>}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      State / Province *
                    </label>
                    <input
                      type="text"
                      name="state"
                      placeholder="e.g. Sindh"
                      value={formData.state}
                      onChange={handleInputChange}
                      className={`w-full bg-slate-50 border rounded-lg px-3 py-2 text-xs text-slate-800 focus:outline-none focus:bg-white ${
                        errors.state ? 'border-rose-500' : 'border-slate-200 focus:border-slate-800'
                      }`}
                    />
                    {errors.state && <p className="text-[11px] text-rose-600 mt-1">{errors.state}</p>}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Country *
                    </label>
                    <input
                      type="text"
                      name="country"
                      placeholder="e.g. Pakistan"
                      value={formData.country}
                      onChange={handleInputChange}
                      className={`w-full bg-slate-50 border rounded-lg px-3 py-2 text-xs text-slate-800 focus:outline-none focus:bg-white ${
                        errors.country ? 'border-rose-500' : 'border-slate-200 focus:border-slate-800'
                      }`}
                    />
                    {errors.country && <p className="text-[11px] text-rose-600 mt-1">{errors.country}</p>}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      ZIP / Postal Code *
                    </label>
                    <input
                      type="text"
                      name="postalCode"
                      placeholder="e.g. 75500"
                      value={formData.postalCode}
                      onChange={handleInputChange}
                      className={`w-full bg-slate-50 border rounded-lg px-3 py-2 text-xs text-slate-800 focus:outline-none focus:bg-white ${
                        errors.postalCode ? 'border-rose-500' : 'border-slate-200 focus:border-slate-800'
                      }`}
                    />
                    {errors.postalCode && <p className="text-[11px] text-rose-600 mt-1">{errors.postalCode}</p>}
                  </div>
                </div>
              </div>
            </div>

            {/* 3. Delivery Method Selection */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6 space-y-4">
              <div className="pb-3 border-b border-slate-100">
                <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-slate-900 text-white text-[11px] flex items-center justify-center font-bold">3</span>
                  Shipping Option
                </h2>
              </div>

              <div className="space-y-3 text-xs">
                <label className={`flex items-center justify-between p-3.5 rounded-lg border cursor-pointer transition-all ${
                  formData.shippingMethod === 'standard'
                    ? 'border-slate-900 bg-slate-50/60 font-semibold'
                    : 'border-slate-200 hover:border-slate-300'
                }`}>
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="shippingMethod"
                      value="standard"
                      checked={formData.shippingMethod === 'standard'}
                      onChange={handleInputChange}
                      className="text-slate-900"
                    />
                    <div>
                      <p className="text-slate-900 font-semibold">Standard Insured Delivery</p>
                      <p className="text-[11px] text-slate-500 font-normal">Arrives in 2-4 business days</p>
                    </div>
                  </div>
                  <span className="text-slate-900">
                    {shippingFee === 0 ? 'FREE' : `$${shippingFee.toFixed(2)}`}
                  </span>
                </label>

                <label className={`flex items-center justify-between p-3.5 rounded-lg border cursor-pointer transition-all ${
                  formData.shippingMethod === 'express'
                    ? 'border-slate-900 bg-slate-50/60 font-semibold'
                    : 'border-slate-200 hover:border-slate-300'
                }`}>
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="shippingMethod"
                      value="express"
                      checked={formData.shippingMethod === 'express'}
                      onChange={handleInputChange}
                      className="text-slate-900"
                    />
                    <div>
                      <p className="text-slate-900 font-semibold">Priority Express Courier</p>
                      <p className="text-[11px] text-slate-500 font-normal">Next-day guaranteed delivery</p>
                    </div>
                  </div>
                  <span className="text-slate-900">$12.00</span>
                </label>
              </div>
            </div>

            {/* 4. Payment Method UI (Demonstration) */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-slate-900 text-white text-[11px] flex items-center justify-center font-bold">4</span>
                  Payment Method
                </h2>
                <span className="text-[10px] font-semibold uppercase tracking-wider text-teal-700 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                  Demo Simulation
                </span>
              </div>

              {/* Method tabs */}
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'card', label: 'Credit Card', icon: CreditCard },
                  { id: 'paypal', label: 'PayPal', icon: CheckCircle2 },
                  { id: 'cod', label: 'Cash on Delivery', icon: Truck }
                ].map((m) => {
                  const Icon = m.icon;
                  return (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setFormData(p => ({ ...p, paymentMethod: m.id }))}
                      className={`p-3 rounded-lg border text-xs font-semibold flex flex-col items-center justify-center gap-1.5 transition-all ${
                        formData.paymentMethod === m.id
                          ? 'border-slate-900 bg-slate-900 text-white shadow-xs'
                          : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{m.label}</span>
                    </button>
                  );
                })}
              </div>

              {formData.paymentMethod === 'card' && (
                <div className="space-y-3 pt-2 bg-slate-50 p-4 rounded-lg border border-slate-200">
                  <div className="flex items-center justify-between text-xs text-slate-600 mb-1">
                    <span className="font-semibold text-slate-800">Simulated Demo Card</span>
                    <span className="text-[11px] text-teal-700">Pre-filled for testing</span>
                  </div>
                  <div>
                    <input
                      type="text"
                      readOnly
                      value={formData.cardNumber}
                      className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs font-mono text-slate-700"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="text"
                      readOnly
                      value={`Expires: ${formData.cardExpiry}`}
                      className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs font-mono text-slate-700"
                    />
                    <input
                      type="text"
                      readOnly
                      value={`CVC: ${formData.cardCvc}`}
                      className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs font-mono text-slate-700"
                    />
                  </div>
                </div>
              )}

              {formData.paymentMethod === 'paypal' && (
                <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-600">
                  You will authenticate your simulated PayPal transaction on order confirmation.
                </div>
              )}

              {formData.paymentMethod === 'cod' && (
                <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-600">
                  Pay cash or card upon delivery directly to your courier agent.
                </div>
              )}
            </div>
          </div>

          {/* Right Summary Area */}
          <div className="lg:col-span-5 bg-white border border-slate-200 rounded-xl p-5 sm:p-6 space-y-6">
            <h2 className="text-base font-bold text-slate-900 pb-3 border-b border-slate-200">
              Review Your Order
            </h2>

            {/* Compact Items List */}
            <div className="max-h-72 overflow-y-auto divide-y divide-slate-100 pr-1 space-y-2">
              {items.map((item) => (
                <div key={item.id} className="pt-2 flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-3">
                    <div className="relative w-12 h-12 rounded bg-slate-50 border border-slate-200 overflow-hidden shrink-0">
                      <img
                        src={item.product.images?.[0]}
                        alt={item.product.name}
                        className="w-full h-full object-cover"
                      />
                      <span className="absolute bottom-0 right-0 bg-slate-900 text-white text-[10px] px-1 font-bold rounded-tl">
                        x{item.quantity}
                      </span>
                    </div>
                    <div className="space-y-0.5">
                      <p className="font-semibold text-slate-900 line-clamp-1">{item.product.name}</p>
                      {item.variant && (
                        <p className="text-[11px] text-slate-500">{item.variant.name}</p>
                      )}
                    </div>
                  </div>
                  <span className="font-bold text-slate-900 shrink-0">
                    ${(item.product.price * item.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>

            {/* Pricing breakdown */}
            <div className="space-y-2 text-xs text-slate-600 pt-3 border-t border-slate-200">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-semibold text-slate-900">${subtotal.toFixed(2)}</span>
              </div>

              {discountAmount > 0 && (
                <div className="flex justify-between text-teal-700 font-medium">
                  <span>Promo discount ({appliedPromo?.code})</span>
                  <span>-${discountAmount.toFixed(2)}</span>
                </div>
              )}

              <div className="flex justify-between">
                <span>Shipping ({formData.shippingMethod === 'express' ? 'Priority Express' : 'Standard'})</span>
                <span className="font-semibold text-slate-900">
                  {effectiveShipping === 0 ? 'FREE' : `$${effectiveShipping.toFixed(2)}`}
                </span>
              </div>

              <div className="flex justify-between">
                <span>Sales Tax (8%)</span>
                <span className="font-semibold text-slate-900">${estimatedTax.toFixed(2)}</span>
              </div>

              <div className="flex justify-between text-base font-bold text-slate-900 pt-3 border-t border-slate-200">
                <span>Total Due</span>
                <span>${currentTotal.toFixed(2)}</span>
              </div>
            </div>

            {/* Submit Place Order Button */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3.5 px-4 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold flex items-center justify-center gap-2 transition-colors disabled:opacity-50 shadow-xs"
            >
              <Lock className="w-4 h-4" />
              <span>{submitting ? 'Placing Order...' : `Place Order • $${currentTotal.toFixed(2)}`}</span>
            </button>

            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-[11px] text-slate-500 text-center">
              Frontend Demonstration: No real money is collected. All orders generate realistic demo receipts and tracking timelines.
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
