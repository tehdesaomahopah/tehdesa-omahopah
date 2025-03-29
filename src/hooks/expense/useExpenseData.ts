
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Expense } from "@/types/supabase";
import { getExpensesByBusinessId, addExpense } from "@/services/businessService";

export const useExpenseData = (businessId: string | undefined) => {
  const queryClient = useQueryClient();

  // Fetch expenses data from Supabase
  const { 
    data: expenses = [], 
    isLoading, 
    error 
  } = useQuery({
    queryKey: ['expenses', businessId],
    queryFn: () => businessId ? getExpensesByBusinessId(businessId) : Promise.resolve([]),
    enabled: !!businessId,
  });

  // Add new expense mutation
  const addExpenseMutation = useMutation({
    mutationFn: async (newExpense: Omit<Expense, 'id' | 'createdAt'>) => {
      return addExpense(newExpense);
    },
    onSuccess: () => {
      // Invalidate and refetch expenses
      queryClient.invalidateQueries({ queryKey: ['expenses', businessId] });
      
      // Show success notification
      toast.success("Pengeluaran berhasil ditambahkan!");
    },
    onError: (error) => {
      console.error("Error adding expense:", error);
      toast.error("Gagal menambahkan pengeluaran. Silahkan coba lagi.");
    },
  });

  return {
    expenses,
    isLoading,
    error,
    addExpense: addExpenseMutation.mutate,
    isPending: addExpenseMutation.isPending
  };
};
