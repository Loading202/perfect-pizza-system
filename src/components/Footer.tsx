import { Pizza, Phone, MapPin, Clock, Instagram, Facebook } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-foreground text-primary-foreground">
      <div className="container mx-auto px-4 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full gradient-hero flex items-center justify-center">
                <Pizza className="w-7 h-7 text-primary-foreground" />
              </div>
              <div>
                <h3 className="font-display text-2xl font-bold">
                  Pizzaria Bella
                </h3>
              </div>
            </div>
            <p className="text-primary-foreground/70 mb-4">
              Desde 1985 servindo as melhores pizzas artesanais da cidade. 
              Tradição, qualidade e sabor em cada fatia.
            </p>
            <div className="flex gap-4">
              <a 
                href="#" 
                className="w-10 h-10 rounded-full bg-primary-foreground/10 flex items-center justify-center hover:bg-primary transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a 
                href="#" 
                className="w-10 h-10 rounded-full bg-primary-foreground/10 flex items-center justify-center hover:bg-primary transition-colors"
                aria-label="Facebook"
              >
                <Facebook className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-display text-lg font-semibold mb-4">Contato</h4>
            <ul className="space-y-3">
              <li>
                <a 
                  href="tel:+5511999999999" 
                  className="flex items-center gap-3 text-primary-foreground/70 hover:text-primary transition-colors"
                >
                  <Phone className="w-5 h-5" />
                  (11) 99999-9999
                </a>
              </li>
              <li>
                <a 
                  href="https://wa.me/5511999999999" 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 text-primary-foreground/70 hover:text-primary transition-colors"
                >
                  <Phone className="w-5 h-5" />
                  WhatsApp
                </a>
              </li>
            </ul>
          </div>

          {/* Address */}
          <div>
            <h4 className="font-display text-lg font-semibold mb-4">Localização</h4>
            <div className="flex items-start gap-3 text-primary-foreground/70">
              <MapPin className="w-5 h-5 mt-0.5 flex-shrink-0" />
              <p>
                Rua das Pizzas, 123<br />
                Centro - São Paulo/SP<br />
                CEP: 01234-567
              </p>
            </div>
          </div>

          {/* Hours */}
          <div>
            <h4 className="font-display text-lg font-semibold mb-4">Horário</h4>
            <div className="flex items-start gap-3 text-primary-foreground/70">
              <Clock className="w-5 h-5 mt-0.5 flex-shrink-0" />
              <div>
                <p className="mb-2">
                  <span className="font-medium text-primary-foreground">Seg a Sex:</span><br />
                  18:00 - 23:00
                </p>
                <p>
                  <span className="font-medium text-primary-foreground">Sáb e Dom:</span><br />
                  18:00 - 00:00
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-primary-foreground/20 mt-12 pt-8 text-center text-primary-foreground/50 text-sm">
          <p>© {new Date().getFullYear()} Pizzaria Bella. Todos os direitos reservados.</p>
        </div>
      </div>
    </footer>
  );
}
