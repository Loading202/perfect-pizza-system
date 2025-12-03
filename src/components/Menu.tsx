import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { PizzaCard } from '@/components/PizzaCard';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Pizza, PizzaCategory } from '@/types/pizza';
import { cn } from '@/lib/utils';

export function Menu() {
  const [pizzas, setPizzas] = useState<Pizza[]>([]);
  const [categories, setCategories] = useState<PizzaCategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      
      const [pizzasRes, categoriesRes] = await Promise.all([
        supabase
          .from('pizzas')
          .select('*, pizza_categories(*)')
          .eq('is_available', true)
          .order('name'),
        supabase
          .from('pizza_categories')
          .select('*')
          .order('name'),
      ]);

      if (pizzasRes.data) {
        setPizzas(pizzasRes.data as Pizza[]);
      }
      if (categoriesRes.data) {
        setCategories(categoriesRes.data);
      }
      
      setLoading(false);
    }

    fetchData();
  }, []);

  const filteredPizzas = selectedCategory
    ? pizzas.filter(pizza => pizza.category_id === selectedCategory)
    : pizzas;

  if (loading) {
    return (
      <section id="menu" className="py-16 md:py-24 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <Skeleton className="h-10 w-64 mx-auto mb-4" />
            <Skeleton className="h-6 w-96 mx-auto" />
          </div>
          <div className="flex justify-center gap-3 mb-12">
            {[1, 2, 3, 4, 5].map(i => (
              <Skeleton key={i} className="h-10 w-24 rounded-full" />
            ))}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
              <div key={i} className="space-y-4">
                <Skeleton className="aspect-[4/3] rounded-lg" />
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="menu" className="py-16 md:py-24 bg-background">
      <div className="container mx-auto px-4">
        {/* Section header */}
        <div className="text-center mb-12">
          <h2 className="font-display text-3xl md:text-5xl font-bold text-foreground mb-4">
            Nosso <span className="text-gradient">Cardápio</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Escolha entre nossas deliciosas pizzas artesanais, preparadas com ingredientes frescos e muito carinho.
          </p>
        </div>

        {/* Category filters */}
        <div className="flex flex-wrap justify-center gap-2 md:gap-3 mb-12">
          <Button
            variant={selectedCategory === null ? "default" : "secondary"}
            size="sm"
            onClick={() => setSelectedCategory(null)}
            className="rounded-full"
          >
            Todas
          </Button>
          {categories.map(category => (
            <Button
              key={category.id}
              variant={selectedCategory === category.id ? "default" : "secondary"}
              size="sm"
              onClick={() => setSelectedCategory(category.id)}
              className="rounded-full"
            >
              {category.name}
            </Button>
          ))}
        </div>

        {/* Pizza grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredPizzas.map((pizza, index) => (
            <PizzaCard key={pizza.id} pizza={pizza} index={index} />
          ))}
        </div>

        {filteredPizzas.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg">
              Nenhuma pizza encontrada nesta categoria.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
