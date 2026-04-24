import React, { createContext, useContext, useState, useEffect } from "react";

export interface CartItem {
  _id: string;
  name: string;
  price: number;
  college: string;
  category?: string;
  date?: string;
  venue?: string;
}

interface CartContextType {
  cart: CartItem[];
  addToCart: (event: CartItem) => boolean; // returns true if added, false if already in cart
  removeFromCart: (id: string) => void;
  clearCart: () => void;
  isInCart: (id: string) => boolean;
  total: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<CartItem[]>([]);

  useEffect(() => {
    const savedCart = localStorage.getItem("cart");
    if (savedCart) {
      try { setCart(JSON.parse(savedCart)); } catch {}
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart]);

  const isInCart = (id: string) => cart.some(i => i._id === id);

  const addToCart = (event: CartItem): boolean => {
    if (isInCart(event._id)) return false;
    setCart(prev => [...prev, event]);
    return true;
  };

  const removeFromCart = (id: string) => {
    setCart(prev => prev.filter(i => i._id !== id));
  };

  const clearCart = () => setCart([]);

  const total = cart.reduce((sum, item) => sum + (item.price || 0), 0);

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, clearCart, isInCart, total }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) throw new Error("useCart must be used within a CartProvider");
  return context;
};
