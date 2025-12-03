import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft, Loader2, MapPin, Phone, User, CreditCard, Smartphone, Banknote, MessageCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { useCart } from '@/contexts/CartContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

const WHATSAPP_NUMBER = '5583986696637';

const checkoutSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres').max(100),
  phone: z.string().min(10, 'Telefone inválido').max(20),
  address: z.string().min(10, 'Endereço deve ser mais detalhado').max(500),
  notes: z.string().max(500).optional(),
  paymentMethod: z.enum(['pix', 'card', 'cash'], {
    required_error: 'Selecione uma forma de pagamento',
  }),
});

type CheckoutFormData = z.infer<typeof checkoutSchema>;

interface CheckoutFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const paymentMethods = [
  {
    id: 'pix',
    name: 'PIX',
    description: 'Pagamento instantâneo',
    icon: Smartphone,
  },
  {
    id: 'card',
    name: 'Cartão',
    description: 'Débito ou crédito na entrega',
    icon: CreditCard,
  },
  {
    id: 'cash',
    name: 'Dinheiro',
    description: 'Pagamento na entrega',
    icon: Banknote,
  },
];

export function CheckoutForm({ open, onOpenChange }: CheckoutFormProps) {
  const { items, totalPrice, clearCart } = useCart();
  const [loading, setLoading] = useState(false);

  const form = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      name: '',
      phone: '',
      address: '',
      notes: '',
      paymentMethod: 'pix',
    },
  });

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(price);
  };

  const onSubmit = async (data: CheckoutFormData) => {
    // TRAVA DE SEGURANÇA 1: Verifica se o carrinho tem itens
    if (items.length === 0 || totalPrice === 0) {
      toast({
        title: "Carrinho Vazio",
        description: "Adicione itens antes de finalizar.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      // ---------------------------------------------------------
      // PASSO 1: GERAR O LINK DO WHATSAPP PRIMEIRO (Antes de tudo)
      // Isso garante que os dados usados são os atuais, antes de qualquer limpeza
      // ---------------------------------------------------------
      const paymentLabels: Record<string, string> = {
        pix: 'PIX',
        card: 'Cartão',
        cash: 'Dinheiro',
      };

      // Vamos usar um placeholder para o ID do pedido e substituir depois
      // ou apenas usar "Gerando..." se der erro no banco, mas aqui garantimos o texto
      let messageBase = `*NOVO PEDIDO - PIZZARIA BELLA*\n\n`;
      // O ID será inserido depois
      
      let messageContent = `*Cliente:* ${data.name}\n`;
      messageContent += `*Tel:* ${data.phone}\n\n`;
      
      messageContent += `*Itens:*\n`;
      items.forEach(item => {
        messageContent += `• ${item.quantity}x ${item.pizza.name}\n`;
      });

      messageContent += `\n*Total:* ${formatPrice(totalPrice)}\n`;
      messageContent += `*Pagamento:* ${paymentLabels[data.paymentMethod]}\n`;
      messageContent += `*Endereço:* ${data.address}`;
      
      if (data.notes) {
        messageContent += `\n*Obs:* ${data.notes}`;
      }
      
      messageContent += `\n\n_Pedido realizado via site_`;

      // ---------------------------------------------------------
      // PASSO 2: SALVAR NO BANCO DE DADOS
      // ---------------------------------------------------------
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          customer_name: data.name,
          customer_phone: data.phone,
          customer_address: data.address,
          total_amount: totalPrice,
          notes: data.notes || null,
          payment_method: data.paymentMethod,
        })
        .select()
        .single();

      if (orderError) throw orderError;

      const orderItems = items.map(item => ({
        order_id: order.id,
        pizza_id: item.pizza.id,
        quantity: item.quantity,
        unit_price: item.pizza.price,
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) throw itemsError;

      // ---------------------------------------------------------
      // PASSO 3: FINALIZAR O LINK COM O ID GERADO
      // ---------------------------------------------------------
      const orderCode = order.id.slice(0, 8).toUpperCase();
      const finalMessage = `${messageBase}*Pedido:* #${orderCode}\n${messageContent}`;

      const whatsappUrl = new URL('https://api.whatsapp.com/send');
      whatsappUrl.searchParams.append('phone', WHATSAPP_NUMBER);
      whatsappUrl.searchParams.append('text', finalMessage);
      
      const finalLink = whatsappUrl.toString();

      // ---------------------------------------------------------
      // PASSO 4: LIMPEZA E REDIRECIONAMENTO
      // ---------------------------------------------------------
      
      // Limpa carrinho SÓ AGORA
      clearCart();
      form.reset();

      toast({
        title: "Sucesso!",
        description: "Abrindo WhatsApp...",
        duration: 2000,
      });

      setTimeout(() => {
        window.location.href = finalLink;
        onOpenChange(false);
      }, 500);

    } catch (error) {
      console.error('Error creating order:', error);
      toast({
        title: "Erro ao fazer pedido",
        description: "Tente novamente mais tarde.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl">
            Finalizar Pedido
          </DialogTitle>
        </DialogHeader>

        {/* Resumo do Pedido com Aviso se Vazio */}
        <div className="bg-secondary/50 rounded-lg p-4 mb-6">
          <h3 className="font-semibold mb-3">Resumo do pedido</h3>
          {items.length === 0 ? (
            <div className="flex items-center gap-2 text-destructive mb-2">
              <AlertCircle className="w-4 h-4" />
              <span className="text-sm font-medium">Seu carrinho está vazio!</span>
            </div>
          ) : (
            <div className="space-y-2 text-sm">
              {items.map(item => (
                <div key={item.pizza.id} className="flex justify-between">
                  <span>{item.quantity}x {item.pizza.name}</span>
                  <span>{formatPrice(item.pizza.price * item.quantity)}</span>
                </div>
              ))}
            </div>
          )}
          <div className="border-t border-border mt-3 pt-3 flex justify-between font-bold">
            <span>Total</span>
            <span className="text-primary">{formatPrice(totalPrice)}</span>
          </div>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Nome completo
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="Seu nome" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    Telefone / WhatsApp
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="(83) 99999-9999" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    Endereço de entrega
                  </FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Rua, número, bairro..."
                      className="resize-none"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="paymentMethod"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2 mb-3">
                    <CreditCard className="w-4 h-4" />
                    Forma de Pagamento
                  </FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="grid grid-cols-1 gap-3"
                    >
                      {paymentMethods.map(method => (
                        <div key={method.id}>
                          <RadioGroupItem
                            value={method.id}
                            id={method.id}
                            className="peer sr-only"
                          />
                          <Label
                            htmlFor={method.id}
                            className="flex items-center gap-4 p-4 rounded-lg border-2 border-border cursor-pointer transition-all hover:bg-secondary/50 peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5"
                          >
                            <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center">
                              <method.icon className="w-5 h-5 text-primary" />
                            </div>
                            <div>
                              <p className="font-semibold text-foreground">{method.name}</p>
                              <p className="text-sm text-muted-foreground">{method.description}</p>
                            </div>
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Observações (opcional)</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Ex: Sem cebola..."
                      className="resize-none"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="bg-success/10 border border-success/30 rounded-lg p-4 flex items-start gap-3">
              <MessageCircle className="w-5 h-5 text-success mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-foreground">Confirmar e ir para WhatsApp</p>
                <p className="text-muted-foreground">
                  Ao clicar abaixo, você será redirecionado automaticamente.
                </p>
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button 
                type="button" 
                variant="outline" 
                className="flex-1"
                onClick={() => onOpenChange(false)}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar
              </Button>
              <Button 
                type="submit" 
                variant="hero" 
                className="flex-1"
                // Desabilita se estiver carregando OU se carrinho vazio
                disabled={loading || items.length === 0} 
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Processando...
                  </>
                ) : (
                  <>
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Enviar Pedido
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}