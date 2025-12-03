import { useState } from 'react';
import { CartProvider } from '@/contexts/CartContext';
import { Header } from '@/components/Header';
import { Hero } from '@/components/Hero';
import { Menu } from '@/components/Menu';
import { Cart } from '@/components/Cart';
import { CheckoutForm } from '@/components/CheckoutForm';
import { Footer } from '@/components/Footer';

function IndexContent() {
  const [cartOpen, setCartOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);

  const handleCheckout = () => {
    setCartOpen(false);
    setCheckoutOpen(true);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header onCartClick={() => setCartOpen(true)} />
      <main className="flex-1">
        <Hero />
        <Menu />
      </main>
      <Footer />
      
      <Cart 
        open={cartOpen} 
        onOpenChange={setCartOpen}
        onCheckout={handleCheckout}
      />
      
      <CheckoutForm 
        open={checkoutOpen}
        onOpenChange={setCheckoutOpen}
      />
    </div>
  );
}

const Index = () => {
  return (
    <CartProvider>
      <IndexContent />
    </CartProvider>
  );
};

export default Index;
