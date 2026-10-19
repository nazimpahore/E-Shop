import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { useToast } from './ToastContext.jsx';
import { PROMO_CODES } from '../data/products.js';

const CartContext = createContext(null);

const STORAGE_KEY = 'eshop_cart_items';
const PROMO_STORAGE_KEY = 'eshop_cart_promo';

export function CartProvider({ children }) {
  const { showToast } = useToast();

  const [items, setItems] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [appliedPromo, setAppliedPromo] = useState(() => {
    try {
      const saved = localStorage.getItem(PROMO_STORAGE_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      // ignore
    }
  }, [items]);

  useEffect(() => {
    try {
      if (appliedPromo) {
        localStorage.setItem(PROMO_STORAGE_KEY, JSON.stringify(appliedPromo));
      } else {
        localStorage.removeItem(PROMO_STORAGE_KEY);
      }
    } catch {
      // ignore
    }
  }, [appliedPromo]);

  const addToCart = (product, quantity = 1, variant = null) => {
    if (!product) return;

    // Default variant if product has options and none was chosen
    const chosenVariant = variant || (product.variants?.options?.[0] || null);
    const cartItemId = `${product.id}-${chosenVariant ? chosenVariant.name : 'standard'}`;

    setItems((prevItems) => {
      const existingIndex = prevItems.findIndex((item) => item.id === cartItemId);
      if (existingIndex > -1) {
        const next = [...prevItems];
        const newQty = next[existingIndex].quantity + quantity;
        next[existingIndex] = {
          ...next[existingIndex],
          quantity: newQty
        };
        return next;
      } else {
        return [
          ...prevItems,
          {
            id: cartItemId,
            product,
            variant: chosenVariant,
            quantity: Math.max(1, quantity),
            addedAt: Date.now()
          }
        ];
      }
    });

    showToast(`Added "${product.name}" to your cart.`, 'success');
  };

  const updateQuantity = (cartItemId, newQty) => {
    if (newQty <= 0) {
      removeFromCart(cartItemId);
      return;
    }
    setItems((prev) =>
      prev.map((item) => (item.id === cartItemId ? { ...item, quantity: newQty } : item))
    );
  };

  const removeFromCart = (cartItemId) => {
    setItems((prev) => prev.filter((item) => item.id !== cartItemId));
    showToast('Item removed from cart.', 'info');
  };

  const clearCart = () => {
    setItems([]);
    setAppliedPromo(null);
  };

  const applyPromoCode = (code) => {
    if (!code || !code.trim()) {
      showToast('Please enter a promotional code.', 'error');
      return false;
    }
    const cleanCode = code.trim().toUpperCase();
    const promo = PROMO_CODES[cleanCode];

    if (!promo) {
      showToast(`Code "${cleanCode}" is invalid or expired.`, 'error');
      return false;
    }

    if (promo.minSubtotal && subtotal < promo.minSubtotal) {
      showToast(`Requires minimum subtotal of $${promo.minSubtotal.toFixed(2)}.`, 'error');
      return false;
    }

    setAppliedPromo({
      code: cleanCode,
      ...promo
    });
    showToast(`Promo code "${cleanCode}" applied successfully!`, 'success');
    return true;
  };

  const removePromoCode = () => {
    setAppliedPromo(null);
    showToast('Promotional code removed.', 'info');
  };

  // Calculations
  const subtotal = useMemo(() => {
    return items.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
  }, [items]);

  const totalItems = useMemo(() => {
    return items.reduce((acc, item) => acc + item.quantity, 0);
  }, [items]);

  const discountAmount = useMemo(() => {
    if (!appliedPromo) return 0;
    if (appliedPromo.discountPercent) {
      return (subtotal * appliedPromo.discountPercent) / 100;
    }
    if (appliedPromo.discountAmount) {
      return Math.min(subtotal, appliedPromo.discountAmount);
    }
    return 0;
  }, [appliedPromo, subtotal]);

  const shippingFee = useMemo(() => {
    if (items.length === 0) return 0;
    if (appliedPromo?.freeShipping) return 0;
    // Free shipping threshold: $50
    return subtotal >= 50 ? 0 : 8.00;
  }, [items.length, appliedPromo, subtotal]);

  const estimatedTax = useMemo(() => {
    if (items.length === 0) return 0;
    const taxableAmount = Math.max(0, subtotal - discountAmount);
    return taxableAmount * 0.08; // 8% estimated state/local sales tax
  }, [items.length, subtotal, discountAmount]);

  const orderTotal = useMemo(() => {
    if (items.length === 0) return 0;
    return Math.max(0, subtotal - discountAmount + shippingFee + estimatedTax);
  }, [items.length, subtotal, discountAmount, shippingFee, estimatedTax]);

  return (
    <CartContext.Provider
      value={{
        items,
        totalItems,
        subtotal,
        discountAmount,
        shippingFee,
        estimatedTax,
        orderTotal,
        appliedPromo,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        applyPromoCode,
        removePromoCode
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
