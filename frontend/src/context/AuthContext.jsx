import React, { createContext, useContext, useState, useEffect } from 'react';
import { useToast } from './ToastContext.jsx';
import { apiService } from '../services/api.js';

const AuthContext = createContext(null);

const USER_STORAGE_KEY = 'eshop_auth_user';
const ORDERS_STORAGE_KEY = 'eshop_orders';

export function AuthProvider({ children }) {
  const { showToast } = useToast();

  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem(USER_STORAGE_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [orders, setOrders] = useState(() => {
    try {
      const saved = localStorage.getItem(ORDERS_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      if (user) {
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
      } else {
        localStorage.removeItem(USER_STORAGE_KEY);
      }
    } catch {
      // ignore
    }
  }, [user]);

  useEffect(() => {
    try {
      localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(orders));
    } catch {
      // ignore
    }
  }, [orders]);

  const login = async (email, password) => {
    try {
      const response = await apiService.login(email, password);
      const loggedUser = {
        ...response.user,
        addresses: Array.isArray(response.user?.addresses) ? response.user.addresses : []
      };
      setUser(loggedUser);
      showToast(`Welcome back, ${loggedUser.name}!`, 'success');
      return { success: true };
    } catch (err) {
      showToast(err.message || 'Login failed.', 'error');
      return { success: false, error: err.message };
    }
  };

  const register = async (name, email, password) => {
    try {
      const response = await apiService.register(name, email, password);
      const newUser = {
        ...response.user,
        addresses: []
      };
      setUser(newUser);
      showToast(`Welcome to E-Shop, ${name}! Your account is ready.`, 'success');
      return { success: true };
    } catch (err) {
      showToast(err.message || 'Registration failed.', 'error');
      return { success: false, error: err.message };
    }
  };

  const logout = () => {
    setUser(null);
    showToast('You have been signed out.', 'info');
  };

  const updateProfile = (data) => {
    if (!user) return;
    const updated = { ...user, ...data };
    setUser(updated);
    showToast('Profile information updated successfully.', 'success');
  };

  const addAddress = async (newAddress) => {
    if (!user) return { success: false };
    try {
      const res = await apiService.addAddress(newAddress);
      if (res.success && res.user) {
        setUser(res.user);
        showToast('New shipping address saved.', 'success');
        return { success: true };
      }
    } catch {
      // fallback to local state
    }

    const addressWithId = {
      ...newAddress,
      id: `addr-${Date.now()}`,
      isDefault: (!user.addresses || user.addresses.length === 0) || newAddress.isDefault
    };

    let updatedAddresses = [...(user.addresses || [])];
    if (addressWithId.isDefault) {
      updatedAddresses = updatedAddresses.map(a => ({ ...a, isDefault: false }));
    }
    updatedAddresses.push(addressWithId);

    setUser({
      ...user,
      addresses: updatedAddresses
    });
    showToast('New shipping address saved.', 'success');
    return { success: true };
  };

  const updateAddress = async (addressId, updatedData) => {
    if (!user) return { success: false };
    try {
      const res = await apiService.updateAddress(addressId, updatedData);
      if (res.success && res.user) {
        setUser(res.user);
        showToast('Address updated successfully.', 'success');
        return { success: true };
      }
    } catch {
      // fallback to local state
    }

    let updatedAddresses = (user.addresses || []).map(addr => {
      if (addr.id === addressId) {
        return { ...addr, ...updatedData, id: addressId };
      }
      if (updatedData.isDefault) {
        return { ...addr, isDefault: false };
      }
      return addr;
    });

    if (!updatedAddresses.some(a => a.isDefault) && updatedAddresses.length > 0) {
      updatedAddresses[0].isDefault = true;
    }

    setUser({
      ...user,
      addresses: updatedAddresses
    });
    showToast('Address updated successfully.', 'success');
    return { success: true };
  };

  const deleteAddress = async (addressId) => {
    if (!user) return;
    try {
      const res = await apiService.deleteAddress(addressId);
      if (res.success && res.user) {
        setUser(res.user);
        showToast('Address removed.', 'info');
        return;
      }
    } catch {
      // fallback to local state
    }

    const filtered = (user.addresses || []).filter(a => a.id !== addressId);
    if (filtered.length > 0 && !filtered.some(a => a.isDefault)) {
      filtered[0].isDefault = true;
    }
    setUser({
      ...user,
      addresses: filtered
    });
    showToast('Address removed.', 'info');
  };

  const addOrder = (order) => {
    setOrders((prev) => [order, ...prev]);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        orders,
        login,
        register,
        logout,
        updateProfile,
        addAddress,
        updateAddress,
        deleteAddress,
        addOrder
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
