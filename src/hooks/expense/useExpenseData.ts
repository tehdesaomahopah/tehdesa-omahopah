
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Expense } from "@/types/supabase";
import { 
  getExpensesByBusinessId, 
  addExpense, 
  updateExpense, 
  deleteExpense 
} from "@/services/businessService";
import { useBusinessResolver } from "@/hooks/business/useBusinessResolver";

export const useExpenseData = (businessId: string | undefined) => {
  const queryClient = useQueryClient();
  const { resolvedId, isLoading: isResolvingBusiness } = useBusinessResolver(businessId);

  // Fetch expenses data from Supabase
  const { 
    data: expenses = [], 
    isLoading: isLoadingExpenses, 
    error 
  } = useQuery({
    queryKey: ['expenses', businessId, resolvedId],
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
      queryClient.invalidateQueries({ queryKey: ['expenses', businessId, resolvedId] });
      
      // Show success notification
      toast.success("Pengeluaran berhasil ditambahkan!");
    },
    onError: (error) => {
      console.error("Error adding expense:", error);
      toast.error("Gagal menambahkan pengeluaran. Silahkan coba lagi.");
    },
  });

  // Update expense mutation
  const updateExpenseMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string, data: Partial<Omit<Expense, 'id' | 'businessId' | 'createdAt'>> }) => {
      return updateExpense(id, data);
    },
    onSuccess: () => {
      // Invalidate and refetch expenses
      queryClient.invalidateQueries({ queryKey: ['expenses', businessId, resolvedId] });
      
      // Show success notification
      toast.success("Pengeluaran berhasil diperbarui!");
    },
    onError: (error) => {
      console.error("Error updating expense:", error);
      toast.error("Gagal memperbarui pengeluaran. Silahkan coba lagi.");
    },
  });

  // Delete expense mutation
  const deleteExpenseMutation = useMutation({
    mutationFn: async (id: string) => {
      return deleteExpense(id);
    },
    onSuccess: () => {
      // Invalidate and refetch expenses
      queryClient.invalidateQueries({ queryKey: ['expenses', businessId, resolvedId] });
      
      // Show success notification
      toast.success("Pengeluaran berhasil dihapus!");
    },
    onError: (error) => {
      console.error("Error deleting expense:", error);
      toast.error("Gagal menghapus pengeluaran. Silahkan coba lagi.");
    },
  });

  return {
    expenses,
    isLoading: isResolvingBusiness || isLoadingExpenses,
    error,
    addExpense: addExpenseMutation.mutate,
    updateExpense: updateExpenseMutation.mutate,
    deleteExpense: deleteExpenseMutation.mutate,
    isPending: addExpenseMutation.isPending || updateExpenseMutation.isPending || deleteExpenseMutation.isPending
  };
};
