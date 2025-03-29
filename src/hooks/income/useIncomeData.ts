
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Income } from "@/types/supabase";
import { getIncomesByBusinessId, addIncome } from "@/services/businessService";

export const useIncomeData = (businessId: string | undefined) => {
  const queryClient = useQueryClient();

  // Fetch incomes data from Supabase
  const { 
    data: incomes = [], 
    isLoading, 
    error 
  } = useQuery({
    queryKey: ['incomes', businessId],
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
      queryClient.invalidateQueries({ queryKey: ['incomes', businessId] });
      
      // Show success notification
      toast.success("Pendapatan berhasil ditambahkan!");
    },
    onError: (error) => {
      console.error("Error adding income:", error);
      toast.error("Gagal menambahkan pendapatan. Silahkan coba lagi.");
    },
  });

  return {
    incomes,
    isLoading,
    error,
    addIncome: addIncomeMutation.mutate,
    isPending: addIncomeMutation.isPending
  };
};
