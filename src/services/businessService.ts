
import { supabase } from "@/integrations/supabase/client";
import { 
  Business, 
  Income, 
  Expense, 
  mapBusinessFromRow, 
  mapIncomeFromRow, 
  mapExpenseFromRow 
} from "@/types/supabase";

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

export async function getIncomesByDateRange(from: Date, to: Date, businessId?: string): Promise<Income[]> {
  let query = supabase
    .from('incomes')
    .select('*')
    .gte('date', from.toISOString())
    .lte('date', to.toISOString());
    
  if (businessId && businessId !== 'all') {
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
    
  if (businessId && businessId !== 'all') {
    query = query.eq('business_id', businessId);
  }
    
  const { data, error } = await query;
    
  if (error) {
    console.error("Error fetching expenses by date range:", error);
    throw error;
  }
  
  return data.map(mapExpenseFromRow);
}
