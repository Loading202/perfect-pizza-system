-- Tabela de categorias de pizza
CREATE TABLE public.pizza_categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de pizzas
CREATE TABLE public.pizzas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  category_id UUID REFERENCES public.pizza_categories(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  image_url TEXT,
  is_available BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de pedidos
CREATE TABLE public.orders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_address TEXT NOT NULL,
  total_amount DECIMAL(10,2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de itens do pedido
CREATE TABLE public.order_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  pizza_id UUID NOT NULL REFERENCES public.pizzas(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.pizza_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pizzas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- Políticas públicas (sistema de pizzaria sem login obrigatório para clientes)
CREATE POLICY "Categorias visíveis para todos" ON public.pizza_categories FOR SELECT USING (true);
CREATE POLICY "Pizzas visíveis para todos" ON public.pizzas FOR SELECT USING (true);
CREATE POLICY "Clientes podem criar pedidos" ON public.orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Pedidos visíveis para todos" ON public.orders FOR SELECT USING (true);
CREATE POLICY "Clientes podem adicionar itens" ON public.order_items FOR INSERT WITH CHECK (true);
CREATE POLICY "Itens visíveis para todos" ON public.order_items FOR SELECT USING (true);

-- Inserir categorias padrão
INSERT INTO public.pizza_categories (name, description) VALUES
  ('Tradicionais', 'As clássicas que todo mundo ama'),
  ('Especiais', 'Combinações exclusivas da casa'),
  ('Premium', 'Ingredientes selecionados'),
  ('Doces', 'Para fechar com chave de ouro');

-- Inserir pizzas de exemplo
INSERT INTO public.pizzas (category_id, name, description, price, is_available) VALUES
  ((SELECT id FROM pizza_categories WHERE name = 'Tradicionais'), 'Margherita', 'Molho de tomate, mussarela, manjericão fresco e azeite', 45.90, true),
  ((SELECT id FROM pizza_categories WHERE name = 'Tradicionais'), 'Calabresa', 'Molho de tomate, calabresa fatiada, cebola e azeitonas', 42.90, true),
  ((SELECT id FROM pizza_categories WHERE name = 'Tradicionais'), 'Portuguesa', 'Molho de tomate, presunto, ovos, cebola, azeitonas e mussarela', 48.90, true),
  ((SELECT id FROM pizza_categories WHERE name = 'Tradicionais'), 'Quatro Queijos', 'Molho de tomate, mussarela, provolone, parmesão e gorgonzola', 52.90, true),
  ((SELECT id FROM pizza_categories WHERE name = 'Especiais'), 'Frango com Catupiry', 'Molho de tomate, frango desfiado, catupiry e milho', 49.90, true),
  ((SELECT id FROM pizza_categories WHERE name = 'Especiais'), 'Bacon Supreme', 'Molho de tomate, bacon crocante, mussarela e cheddar', 54.90, true),
  ((SELECT id FROM pizza_categories WHERE name = 'Premium'), 'Filé Mignon', 'Molho de tomate, filé mignon em tiras, champignon e mussarela especial', 68.90, true),
  ((SELECT id FROM pizza_categories WHERE name = 'Premium'), 'Camarão', 'Molho de tomate, camarões, catupiry e alho poró', 72.90, true),
  ((SELECT id FROM pizza_categories WHERE name = 'Doces'), 'Chocolate com Morango', 'Chocolate ao leite, morangos frescos e leite condensado', 38.90, true),
  ((SELECT id FROM pizza_categories WHERE name = 'Doces'), 'Banana com Canela', 'Banana caramelizada, canela, açúcar e leite condensado', 35.90, true);