
import { useState } from "react";
import { useParams } from "react-router-dom";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CalendarIcon, Plus, Search, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Expense } from "@/types/supabase";
import { supabase } from "@/integrations/supabase/client";
import { mapExpenseFromRow } from "@/types/supabase";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getExpensesByBusinessId } from "@/services/businessService";

type ExpenseType = "Bagi Hasil" | "Belanja Bahan" | "Iuran" | "Maintenance" | "Marketing" | "Upah Pegawai" | "Lainnya";

const ExpenseManagement = () => {
  const { businessId } = useParams<{ businessId: string }>();
  const queryClient = useQueryClient();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [showForm, setShowForm] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState<{
    date: Date;
    type: ExpenseType;
    description: string;
    amount: string;
  }>({
    date: new Date(),
    type: "Belanja Bahan",
    description: "",
    amount: "",
  });

  // Fetch expenses data from Supabase
  const {
    data: expenses = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ['expenses', businessId],
    queryFn: () => businessId ? getExpensesByBusinessId(businessId) : Promise.resolve([]),
    enabled: !!businessId,
  });

  // Add new expense mutation
  const addExpenseMutation = useMutation({
    mutationFn: async (newExpense: Omit<Expense, 'id' | 'createdAt'>) => {
      const { data, error } = await supabase
        .from('expenses')
        .insert([{
          business_id: newExpense.businessId,
          date: newExpense.date.toISOString(),
          type: newExpense.type,
          description: newExpense.description,
          amount: newExpense.amount
        }])
        .select()
        .single();
        
      if (error) {
        console.error("Error adding expense:", error);
        throw error;
      }
      
      return mapExpenseFromRow(data);
    },
    onSuccess: () => {
      // Invalidate and refetch expenses
      queryClient.invalidateQueries({ queryKey: ['expenses', businessId] });
      
      // Reset form
      setFormData({
        date: new Date(),
        type: "Belanja Bahan",
        description: "",
        amount: "",
      });
      
      // Hide form
      setShowForm(false);
      
      // Show success notification
      toast.success("Pengeluaran berhasil ditambahkan!");
    },
    onError: (error) => {
      console.error("Error adding expense:", error);
      toast.error("Gagal menambahkan pengeluaran. Silahkan coba lagi.");
    },
  });

  const filteredExpenses = expenses.filter(
    (expense) => 
      (expense.description.toLowerCase().includes(searchTerm.toLowerCase()) || 
       expense.type.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Parse amount to number
    const numericAmount = parseInt(formData.amount.replace(/[^0-9]/g, ""), 10);
    
    // Create new expense entry
    const newExpense = {
      businessId: businessId || "",
      date: formData.date,
      type: formData.type,
      description: formData.description,
      amount: numericAmount,
    };
    
    // Add expense to database
    addExpenseMutation.mutate(newExpense);
  };

  const formatCurrency = (value: string) => {
    const number = value.replace(/[^0-9]/g, "");
    return new Intl.NumberFormat("id-ID").format(parseInt(number || "0", 10));
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value;
    const formattedValue = formatCurrency(rawValue);
    setFormData({ ...formData, amount: formattedValue });
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
                Total {filteredExpenses.length} pengeluaran
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
            <div className="mb-6 bg-gray-50 p-4 rounded-lg border border-gray-200">
              <h3 className="text-lg font-semibold mb-4">Tambah Pengeluaran Baru</h3>
              <form onSubmit={handleFormSubmit}>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="date">Tanggal</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-start text-left font-normal"
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {formData.date ? (
                            format(formData.date, "PPP")
                          ) : (
                            <span>Pilih tanggal</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={formData.date}
                          onSelect={(date) => date && setFormData({ ...formData, date })}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="type">Jenis Pengeluaran</Label>
                    <select
                      id="type"
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value as ExpenseType })}
                      required
                    >
                      <option value="Bagi Hasil">Bagi Hasil</option>
                      <option value="Belanja Bahan">Belanja Bahan</option>
                      <option value="Iuran">Iuran</option>
                      <option value="Maintenance">Maintenance</option>
                      <option value="Marketing">Marketing</option>
                      <option value="Upah Pegawai">Upah Pegawai</option>
                      <option value="Lainnya">Lainnya</option>
                    </select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="description">Deskripsi</Label>
                    <Input
                      id="description"
                      placeholder="Deskripsi pengeluaran"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="amount">Nominal (Rp)</Label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                        <span className="text-gray-500">Rp</span>
                      </div>
                      <Input
                        id="amount"
                        placeholder="0"
                        className="pl-10"
                        value={formData.amount}
                        onChange={handleAmountChange}
                        required
                      />
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-end gap-3 mt-6">
                  <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                    Batal
                  </Button>
                  <Button 
                    type="submit"
                    disabled={addExpenseMutation.isPending}
                  >
                    {addExpenseMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Menyimpan...
                      </>
                    ) : 'Simpan'}
                  </Button>
                </div>
              </form>
            </div>
          )}

          {isLoading ? (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-2">Memuat data pengeluaran...</span>
            </div>
          ) : error ? (
            <div className="text-center py-6 text-red-500">
              Terjadi kesalahan saat memuat data. Silakan coba lagi.
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tanggal</TableHead>
                    <TableHead>Jenis</TableHead>
                    <TableHead>Deskripsi</TableHead>
                    <TableHead className="text-right">Nominal</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredExpenses.length > 0 ? (
                    filteredExpenses.map((expense) => (
                      <TableRow key={expense.id}>
                        <TableCell>{format(expense.date, "dd/MM/yyyy")}</TableCell>
                        <TableCell>
                          <span className={cn(
                            "inline-block px-2 py-1 rounded text-xs font-medium",
                            expense.type === "Belanja Bahan" && "bg-amber-100 text-amber-800",
                            expense.type === "Upah Pegawai" && "bg-blue-100 text-blue-800",
                            expense.type === "Marketing" && "bg-purple-100 text-purple-800",
                            expense.type === "Maintenance" && "bg-cyan-100 text-cyan-800",
                            expense.type === "Bagi Hasil" && "bg-pink-100 text-pink-800",
                            expense.type === "Iuran" && "bg-indigo-100 text-indigo-800",
                            expense.type === "Lainnya" && "bg-gray-100 text-gray-800"
                          )}>
                            {expense.type}
                          </span>
                        </TableCell>
                        <TableCell>{expense.description}</TableCell>
                        <TableCell className="text-right font-medium">
                          Rp {expense.amount.toLocaleString('id-ID')}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-6 text-gray-500">
                        Tidak ada data pengeluaran.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </DashboardLayout>
  );
};

export default ExpenseManagement;
