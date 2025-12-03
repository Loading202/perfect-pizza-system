-- Adicionar coluna de método de pagamento
ALTER TABLE public.orders ADD COLUMN payment_method TEXT NOT NULL DEFAULT 'pix';

-- Atualizar pedidos existentes
UPDATE public.orders SET payment_method = 'pix' WHERE payment_method IS NULL;