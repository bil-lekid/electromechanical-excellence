import type { Product, Quote, QuoteItem } from '@/lib/store';
import type { Json } from './types';
type Table<Row, Insert = Partial<Row>, Update = Partial<Row>> = { Row: Row; Insert: Insert; Update: Update; Relationships: [] };
// Matches 20260914090000_storefront.sql. Regenerate after deployment.
export type StoreDatabase = {
  public: {
    Tables: {
      products: Table<Product, Omit<Product, 'id' | 'created_at' | 'updated_at'> & Partial<Pick<Product, 'id' | 'created_at' | 'updated_at'>>>;
      quote_requests: Table<Quote, never, Pick<Quote, 'status'>>;
      quote_items: Table<QuoteItem, never, never>;
    };
    Views: { [_ in never]: never };
    Functions: {
      is_admin: { Args: Record<string, never>; Returns: boolean };
      submit_quote: { Args: { _token: string; _contact: Json; _items: Json }; Returns: string };
    };
    Enums: { app_role: 'admin' | 'user' };
    CompositeTypes: { [_ in never]: never };
  };
};
