
import { useState } from "react";
import { useParams } from "react-router-dom";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search } from "lucide-react";
import IncomeForm from "@/components/income/IncomeForm";
import IncomeList from "@/components/income/IncomeList";
import { useIncomeData } from "@/hooks/income/useIncomeData";
import { Income } from "@/types/supabase";
import { Dialog, DialogClose } from "@/components/ui/dialog";
import { useRef } from "react";

const IncomeManagement = () => {
  const { businessId } = useParams<{ businessId: string }>();
  const [searchTerm, setSearchTerm] = useState("");
  const [showForm, setShowForm] = useState(false);
  const dialogCloseRef = useRef<HTMLButtonElement>(null);
  
  const { 
    incomes,
    isLoading,
    error,
    addIncome,
    isPending,
    updateIncome: updateIncomeFunction,
    deleteIncome: deleteIncomeFunction
  } = useIncomeData(businessId);

  const handleAddIncome = (newIncome: any) => {
    addIncome(newIncome);
    setShowForm(false);
  };

  // Create wrapper functions with the correct types
  const handleUpdateIncome = (id: string, data: Partial<Income>) => {
    updateIncomeFunction({ id, data });
    // Close any open dialogs
    if (dialogCloseRef.current) {
      dialogCloseRef.current.click();
    }
  };

  const handleDeleteIncome = (id: string) => {
    deleteIncomeFunction(id);
  };

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Pendapatan</h1>
        <p className="text-gray-600">Kelola pendapatan harian Anda</p>
      </div>

      <Card className="mb-8">
        <CardHeader className="pb-3">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <CardTitle>Daftar Pendapatan</CardTitle>
              <CardDescription>
                Total {incomes.filter(income => 
                  income.description.toLowerCase().includes(searchTerm.toLowerCase()) || 
                  income.type.toLowerCase().includes(searchTerm.toLowerCase())
                ).length} pendapatan
              </CardDescription>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                <Input
                  type="search"
                  placeholder="Cari pendapatan..."
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
                <span>Tambah Pendapatan</span>
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {showForm && (
            <IncomeForm 
              businessId={businessId || ""}
              onSubmit={handleAddIncome}
              isPending={isPending}
              onCancel={() => setShowForm(false)}
            />
          )}
          
          {/* Hidden DialogClose element that will be triggered programmatically */}
          <Dialog>
            <DialogClose ref={dialogCloseRef} className="hidden" />
          </Dialog>

          <IncomeList
            incomes={incomes} 
            isLoading={isLoading} 
            error={error} 
            searchTerm={searchTerm}
            onUpdateIncome={handleUpdateIncome}
            onDeleteIncome={handleDeleteIncome}
          />
        </CardContent>
      </Card>
    </DashboardLayout>
  );
};

export default IncomeManagement;
