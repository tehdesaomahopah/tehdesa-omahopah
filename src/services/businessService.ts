
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

// Helper for date handling that preserves the exact date without timezone issues
const formatDateForServer = (date: Date): string => {
  // Format as YYYY-MM-DD to avoid timezone issues
  return date.toISOString().split('T')[0];
};

// Helper to get business by name
export async function getBusinessByName(name: string): Promise<Business | null> {
  // Remove "Teh Desa " prefix if present to match with names like "shaquilla" vs "Teh Desa Shaquilla"
  const searchName = name.replace(/^Teh Desa /i, "");
  
  const { data, error } = await supabase
    .from('businesses')
    .select('*')
    .ilike('name', `%${searchName}%`)
    .single();
    
  if (error) {
    if (error.code === 'PGRST116') {
      return null; // No data found
    }
    console.error("Error fetching business by name:", error);
    throw error;
  }
  
  return mapBusinessFromRow(data);
}

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
    // Try to get business by name instead
    return getBusinessByName(id);
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
  // If not a valid UUID, try to get the business first
  if (!isValidUUID(businessId)) {
    const business = await getBusinessByName(businessId);
    if (!business) {
      console.warn(`Business not found with name: ${businessId}`);
      return [];
    }
    businessId = business.id;
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
  // If not a valid UUID, try to get the business first
  if (!isValidUUID(businessId)) {
    const business = await getBusinessByName(businessId);
    if (!business) {
      console.warn(`Business not found with name: ${businessId}`);
      return [];
    }
    businessId = business.id;
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
  // If not a valid UUID, try to get the business first
  if (!isValidUUID(income.businessId)) {
    const business = await getBusinessByName(income.businessId);
    if (!business) {
      throw new Error(`Business not found with name: ${income.businessId}`);
    }
    income.businessId = business.id;
  }

  // Use YYYY-MM-DD format to avoid timezone issues
  const formattedDate = formatDateForServer(income.date);
  
  const { data, error } = await supabase
    .from('incomes')
    .insert([{
      business_id: income.businessId,
      date: formattedDate,
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
  // If not a valid UUID, try to get the business first
  if (!isValidUUID(expense.businessId)) {
    const business = await getBusinessByName(expense.businessId);
    if (!business) {
      throw new Error(`Business not found with name: ${expense.businessId}`);
    }
    expense.businessId = business.id;
  }

  // Use YYYY-MM-DD format to avoid timezone issues
  const formattedDate = formatDateForServer(expense.date);
  
  const { data, error } = await supabase
    .from('expenses')
    .insert([{
      business_id: expense.businessId,
      date: formattedDate,
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
  // Format dates to avoid timezone issues
  const formattedFromDate = formatDateForServer(from);
  const formattedToDate = formatDateForServer(to);
  
  let query = supabase
    .from('incomes')
    .select('*')
    .gte('date', formattedFromDate)
    .lte('date', formattedToDate);
    
  if (businessId) {
    if (businessId !== 'all') {
      // If not a valid UUID, try to get the business first
      if (!isValidUUID(businessId)) {
        const business = await getBusinessByName(businessId);
        if (business) {
          businessId = business.id;
        } else {
          return []; // No business found
        }
      }
      query = query.eq('business_id', businessId);
    }
  }
    
  const { data, error } = await query;
    
  if (error) {
    console.error("Error fetching incomes by date range:", error);
    throw error;
  }
  
  return data.map(mapIncomeFromRow);
}

export async function getExpensesByDateRange(from: Date, to: Date, businessId?: string): Promise<Expense[]> {
  // Format dates to avoid timezone issues
  const formattedFromDate = formatDateForServer(from);
  const formattedToDate = formatDateForServer(to);
  
  let query = supabase
    .from('expenses')
    .select('*')
    .gte('date', formattedFromDate)
    .lte('date', formattedToDate);
    
  if (businessId) {
    if (businessId !== 'all') {
      // If not a valid UUID, try to get the business first
      if (!isValidUUID(businessId)) {
        const business = await getBusinessByName(businessId);
        if (business) {
          businessId = business.id;
        } else {
          return []; // No business found
        }
      }
      query = query.eq('business_id', businessId);
    }
  }
    
  const { data, error } = await query;
    
  if (error) {
    console.error("Error fetching expenses by date range:", error);
    throw error;
  }
  
  return data.map(mapExpenseFromRow);
}

export async function updateIncome(id: string, income: {
  date?: Date;
  type?: string;
  description?: string;
  amount?: number;
}): Promise<Income> {
  const updateData: any = {};
  
  // Ensure date is handled properly for updates
  if (income.date) {
    updateData.date = formatDateForServer(income.date);
  }
  if (income.type) updateData.type = income.type;
  if (income.description) updateData.description = income.description;
  if (income.amount !== undefined) updateData.amount = income.amount;

  const { data, error } = await supabase
    .from('incomes')
    .update(updateData)
    .eq('id', id)
    .select()
    .single();
    
  if (error) {
    console.error("Error updating income:", error);
    throw error;
  }
  
  return mapIncomeFromRow(data);
}

export async function deleteIncome(id: string): Promise<void> {
  const { error } = await supabase
    .from('incomes')
    .delete()
    .eq('id', id);
    
  if (error) {
    console.error("Error deleting income:", error);
    throw error;
  }
}

export async function updateExpense(id: string, expense: {
  date?: Date;
  type?: string;
  description?: string;
  amount?: number;
}): Promise<Expense> {
  const updateData: any = {};
  
  // Ensure date is handled properly for updates
  if (expense.date) {
    updateData.date = formatDateForServer(expense.date);
  }
  if (expense.type) updateData.type = expense.type;
  if (expense.description) updateData.description = expense.description;
  if (expense.amount !== undefined) updateData.amount = expense.amount;

  const { data, error } = await supabase
    .from('expenses')
    .update(updateData)
    .eq('id', id)
    .select()
    .single();
    
  if (error) {
    console.error("Error updating expense:", error);
    throw error;
  }
  
  return mapExpenseFromRow(data);
}

export async function deleteExpense(id: string): Promise<void> {
  const { error } = await supabase
    .from('expenses')
    .delete()
    .eq('id', id);
    
  if (error) {
    console.error("Error deleting expense:", error);
    throw error;
  }
}
