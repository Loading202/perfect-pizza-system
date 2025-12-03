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

  const onSubmit = async () => {
    // ATENÇÃO: Usamos getValues() para garantir que pegamos o valor REAL do formulário neste exato momento
    const finalData = form.getValues();
    
    // Debug no Console (Aperte F12 no navegador e veja se os dados aparecem aqui)
    console.log("--- DADOS PARA ENVIO ---");
    console.log("Cliente:", finalData.name);
    console.log("Carrinho:", items);
    console.log("Total:", totalPrice);

    if (items.length === 0 || totalPrice === 0) {
      toast({
        title: "Carrinho Vazio ou Zerado",
        description: "Tente adicionar os itens novamente.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      // 1. PREPARAR A MENSAGEM (Síncrono, para não perder dados)
      const paymentLabels: Record<string, string> = {
        pix: 'PIX',
        card: 'Cartão',
        cash: 'Dinheiro',
      };

      // Monta a lista de itens linha por linha
      let itemsText = "";
      items.forEach(item => {
        itemsText += `• ${item.quantity}x ${item.pizza.name}\n`;
      });

      // 2. SALVAR NO BANCO
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          customer_name: finalData.name,
          customer_phone: finalData.phone,
          customer_address: finalData.address,
          total_amount: totalPrice,
          notes: finalData.notes || null,
          payment_method: finalData.paymentMethod,
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

      // 3. GERAR LINK FINAL (Com o ID gerado)
      const orderCode = order.id.slice(0, 8).toUpperCase();

      // Montagem do texto final
      const message = `*NOVO PEDIDO - PIZZARIA BELLA*\n\n` +
        `*Pedido:* #${orderCode}\n` +
        `*Cliente:* ${finalData.name}\n` +
        `*Tel:* ${finalData.phone}\n\n` +
        `*Itens:*\n${itemsText}\n` +
        `*Total:* ${formatPrice(totalPrice)}\n` +
        `*Pagamento:* ${paymentLabels[finalData.paymentMethod]}\n` +
        `*Endereço:* ${finalData.address}\n` +
        (finalData.notes ? `*Obs:* ${finalData.notes}\n` : '') +
        `\n_Pedido realizado via site_`;

      const whatsappUrl = new URL('https://api.whatsapp.com/send');
      whatsappUrl.searchParams.append('phone', WHATSAPP_NUMBER);
      whatsappUrl.searchParams.append('text', message);
      
      const finalLink = whatsappUrl.toString();

      // 4. LIMPAR E REDIRECIONAR
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
        title: "Erro ao processar",
        description: "Verifique sua conexão e tente novamente.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Wrapper simples para o handleSubmit chamar nossa função customizada
  const handleFormSubmit = form.handleSubmit(() => onSubmit());

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl">
            Finalizar Pedido
          </DialogTitle>
        </DialogHeader>

        {/* Resumo do Pedido */}
        <div className="bg-secondary/50 rounded-lg p-4 mb-6">
          <h3 className="font-semibold mb-3">Resumo do pedido</h3>
          {items.length === 0 ? (
            <div className="flex items-center gap-2 text-destructive mb-2">
              <AlertCircle className="w-4 h-4" />
              <span className="text-sm font-medium">Carrinho vazio (R$ 0,00)</span>
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
          <form onSubmit={handleFormSubmit} className="space-y-4">
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
                <p className="font-medium text-foreground">Confirmar Pedido</p>
                <p className="text-muted-foreground">
                  Você será redirecionado para o WhatsApp com os dados preenchidos.
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