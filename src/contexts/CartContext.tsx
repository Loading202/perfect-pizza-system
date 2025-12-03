import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { Pizza, CartItem } from '@/types/pizza';
import { toast } from '@/hooks/use-toast';

interface CartContextType {
  items: CartItem[];
  addItem: (pizza: Pizza) => void;
  removeItem: (pizzaId: string) => void;
  updateQuantity: (pizzaId: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  const addItem = useCallback((pizza: Pizza) => {
    setItems(currentItems => {
      const existingItem = currentItems.find(item => item.pizza.id === pizza.id);
      
      if (existingItem) {
        toast({
          title: "Quantidade atualizada",
          description: `${pizza.name} agora tem ${existingItem.quantity + 1} unidades`,
        });
        return currentItems.map(item =>
          item.pizza.id === pizza.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      
      toast({
        title: "Adicionado ao carrinho",
        description: `${pizza.name} foi adicionada ao carrinho`,
      });
      return [...currentItems, { pizza, quantity: 1 }];
    });
  }, []);

  const removeItem = useCallback((pizzaId: string) => {
    setItems(currentItems => currentItems.filter(item => item.pizza.id !== pizzaId));
  }, []);

  const updateQuantity = useCallback((pizzaId: string, quantity: number) => {
    if (quantity < 1) {
      removeItem(pizzaId);
      return;
    }
    setItems(currentItems =>
      currentItems.map(item =>
        item.pizza.id === pizzaId ? { ...item, quantity } : item
      )
    );
  }, [removeItem]);

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = items.reduce((sum, item) => sum + item.pizza.price * item.quantity, 0);

  return (
    <CartContext.Provider value={{
      items,
      addItem,
      removeItem,
      updateQuantity,
      clearCart,
      totalItems,
      totalPrice,
    }}>
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
