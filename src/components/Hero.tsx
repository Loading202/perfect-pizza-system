import { ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function Hero() {
  const scrollToMenu = () => {
    document.getElementById('menu')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="relative min-h-[70vh] md:min-h-[80vh] flex items-center justify-center overflow-hidden">
      {/* Background with overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1513104890138-7c749659a591?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80')`,
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-foreground/70 via-foreground/50 to-background" />
      </div>

      {/* Decorative elements */}
      <div className="absolute top-20 left-10 w-32 h-32 rounded-full bg-primary/20 blur-3xl animate-pulse-slow" />
      <div className="absolute bottom-20 right-10 w-40 h-40 rounded-full bg-accent/20 blur-3xl animate-pulse-slow" />

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 text-center">
        <div className="animate-slide-up">
          <span className="inline-block px-4 py-2 mb-6 text-sm font-medium tracking-wider uppercase bg-primary/20 text-primary-foreground rounded-full border border-primary-foreground/20 backdrop-blur-sm">
            🍕 Tradição desde 1985
          </span>
        </div>
        
        <h2 className="animate-slide-up font-display text-4xl md:text-6xl lg:text-7xl font-bold text-primary-foreground mb-6 leading-tight" style={{ animationDelay: '0.1s' }}>
          Sabor que conquista,<br />
          <span className="text-primary">qualidade</span> que encanta
        </h2>
        
        <p className="animate-slide-up text-lg md:text-xl text-primary-foreground/80 mb-8 max-w-2xl mx-auto" style={{ animationDelay: '0.2s' }}>
          Pizzas artesanais feitas com ingredientes frescos e muito amor.
          Delivery rápido para toda a região.
        </p>
        
        <div className="animate-slide-up flex flex-col sm:flex-row gap-4 justify-center" style={{ animationDelay: '0.3s' }}>
          <Button variant="hero" size="xl" onClick={scrollToMenu}>
            Ver Cardápio
          </Button>
          <Button variant="outline" size="xl" className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground">
            Ligar Agora
          </Button>
        </div>
      </div>

      {/* Scroll indicator */}
      <button 
        onClick={scrollToMenu}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 text-primary-foreground/60 hover:text-primary-foreground transition-colors animate-bounce-subtle"
        aria-label="Rolar para o menu"
      >
        <ChevronDown className="w-8 h-8" />
      </button>
    </section>
  );
}
