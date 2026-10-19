import React, { useState, useEffect } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import {
  User,
  Package,
  MapPin,
  Settings,
  LogOut,
  Plus,
  Trash2,
  Pencil,
  ExternalLink,
  CheckCircle2,
  Clock,
  Shield,
  Info,
  XCircle
} from 'lucide-react';
import Breadcrumbs from '../components/common/Breadcrumbs.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';

export default function AccountPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, isAuthenticated, logout, updateProfile, addAddress, updateAddress, deleteAddress, orders } = useAuth();
  const { showToast } = useToast();

  const activeTab = searchParams.get('tab') || 'profile';

  // Profile Form state
  const [profileForm, setProfileForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || ''
  });

  // Address Modal state (supports both Add and Edit)
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState(null);
  const [addressForm, setAddressForm] = useState({
    fullName: user?.name || '',
    addressLine1: '',
    apartment: '',
    city: '',
    state: '',
    postalCode: '',
    country: '',
    phone: user?.phone || '',
    isDefault: false
  });

  useEffect(() => {
    if (user) {
      setProfileForm({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || ''
      });
    }
  }, [user]);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-md mx-auto px-4 py-16 text-center">
          <div className="w-14 h-14 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-500">
            <User className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">Sign in to your account</h2>
          <p className="text-xs text-slate-500 mb-6">
            Access your order history, delivery addresses, and saved preferences.
          </p>
          <Link
            to="/login"
            className="inline-flex px-6 py-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold"
          >
            Sign In Now
          </Link>
        </div>
      </div>
    );
  }

  const handleTabChange = (tab) => {
    setSearchParams({ tab });
  };

  const handleProfileSubmit = (e) => {
    e.preventDefault();
    updateProfile(profileForm);
  };

  const handleOpenAddAddress = () => {
    setEditingAddressId(null);
    setAddressForm({
      fullName: user?.name || '',
      addressLine1: '',
      apartment: '',
      city: '',
      state: '',
      postalCode: '',
      country: '',
      phone: user?.phone || '',
      isDefault: !user?.addresses || user.addresses.length === 0
    });
    setShowAddressModal(true);
  };

  const handleOpenEditAddress = (addr) => {
    setEditingAddressId(addr.id);
    setAddressForm({
      fullName: addr.fullName || '',
      addressLine1: addr.addressLine1 || '',
      apartment: addr.apartment || '',
      city: addr.city || '',
      state: addr.state || '',
      postalCode: addr.postalCode || '',
      country: addr.country || '',
      phone: addr.phone || '',
      isDefault: Boolean(addr.isDefault)
    });
    setShowAddressModal(true);
  };

  const handleAddressSubmit = (e) => {
    e.preventDefault();
    if (
      !addressForm.fullName.trim() ||
      !addressForm.addressLine1.trim() ||
      !addressForm.city.trim() ||
      !addressForm.state.trim() ||
      !addressForm.country.trim() ||
      !addressForm.postalCode.trim()
    ) {
      showToast('Please fill all required address fields including country.', 'error');
      return;
    }

    if (editingAddressId) {
      updateAddress(editingAddressId, addressForm);
    } else {
      addAddress(addressForm);
    }

    setShowAddressModal(false);
    setEditingAddressId(null);
  };

  return (
    <div className="min-h-screen bg-slate-50/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Breadcrumbs items={[{ label: 'Account' }]} />

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between py-4 mb-6 border-b border-slate-200 gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
              Customer Account
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Signed in as <span className="font-semibold text-slate-800">{user.email}</span>
            </p>
          </div>

          <button
            type="button"
            onClick={logout}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-rose-600 self-start sm:self-auto"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>

        {/* Account layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Navigation Sidebar */}
          <aside className="lg:col-span-3 bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
            <nav className="divide-y divide-slate-100 text-xs font-semibold">
              <button
                type="button"
                onClick={() => handleTabChange('profile')}
                className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${
                  activeTab === 'profile'
                    ? 'bg-slate-900 text-white'
                    : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <User className="w-4 h-4" />
                <span>Profile Information</span>
              </button>

              <button
                type="button"
                onClick={() => handleTabChange('orders')}
                className={`w-full flex items-center justify-between px-4 py-3 text-left transition-colors ${
                  activeTab === 'orders'
                    ? 'bg-slate-900 text-white'
                    : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Package className="w-4 h-4" />
                  <span>Order History</span>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-[10px] ${
                  activeTab === 'orders' ? 'bg-slate-800 text-slate-200' : 'bg-slate-100 text-slate-600'
                }`}>
                  {orders.length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => handleTabChange('addresses')}
                className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${
                  activeTab === 'addresses'
                    ? 'bg-slate-900 text-white'
                    : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <MapPin className="w-4 h-4" />
                <span>Saved Addresses</span>
              </button>

              <button
                type="button"
                onClick={() => handleTabChange('settings')}
                className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${
                  activeTab === 'settings'
                    ? 'bg-slate-900 text-white'
                    : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <Settings className="w-4 h-4" />
                <span>Account Settings</span>
              </button>
            </nav>
          </aside>

          {/* Tab Content Panel */}
          <main className="lg:col-span-9 bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
            
            {/* Tab: Profile */}
            {activeTab === 'profile' && (
              <div>
                <h2 className="text-base font-bold text-slate-900 mb-1">Personal Details</h2>
                <p className="text-xs text-slate-500 mb-6">Manage your contact name and telephone credentials.</p>

                <form onSubmit={handleProfileSubmit} className="max-w-md space-y-4 text-xs">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Full Name</label>
                    <input
                      type="text"
                      value={profileForm.name}
                      onChange={(e) => setProfileForm(p => ({ ...p, name: e.target.value }))}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:bg-white focus:border-slate-800"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Email Address</label>
                    <input
                      type="email"
                      value={profileForm.email}
                      onChange={(e) => setProfileForm(p => ({ ...p, email: e.target.value }))}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:bg-white focus:border-slate-800"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Phone Number</label>
                    <input
                      type="tel"
                      value={profileForm.phone}
                      onChange={(e) => setProfileForm(p => ({ ...p, phone: e.target.value }))}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:bg-white focus:border-slate-800"
                    />
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      className="px-5 py-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-semibold transition-colors"
                    >
                      Save Profile Changes
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Tab: Orders */}
            {activeTab === 'orders' && (
              <div>
                <h2 className="text-base font-bold text-slate-900 mb-1">Past Order History</h2>
                <p className="text-xs text-slate-500 mb-6">Track shipments, verify items, and view receipts.</p>

                {orders.length === 0 ? (
                  <div className="text-center py-12 text-slate-500 text-xs">
                    No orders placed yet.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {orders.map((o) => {
                      const orderTime = new Date(o.createdAt).getTime();
                      const elapsedHours = (Date.now() - orderTime) / (1000 * 60 * 60);
                      const isWithin24Hours = elapsedHours <= 24;
                      const hoursLeft = Math.max(0, Math.floor(24 - elapsedHours));
                      const isCancelled = o.status === 'Cancelled';
                      const isDelivered = o.status === 'Delivered';
                      const isShipped = o.status === 'Shipped';
                      const canCancel = isWithin24Hours && !isCancelled && !isDelivered && !isShipped;

                      return (
                        <div
                          key={o.id}
                          className="border border-slate-200 rounded-xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:border-slate-300 transition-colors"
                        >
                          <div className="space-y-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="font-bold text-slate-900 text-sm">#{o.id}</span>
                              <span
                                className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${
                                  isCancelled
                                    ? 'bg-rose-50 text-rose-800 border-rose-200'
                                    : isDelivered
                                    ? 'bg-teal-50 text-teal-800 border-teal-200'
                                    : 'bg-blue-50 text-blue-800 border-blue-200'
                                }`}
                              >
                                {o.status}
                              </span>

                              {canCancel && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-50 text-amber-800 border border-amber-200">
                                  <Clock className="w-3 h-3 text-amber-600" />
                                  <span>Cancel eligible ({hoursLeft}h left)</span>
                                </span>
                              )}
                            </div>

                            <p className="text-xs text-slate-500">
                              {new Date(o.createdAt).toLocaleDateString()} at {new Date(o.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {o.items?.length || 1} {(o.items?.length || 1) === 1 ? 'item' : 'items'}
                            </p>

                            <p className="text-xs font-semibold text-slate-800">
                              Total: ${(o.pricing?.total || 0).toFixed(2)}
                            </p>

                            {isCancelled && o.cancellationReason && (
                              <p className="text-[11px] text-rose-600 font-medium">
                                Cancellation: {o.cancellationReason}
                              </p>
                            )}
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            {canCancel && (
                              <Link
                                to={`/orders/${o.id}`}
                                className="inline-flex items-center gap-1 px-3 py-2 rounded-lg border border-rose-200 text-rose-700 hover:bg-rose-50 text-xs font-semibold transition-colors"
                              >
                                <XCircle className="w-3.5 h-3.5 text-rose-600" />
                                <span>Cancel Order</span>
                              </Link>
                            )}

                            <Link
                              to={`/orders/${o.id}`}
                              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition-colors"
                            >
                              <span>View Receipt</span>
                              <ExternalLink className="w-3.5 h-3.5" />
                            </Link>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Tab: Saved Addresses */}
            {activeTab === 'addresses' && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-base font-bold text-slate-900 mb-0.5">Shipping Addresses</h2>
                    <p className="text-xs text-slate-500">Manage delivery locations for quick checkout.</p>
                  </div>
                  <button
                    type="button"
                    onClick={handleOpenAddAddress}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add New</span>
                  </button>
                </div>

                {(!user.addresses || user.addresses.length === 0) ? (
                  <div className="text-center py-12 px-4 border border-dashed border-slate-200 rounded-xl bg-white">
                    <MapPin className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                    <h3 className="text-sm font-semibold text-slate-800">No addresses saved yet</h3>
                    <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-4">
                      Save your shipping address now for faster, hassle-free checkout.
                    </p>
                    <button
                      type="button"
                      onClick={handleOpenAddAddress}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Address</span>
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {user.addresses.map((addr) => (
                      <div
                        key={addr.id}
                        className="border border-slate-200 rounded-xl p-4 relative space-y-2 text-xs bg-white flex flex-col justify-between shadow-xs"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-slate-900">{addr.fullName}</span>
                            {addr.isDefault && (
                              <span className="text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded">
                                Default
                              </span>
                            )}
                          </div>
                          <p className="text-slate-600">
                            {addr.addressLine1} {addr.apartment && <span className="text-slate-500">({addr.apartment})</span>}
                          </p>
                          <p className="text-slate-600">
                            {addr.city}, {addr.state} {addr.postalCode}
                          </p>
                          <p className="text-slate-800 font-medium">
                            {addr.country}
                          </p>
                          {addr.phone && (
                            <p className="text-slate-500 text-[11px] pt-0.5">
                              📞 {addr.phone}
                            </p>
                          )}
                        </div>

                        <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2 mt-2">
                          <button
                            type="button"
                            onClick={() => handleOpenEditAddress(addr)}
                            className="inline-flex items-center gap-1 text-slate-600 hover:text-slate-900 hover:bg-slate-100 px-2.5 py-1 rounded transition-colors font-medium text-xs"
                            aria-label="Edit address"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                            <span>Edit</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => deleteAddress(addr.id)}
                            className="inline-flex items-center gap-1 text-rose-500 hover:text-rose-700 hover:bg-rose-50 px-2.5 py-1 rounded transition-colors font-medium text-xs"
                            aria-label="Delete address"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Delete</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Add / Edit Address Modal */}
                {showAddressModal && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
                    <div className="bg-white rounded-xl max-w-lg w-full p-6 shadow-xl border border-slate-200">
                      <div className="mb-4">
                        <h3 className="text-base font-bold text-slate-900">
                          {editingAddressId ? 'Edit Delivery Address' : 'Add Delivery Address'}
                        </h3>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {editingAddressId ? 'Update your shipping details below.' : 'Enter your shipping details below.'}
                        </p>
                      </div>

                      <form onSubmit={handleAddressSubmit} className="space-y-3 text-xs">
                        <div>
                          <label className="block font-semibold text-slate-700 mb-1">Full Name *</label>
                          <input
                            type="text"
                            required
                            placeholder="Recipient full name"
                            value={addressForm.fullName}
                            onChange={(e) => setAddressForm(p => ({ ...p, fullName: e.target.value }))}
                            className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-800 focus:outline-none focus:bg-white focus:border-slate-800"
                          />
                        </div>

                        <div>
                          <label className="block font-semibold text-slate-700 mb-1">Street Address *</label>
                          <input
                            type="text"
                            required
                            placeholder="House / Flat / Street address"
                            value={addressForm.addressLine1}
                            onChange={(e) => setAddressForm(p => ({ ...p, addressLine1: e.target.value }))}
                            className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-800 focus:outline-none focus:bg-white focus:border-slate-800"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="block font-semibold text-slate-700 mb-1">Apt / Suite / Floor</label>
                            <input
                              type="text"
                              placeholder="Optional"
                              value={addressForm.apartment}
                              onChange={(e) => setAddressForm(p => ({ ...p, apartment: e.target.value }))}
                              className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-800 focus:outline-none focus:bg-white focus:border-slate-800"
                            />
                          </div>
                          <div>
                            <label className="block font-semibold text-slate-700 mb-1">Phone Number</label>
                            <input
                              type="tel"
                              placeholder="Optional"
                              value={addressForm.phone}
                              onChange={(e) => setAddressForm(p => ({ ...p, phone: e.target.value }))}
                              className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-800 focus:outline-none focus:bg-white focus:border-slate-800"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="block font-semibold text-slate-700 mb-1">City *</label>
                            <input
                              type="text"
                              required
                              placeholder="e.g. Karachi, Lahore, New York"
                              value={addressForm.city}
                              onChange={(e) => setAddressForm(p => ({ ...p, city: e.target.value }))}
                              className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-800 focus:outline-none focus:bg-white focus:border-slate-800"
                            />
                          </div>
                          <div>
                            <label className="block font-semibold text-slate-700 mb-1">State / Province *</label>
                            <input
                              type="text"
                              required
                              placeholder="e.g. Sindh, Punjab, California"
                              value={addressForm.state}
                              onChange={(e) => setAddressForm(p => ({ ...p, state: e.target.value }))}
                              className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-800 focus:outline-none focus:bg-white focus:border-slate-800"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="block font-semibold text-slate-700 mb-1">Country *</label>
                            <input
                              type="text"
                              required
                              placeholder="e.g. Pakistan, United States"
                              value={addressForm.country}
                              onChange={(e) => setAddressForm(p => ({ ...p, country: e.target.value }))}
                              className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-800 focus:outline-none focus:bg-white focus:border-slate-800"
                            />
                          </div>
                          <div>
                            <label className="block font-semibold text-slate-700 mb-1">Postal / ZIP Code *</label>
                            <input
                              type="text"
                              required
                              placeholder="e.g. 75500, 10001"
                              value={addressForm.postalCode}
                              onChange={(e) => setAddressForm(p => ({ ...p, postalCode: e.target.value }))}
                              className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-800 focus:outline-none focus:bg-white focus:border-slate-800"
                            />
                          </div>
                        </div>

                        <label className="flex items-center gap-2 pt-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={addressForm.isDefault}
                            onChange={(e) => setAddressForm(p => ({ ...p, isDefault: e.target.checked }))}
                            className="rounded text-slate-900 border-slate-300 focus:ring-slate-900"
                          />
                          <span className="text-slate-700">Set as default shipping address</span>
                        </label>

                        <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
                          <button
                            type="button"
                            onClick={() => {
                              setShowAddressModal(false);
                              setEditingAddressId(null);
                            }}
                            className="px-4 py-2 border border-slate-200 rounded-lg text-slate-700 hover:bg-slate-50 transition-colors"
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-semibold transition-colors"
                          >
                            {editingAddressId ? 'Update Address' : 'Save Address'}
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Tab: Settings */}
            {activeTab === 'settings' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-base font-bold text-slate-900 mb-1">Notification Preferences</h2>
                  <p className="text-xs text-slate-500 mb-4">Choose what updates you want to receive.</p>

                  <div className="space-y-3 text-xs">
                    <label className="flex items-center justify-between p-3 border border-slate-200 rounded-lg">
                      <span>Order tracking notifications via Email</span>
                      <input type="checkbox" defaultChecked className="rounded text-slate-900" />
                    </label>
                    <label className="flex items-center justify-between p-3 border border-slate-200 rounded-lg">
                      <span>Promotional discounts and new product release bulletins</span>
                      <input type="checkbox" defaultChecked className="rounded text-slate-900" />
                    </label>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-200">
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
                    Security & Session
                  </h3>
                  <p className="text-xs text-slate-500 mb-3">Sign out from your active session on this device.</p>
                  <button
                    type="button"
                    onClick={logout}
                    className="px-4 py-2 rounded-lg border border-rose-200 bg-rose-50 text-rose-700 text-xs font-semibold hover:bg-rose-100 transition-colors"
                  >
                    Sign Out of E-Shop
                  </button>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
