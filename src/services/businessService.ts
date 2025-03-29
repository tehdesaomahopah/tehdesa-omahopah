
import { supabase } from "@/integrations/supabase/client";
import { 
  Business, 
  Income, 
  Expense, 
  mapBusinessFromRow, 
  mapIncomeFromRow, 
  mapExpenseFromRow 
} from "@/types/supabase";

// Helper to validate UUID format
const isValidUUID = (id: string): boolean => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(id);
};

export async function getBusinesses(): Promise<Business[]> {
  const { data, error } = await supabase
    .from('businesses')
    .select('*');
    
  if (error) {
    console.error("Error fetching businesses:", error);
    throw error;
  }
  
  return data.map(mapBusinessFromRow);
}

export async function getBusinessById(id: string): Promise<Business | null> {
  if (!isValidUUID(id)) {
    console.warn(`Invalid business ID format: ${id}`);
    return null;
  }

  const { data, error } = await supabase
    .from('businesses')
    .select('*')
    .eq('id', id)
    .single();
    
  if (error) {
    if (error.code === 'PGRST116') {
      return null; // No data found
    }
    console.error("Error fetching business:", error);
    throw error;
  }
  
  return mapBusinessFromRow(data);
}

export async function getIncomesByBusinessId(businessId: string): Promise<Income[]> {
  if (!isValidUUID(businessId)) {
    console.warn(`Invalid business ID format: ${businessId}`);
    return [];
  }

  const { data, error } = await supabase
    .from('incomes')
    .select('*')
    .eq('business_id', businessId);
    
  if (error) {
    console.error("Error fetching incomes:", error);
    throw error;
  }
  
  return data.map(mapIncomeFromRow);
}

export async function getExpensesByBusinessId(businessId: string): Promise<Expense[]> {
  if (!isValidUUID(businessId)) {
    console.warn(`Invalid business ID format: ${businessId}`);
    return [];
  }

  const { data, error } = await supabase
    .from('expenses')
    .select('*')
    .eq('business_id', businessId);
    
  if (error) {
    console.error("Error fetching expenses:", error);
    throw error;
  }
  
  return data.map(mapExpenseFromRow);
}

export async function addIncome(income: {
  businessId: string;
  date: Date;
  type: string;
  description: string;
  amount: number;
}): Promise<Income> {
  if (!isValidUUID(income.businessId)) {
    throw new Error(`Invalid business ID format: ${income.businessId}`);
  }

  const { data, error } = await supabase
    .from('incomes')
    .insert([{
      business_id: income.businessId,
      date: income.date.toISOString(),
      type: income.type,
      description: income.description,
      amount: income.amount
    }])
    .select()
    .single();
    
  if (error) {
    console.error("Error adding income:", error);
    throw error;
  }
  
  return mapIncomeFromRow(data);
}

export async function addExpense(expense: {
  businessId: string;
  date: Date;
  type: string;
  description: string;
  amount: number;
}): Promise<Expense> {
  if (!isValidUUID(expense.businessId)) {
    throw new Error(`Invalid business ID format: ${expense.businessId}`);
  }

  const { data, error } = await supabase
    .from('expenses')
    .insert([{
      business_id: expense.businessId,
      date: expense.date.toISOString(),
      type: expense.type,
      description: expense.description,
      amount: expense.amount
    }])
    .select()
    .single();
    
  if (error) {
    console.error("Error adding expense:", error);
    throw error;
  }
  
  return mapExpenseFromRow(data);
}

export async function getIncomesByDateRange(from: Date, to: Date, businessId?: string): Promise<Income[]> {
  let query = supabase
    .from('incomes')
    .select('*')
    .gte('date', from.toISOString())
    .lte('date', to.toISOString());
    
  if (businessId && businessId !== 'all' && isValidUUID(businessId)) {
    query = query.eq('business_id', businessId);
  }
    
  const { data, error } = await query;
    
  if (error) {
    console.error("Error fetching incomes by date range:", error);
    throw error;
  }
  
  return data.map(mapIncomeFromRow);
}

export async function getExpensesByDateRange(from: Date, to: Date, businessId?: string): Promise<Expense[]> {
  let query = supabase
    .from('expenses')
    .select('*')
    .gte('date', from.toISOString())
    .lte('date', to.toISOString());
    
  if (businessId && businessId !== 'all' && isValidUUID(businessId)) {
    query = query.eq('business_id', businessId);
  }
    
  const { data, error } = await query;
    
  if (error) {
    console.error("Error fetching expenses by date range:", error);
    throw error;
  }
  
  return data.map(mapExpenseFromRow);
}
