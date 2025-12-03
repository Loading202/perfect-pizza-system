import { ShoppingCart, Pizza, Phone, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCart } from '@/contexts/CartContext';
import { Badge } from '@/components/ui/badge';

interface HeaderProps {
  onCartClick: () => void;
}

export function Header({ onCartClick }: HeaderProps) {
  const { totalItems } = useCart();

  return (
    <header className="sticky top-0 z-50 bg-card/95 backdrop-blur-md border-b border-border shadow-soft">
      <div className="container mx-auto px-4">
        {/* Top bar - contact info */}
        <div className="hidden md:flex items-center justify-between py-2 text-sm text-muted-foreground border-b border-border/50">
          <div className="flex items-center gap-6">
            <a href="tel:+5511999999999" className="flex items-center gap-2 hover:text-primary transition-colors">
              <Phone className="w-4 h-4" />
              (11) 99999-9999
            </a>
            <span className="flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              Rua das Pizzas, 123 - São Paulo
            </span>
          </div>
          <div className="text-muted-foreground">
            <span className="text-success font-medium">● Aberto agora</span> | Fecha às 23:00
          </div>
        </div>
        
        {/* Main header */}
        <div className="flex items-center justify-between py-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full gradient-hero flex items-center justify-center shadow-glow">
              <Pizza className="w-7 h-7 text-primary-foreground" />
            </div>
            <div>
              <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground">
                Pizzaria <span className="text-gradient">Bella</span>
              </h1>
              <p className="text-xs md:text-sm text-muted-foreground">A melhor pizza da cidade</p>
            </div>
          </div>
          
          <Button 
            variant="outline" 
            size="lg" 
            onClick={onCartClick}
            className="relative"
          >
            <ShoppingCart className="w-5 h-5" />
            <span className="hidden sm:inline ml-2">Carrinho</span>
            {totalItems > 0 && (
              <Badge 
                className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0 flex items-center justify-center bg-accent text-accent-foreground text-xs font-bold animate-bounce-subtle"
              >
                {totalItems}
              </Badge>
            )}
          </Button>
        </div>
      </div>
    </header>
  );
}
