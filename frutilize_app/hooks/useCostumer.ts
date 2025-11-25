import { create } from 'zustand';
import { Customer } from '../types';
import { saveCustomer, getCustomerByPhone, getLastCustomer } from '../database/database';

interface CustomerState {
  customer: Customer | null;
  isLoading: boolean;
  setCustomer: (customer: Customer | null) => void;
  saveCustomer: (customerData: Omit<Customer, 'id' | 'createdAt'>) => Promise<number>;
  loadCustomerByPhone: (phone: string) => Promise<Customer | null>;
  loadLastCustomer: () => Promise<void>;
  clearCustomer: () => void;
}

export const useCustomer = create<CustomerState>((set, get) => ({
  customer: null,
  isLoading: false,

  setCustomer: (customer) => set({ customer }),

  saveCustomer: async (customerData) => {
    set({ isLoading: true });
    try {
      const customerId = await saveCustomer(customerData);
      const customer: Customer = {
        ...customerData,
        id: customerId,
        createdAt: new Date().toISOString(),
      };
      set({ customer, isLoading: false });
      return customerId;
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  loadCustomerByPhone: async (phone: string) => {
    set({ isLoading: true });
    try {
      const customer = await getCustomerByPhone(phone);
      set({ customer, isLoading: false });
      return customer;
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  loadLastCustomer: async () => {
    set({ isLoading: true });
    try {
      const customer = await getLastCustomer();
      set({ customer, isLoading: false });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  clearCustomer: () => set({ customer: null }),
}));