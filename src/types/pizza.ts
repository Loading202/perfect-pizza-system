export interface PizzaCategory {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
}

export interface Pizza {
  id: string;
  category_id: string | null;
  name: string;
  description: string | null;
  price: number;
  image_url: string | null;
  is_available: boolean;
  created_at: string;
  pizza_categories?: PizzaCategory;
}

export interface CartItem {
  pizza: Pizza;
  quantity: number;
}

export interface Order {
  id: string;
  customer_name: string;
  customer_phone: string;
  customer_address: string;
  total_amount: number;
  status: string;
  notes: string | null;
  created_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  pizza_id: string;
  quantity: number;
  unit_price: number;
  created_at: string;
}
