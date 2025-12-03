import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft, Check, Loader2, MapPin, Phone, User, CreditCard, Smartphone, Banknote, MessageCircle } from 'lucide-react';
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

const WHATSAPP_NUMBER = '5511999999999'; // Número do dono da pizzaria

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
  const [success, setSuccess] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);

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

  const generateWhatsAppMessage = (data: CheckoutFormData, orderCode: string) => {
    const paymentLabels: Record<string, string> = {
      pix: '💳 PIX',
      card: '💳 Cartão (na entrega)',
      cash: '💵 Dinheiro (na entrega)',
    };

    const itemsList = items
      .map(item => `  • ${item.quantity}x ${item.pizza.name} - ${formatPrice(item.pizza.price * item.quantity)}`)
      .join('\n');

    const message = `🍕 *NOVO PEDIDO - PIZZARIA BELLA*

📋 *Pedido #${orderCode}*

*Itens do Pedido:*
${itemsList}

💰 *Total: ${formatPrice(totalPrice)}*

*Forma de Pagamento:*
${paymentLabels[data.paymentMethod]}

👤 *Cliente:* ${data.name}
📞 *Telefone:* ${data.phone}
📍 *Endereço:* ${data.address}
${data.notes ? `\n📝 *Observações:* ${data.notes}` : ''}

---
Pedido realizado via site`;

    return encodeURIComponent(message);
  };

  const openWhatsApp = (data: CheckoutFormData, orderCode: string) => {
    const message = generateWhatsAppMessage(data, orderCode);
    const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${message}`;
    window.open(whatsappUrl, '_blank');
  };

  const onSubmit = async (data: CheckoutFormData) => {
    setLoading(true);

    try {
      // Create order
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

      // Create order items
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

      const orderCode = order.id.slice(0, 8).toUpperCase();
      setOrderId(order.id);
      setSuccess(true);
      
      // Open WhatsApp with order details
      openWhatsApp(data, orderCode);
      
      clearCart();
      form.reset();

      toast({
        title: "Pedido realizado!",
        description: "Abrindo WhatsApp para confirmar seu pedido.",
      });

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

  const handleClose = () => {
    setSuccess(false);
    setOrderId(null);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        {success ? (
          <div className="text-center py-8">
            <div className="w-20 h-20 rounded-full bg-success/20 flex items-center justify-center mx-auto mb-6 animate-scale-in">
              <Check className="w-10 h-10 text-success" />
            </div>
            <h2 className="font-display text-2xl font-bold text-foreground mb-2">
              Pedido Enviado!
            </h2>
            <p className="text-muted-foreground mb-4">
              Seu pedido foi registrado e enviado para nossa equipe via WhatsApp.
            </p>
            {orderId && (
              <p className="text-sm text-muted-foreground mb-4">
                Código do pedido: <span className="font-mono font-semibold">{orderId.slice(0, 8).toUpperCase()}</span>
              </p>
            )}
            
            <div className="bg-secondary/50 rounded-lg p-4 mb-6 text-left">
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <MessageCircle className="w-5 h-5 text-success" />
                Próximos passos:
              </h4>
              <ul className="text-sm text-muted-foreground space-y-2">
                <li>1. Confirme o pedido no WhatsApp</li>
                <li>2. Aguarde a confirmação do tempo de entrega</li>
                <li>3. Prepare o pagamento na forma escolhida</li>
              </ul>
            </div>

            <p className="text-lg font-semibold text-primary mb-6">
              Tempo estimado: 30-45 minutos
            </p>
            
            <div className="flex gap-3">
              <Button 
                variant="outline" 
                className="flex-1"
                onClick={() => {
                  const message = generateWhatsAppMessage(form.getValues(), orderId?.slice(0, 8).toUpperCase() || '');
                  window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${message}`, '_blank');
                }}
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                Reabrir WhatsApp
              </Button>
              <Button variant="hero" className="flex-1" onClick={handleClose}>
                Voltar ao cardápio
              </Button>
            </div>
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="font-display text-2xl">
                Finalizar Pedido
              </DialogTitle>
            </DialogHeader>

            {/* Order summary */}
            <div className="bg-secondary/50 rounded-lg p-4 mb-6">
              <h3 className="font-semibold mb-3">Resumo do pedido</h3>
              <div className="space-y-2 text-sm">
                {items.map(item => (
                  <div key={item.pizza.id} className="flex justify-between">
                    <span>{item.quantity}x {item.pizza.name}</span>
                    <span>{formatPrice(item.pizza.price * item.quantity)}</span>
                  </div>
                ))}
              </div>
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
                        <Input placeholder="João da Silva" {...field} />
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
                        <Input placeholder="(11) 99999-9999" {...field} />
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
                          placeholder="Rua, número, complemento, bairro, cidade"
                          className="resize-none"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Payment Method Selection */}
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
                          placeholder="Ex: Sem cebola, ponto da massa, troco para R$100..."
                          className="resize-none"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* WhatsApp info */}
                <div className="bg-success/10 border border-success/30 rounded-lg p-4 flex items-start gap-3">
                  <MessageCircle className="w-5 h-5 text-success mt-0.5" />
                  <div className="text-sm">
                    <p className="font-medium text-foreground">Envio via WhatsApp</p>
                    <p className="text-muted-foreground">
                      Ao confirmar, seu pedido será enviado diretamente para nosso WhatsApp.
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
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Enviando...
                      </>
                    ) : (
                      <>
                        <MessageCircle className="w-4 h-4 mr-2" />
                        Enviar pelo WhatsApp
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
