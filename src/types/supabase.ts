

import { Database } from "@/integrations/supabase/types";

// Type for businesses table from Supabase
export type BusinessRow = Database['public']['Tables']['businesses']['Row'];

// Type for incomes table from Supabase
export type IncomeRow = Database['public']['Tables']['incomes']['Row'];

// Type for expenses table from Supabase
export type ExpenseRow = Database['public']['Tables']['expenses']['Row'];

// Mapped types that convert from Supabase format to our application format
export interface Business {
  id: string;
  name: string;
  image: string;
  createdAt: Date;
}

export interface Income {
  id: string;
  businessId: string;
  date: Date;
  type: string;
  description: string;
  amount: number;
  createdAt: Date;
}

export interface Expense {
  id: string;
  businessId: string;
  date: Date;
  type: string;
  description: string;
  amount: number;
  createdAt: Date;
}

// Conversion functions
export function mapBusinessFromRow(row: BusinessRow): Business {
  return {
    id: row.id,
    name: row.name,
    image: row.image,
    createdAt: new Date(row.created_at)
  };
}

export function mapIncomeFromRow(row: IncomeRow): Income {
  return {
    id: row.id,
    businessId: row.business_id,
    date: new Date(row.date),
    type: row.type,
    description: row.description,
    amount: Number(row.amount),
    createdAt: new Date(row.created_at)
  };
}

export function mapExpenseFromRow(row: ExpenseRow): Expense {
  return {
    id: row.id,
    businessId: row.business_id,
    date: new Date(row.date),
    type: row.type,
    description: row.description,
    amount: Number(row.amount),
    createdAt: new Date(row.created_at)
  };
}
