
import React, { createContext, useContext, useMemo } from 'react';
import useLocalStorage from '../hooks/useLocalStorage';
import type { CartItem, MenuItem } from '../types';

interface CartContextType {
  cart: CartItem[];
  addToCart: (item: MenuItem) => void;
  addToCartAdvanced: (item: MenuItem, variantId: string, addOnIds: string[]) => void;
  removeFromCart: (cartId: string) => void;
  updateQuantity: (cartId: string, quantity: number) => void;
  clearCart: () => void;
  cartCount: number;
  cartTotal: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = useLocalStorage<CartItem[]>('rannaghar_cart', []);

  const addToCartAdvanced = (item: MenuItem, variantId: string, _addOnIds: string[]) => {
    const cartId = `${item.id}-${variantId}`;
    
    setCart((prev) => {
      const existing = prev.find(c => c.cartId === cartId);
      if (existing) {
        return prev.map(c => c.cartId === cartId ? { ...c, quantity: c.quantity + 1 } : c);
      }
      return [...prev, { ...item, quantity: 1, selectedVariantId: variantId, cartId } as CartItem];
    });
  };

  const addToCart = (item: MenuItem) => {
      const vId = item.variants?.[0]?.id || '';
      addToCartAdvanced(item, vId, []);
  }

  const removeFromCart = (cartId: string) => {
    setCart((prev) => prev.filter((item) => item.cartId !== cartId));
  };

  const updateQuantity = (cartId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(cartId);
    } else {
      setCart((prev) => prev.map((item) => (item.cartId === cartId ? { ...item, quantity } : item)));
    }
  };

  const clearCart = () => setCart([]);

  const getItemPrice = (item: CartItem) => {
      const vPrice = item.variants?.find(v => v.id === item.selectedVariantId)?.price || 0;
      return (item.basePrice || 0) + vPrice;
  };

  const cartCount = useMemo(() => cart.reduce((count, item) => count + item.quantity, 0), [cart]);
  
  const cartTotal = useMemo(() => {
    return cart.reduce((total, item) => total + getItemPrice(item) * item.quantity, 0);
  }, [cart]);

  return (
    <CartContext.Provider value={{ cart, addToCart, addToCartAdvanced, removeFromCart, updateQuantity, clearCart, cartCount, cartTotal }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = (): CartContextType => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
