
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Income } from "@/types/supabase";
import { 
  getIncomesByBusinessId, 
  addIncome, 
  updateIncome, 
  deleteIncome 
} from "@/services/businessService";
import { useBusinessResolver } from "@/hooks/business/useBusinessResolver";

export const useIncomeData = (businessId: string | undefined) => {
  const queryClient = useQueryClient();
  const { resolvedId, isLoading: isResolvingBusiness } = useBusinessResolver(businessId);

  // Fetch incomes data from Supabase
  const { 
    data: incomes = [], 
    isLoading: isLoadingIncomes, 
    error 
  } = useQuery({
    queryKey: ['incomes', businessId, resolvedId],
    queryFn: () => businessId ? getIncomesByBusinessId(businessId) : Promise.resolve([]),
    enabled: !!businessId,
  });

  // Add new income mutation
  const addIncomeMutation = useMutation({
    mutationFn: async (newIncome: Omit<Income, 'id' | 'createdAt'>) => {
      return addIncome(newIncome);
    },
    onSuccess: () => {
      // Invalidate and refetch incomes
      queryClient.invalidateQueries({ queryKey: ['incomes', businessId, resolvedId] });
      
      // Show success notification
      toast.success("Pendapatan berhasil ditambahkan!");
    },
    onError: (error) => {
      console.error("Error adding income:", error);
      toast.error("Gagal menambahkan pendapatan. Silahkan coba lagi.");
    },
  });

  // Update income mutation
  const updateIncomeMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string, data: Partial<Omit<Income, 'id' | 'businessId' | 'createdAt'>> }) => {
      return updateIncome(id, data);
    },
    onSuccess: () => {
      // Invalidate and refetch incomes
      queryClient.invalidateQueries({ queryKey: ['incomes', businessId, resolvedId] });
      
      // Show success notification
      toast.success("Pendapatan berhasil diperbarui!");
    },
    onError: (error) => {
      console.error("Error updating income:", error);
      toast.error("Gagal memperbarui pendapatan. Silahkan coba lagi.");
    },
  });

  // Delete income mutation
  const deleteIncomeMutation = useMutation({
    mutationFn: async (id: string) => {
      return deleteIncome(id);
    },
    onSuccess: () => {
      // Invalidate and refetch incomes
      queryClient.invalidateQueries({ queryKey: ['incomes', businessId, resolvedId] });
      
      // Show success notification
      toast.success("Pendapatan berhasil dihapus!");
    },
    onError: (error) => {
      console.error("Error deleting income:", error);
      toast.error("Gagal menghapus pendapatan. Silahkan coba lagi.");
    },
  });

  return {
    incomes,
    isLoading: isResolvingBusiness || isLoadingIncomes,
    error,
    addIncome: addIncomeMutation.mutate,
    updateIncome: updateIncomeMutation.mutate,
    deleteIncome: deleteIncomeMutation.mutate,
    isPending: addIncomeMutation.isPending || updateIncomeMutation.isPending || deleteIncomeMutation.isPending
  };
};
