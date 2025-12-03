import { Plus, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Pizza } from '@/types/pizza';
import { useCart } from '@/contexts/CartContext';
import { cn } from '@/lib/utils';

interface PizzaCardProps {
  pizza: Pizza;
  index: number;
}

export function PizzaCard({ pizza, index }: PizzaCardProps) {
  const { addItem, items } = useCart();
  const inCart = items.find(item => item.pizza.id === pizza.id);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(price);
  };

  // Generate a placeholder pizza image based on the pizza name
  const getPlaceholderImage = (name: string) => {
    const images: Record<string, string> = {
      'Margherita': 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=400&h=300&fit=crop',
      'Calabresa': 'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=400&h=300&fit=crop',
      'Portuguesa': 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&h=300&fit=crop',
      'Quatro Queijos': 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400&h=300&fit=crop',
      'Frango com Catupiry': 'https://images.unsplash.com/photo-1593560708920-61dd98c46a4e?w=400&h=300&fit=crop',
      'Bacon Supreme': 'https://images.unsplash.com/photo-1571407970349-bc81e7e96d47?w=400&h=300&fit=crop',
      'Filé Mignon': 'https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?w=400&h=300&fit=crop',
      'Camarão': 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=400&h=300&fit=crop',
      'Chocolate com Morango': 'https://images.unsplash.com/photo-1481391032119-d89fee407e44?w=400&h=300&fit=crop',
      'Banana com Canela': 'https://images.unsplash.com/photo-1528137871618-79d2761e3fd5?w=400&h=300&fit=crop',
    };
    return images[name] || 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=400&h=300&fit=crop';
  };

  return (
    <Card 
      className={cn(
        "group overflow-hidden border-border/50 hover:border-primary/30 transition-all duration-500 hover:shadow-card animate-fade-in",
        !pizza.is_available && "opacity-60"
      )}
      style={{ animationDelay: `${index * 0.1}s` }}
    >
      <div className="relative overflow-hidden aspect-[4/3]">
        <img
          src={pizza.image_url || getPlaceholderImage(pizza.name)}
          alt={pizza.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        {!pizza.is_available && (
          <Badge className="absolute top-3 right-3 bg-destructive text-destructive-foreground">
            Indisponível
          </Badge>
        )}
        
        {inCart && (
          <Badge className="absolute top-3 left-3 bg-success text-success-foreground animate-scale-in">
            <ShoppingCart className="w-3 h-3 mr-1" />
            {inCart.quantity} no carrinho
          </Badge>
        )}
      </div>
      
      <CardContent className="p-4 md:p-5">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-display text-lg md:text-xl font-semibold text-foreground group-hover:text-primary transition-colors">
            {pizza.name}
          </h3>
          <span className="font-display text-xl md:text-2xl font-bold text-primary">
            {formatPrice(pizza.price)}
          </span>
        </div>
        
        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
          {pizza.description}
        </p>
        
        <Button
          variant={inCart ? "secondary" : "default"}
          className="w-full"
          onClick={() => addItem(pizza)}
          disabled={!pizza.is_available}
        >
          <Plus className="w-4 h-4 mr-2" />
          {inCart ? 'Adicionar mais' : 'Adicionar ao carrinho'}
        </Button>
      </CardContent>
    </Card>
  );
}
