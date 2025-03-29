
import { useState } from "react";
import { useParams } from "react-router-dom";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search } from "lucide-react";
import ExpenseForm from "@/components/expense/ExpenseForm";
import ExpenseList from "@/components/expense/ExpenseList";
import { useExpenseData } from "@/hooks/expense/useExpenseData";
import { Expense } from "@/types/supabase";

const ExpenseManagement = () => {
  const { businessId } = useParams<{ businessId: string }>();
  const [searchTerm, setSearchTerm] = useState("");
  const [showForm, setShowForm] = useState(false);
  
  const { 
    expenses,
    isLoading,
    error,
    addExpense,
    isPending,
    updateExpense: updateExpenseFunction,
    deleteExpense: deleteExpenseFunction
  } = useExpenseData(businessId);

  const handleAddExpense = (newExpense: any) => {
    addExpense(newExpense);
    setShowForm(false);
  };

  // Create wrapper functions with the correct types
  const handleUpdateExpense = (id: string, data: Partial<Expense>) => {
    updateExpenseFunction({ id, data });
  };

  const handleDeleteExpense = (id: string) => {
    deleteExpenseFunction(id);
  };

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Pengeluaran</h1>
        <p className="text-gray-600">Kelola pengeluaran harian Anda</p>
      </div>

      <Card className="mb-8">
        <CardHeader className="pb-3">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <CardTitle>Daftar Pengeluaran</CardTitle>
              <CardDescription>
                Total {expenses.filter(expense => 
                  expense.description.toLowerCase().includes(searchTerm.toLowerCase()) || 
                  expense.type.toLowerCase().includes(searchTerm.toLowerCase())
                ).length} pengeluaran
              </CardDescription>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                <Input
                  type="search"
                  placeholder="Cari pengeluaran..."
                  className="pl-8 w-full sm:w-[250px]"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Button 
                onClick={() => setShowForm(!showForm)}
                className="flex items-center gap-1"
              >
                <Plus className="h-4 w-4" />
                <span>Tambah Pengeluaran</span>
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {showForm && (
            <ExpenseForm 
              businessId={businessId || ""}
              onSubmit={handleAddExpense}
              isPending={isPending}
              onCancel={() => setShowForm(false)}
            />
          )}

          <ExpenseList
            expenses={expenses} 
            isLoading={isLoading} 
            error={error} 
            searchTerm={searchTerm}
            onUpdateExpense={handleUpdateExpense}
            onDeleteExpense={handleDeleteExpense}
          />
        </CardContent>
      </Card>
    </DashboardLayout>
  );
};

export default ExpenseManagement;
