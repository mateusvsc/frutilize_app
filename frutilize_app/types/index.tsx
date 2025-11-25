import { ReactNode } from 'react';

export interface Product {
  id: string;
  name: string;
  price: number;
  category: 'frutas' | 'legumes' | 'verduras' | 'bebidas' | 'outros';
  unit: string;
  emoji: string;
  available: boolean;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface CartState {
  items: CartItem[];
  addItem: (product: Product) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  getTotal: () => number;
  getTotalItems: () => number;
}

export interface Customer {
  id?: number;
  name: string;
  phone: string;
  address: string;
  neighborhood: string;
  reference?: string;
  createdAt?: string;
}

export interface Order {
  id?: number;
  customerId: number;
  items: string;
  total: number;
  paymentMethod: 'pix' | 'credit' | 'debit' | 'cash' | 'vr';
  changeFor?: number;
  status: 'pending' | 'confirmed' | 'delivered' | 'cancelled' | 'preparing';
  createdAt?: string;
}

export type PaymentMethod = 'pix' | 'credit' | 'debit' | 'cash' | 'vr';

export interface User {
  id?: number;
  username: string;
  email: string;
  password: string;
  role: 'admin' | 'user';
  createdAt?: string;
}

export interface UserSession {
  userId: number;
  username: string;
  role: 'admin' | 'user';
  loggedIn: boolean;
}

export interface DailyReportSchedule {
  id?: number;
  lastRun: string;
  enabled: boolean;
}