
import { useState, useEffect } from "react";
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
import { Income } from "@/types/supabase";
import { supabase } from "@/integrations/supabase/client";
import { mapIncomeFromRow } from "@/types/supabase";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getIncomesByBusinessId } from "@/services/businessService";

type IncomeType = "Omset Usaha" | "Konsinyasi Usaha" | "Lainnya";

const IncomeManagement = () => {
  const { businessId } = useParams<{ businessId: string }>();
  const queryClient = useQueryClient();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [showForm, setShowForm] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState<{
    date: Date;
    type: IncomeType;
    description: string;
    amount: string;
  }>({
    date: new Date(),
    type: "Omset Usaha",
    description: "",
    amount: "",
  });

  // Fetch incomes data from Supabase
  const {
    data: incomes = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ['incomes', businessId],
    queryFn: () => businessId ? getIncomesByBusinessId(businessId) : Promise.resolve([]),
    enabled: !!businessId,
  });

  // Add new income mutation
  const addIncomeMutation = useMutation({
    mutationFn: async (newIncome: Omit<Income, 'id' | 'createdAt'>) => {
      const { data, error } = await supabase
        .from('incomes')
        .insert([{
          business_id: newIncome.businessId,
          date: newIncome.date.toISOString(),
          type: newIncome.type,
          description: newIncome.description,
          amount: newIncome.amount
        }])
        .select()
        .single();
        
      if (error) {
        console.error("Error adding income:", error);
        throw error;
      }
      
      return mapIncomeFromRow(data);
    },
    onSuccess: () => {
      // Invalidate and refetch incomes
      queryClient.invalidateQueries({ queryKey: ['incomes', businessId] });
      
      // Reset form
      setFormData({
        date: new Date(),
        type: "Omset Usaha",
        description: "",
        amount: "",
      });
      
      // Hide form
      setShowForm(false);
      
      // Show success notification
      toast.success("Pendapatan berhasil ditambahkan!");
    },
    onError: (error) => {
      console.error("Error adding income:", error);
      toast.error("Gagal menambahkan pendapatan. Silahkan coba lagi.");
    },
  });

  const filteredIncomes = incomes.filter(
    (income) => 
      (income.description.toLowerCase().includes(searchTerm.toLowerCase()) || 
       income.type.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Parse amount to number
    const numericAmount = parseInt(formData.amount.replace(/[^0-9]/g, ""), 10);
    
    // Create new income entry
    const newIncome = {
      businessId: businessId || "",
      date: formData.date,
      type: formData.type,
      description: formData.description,
      amount: numericAmount,
    };
    
    // Add income to database
    addIncomeMutation.mutate(newIncome);
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
        <h1 className="text-2xl font-bold text-gray-800">Pendapatan</h1>
        <p className="text-gray-600">Kelola pendapatan harian Anda</p>
      </div>

      <Card className="mb-8">
        <CardHeader className="pb-3">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <CardTitle>Daftar Pendapatan</CardTitle>
              <CardDescription>
                Total {filteredIncomes.length} pendapatan
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
            <div className="mb-6 bg-gray-50 p-4 rounded-lg border border-gray-200">
              <h3 className="text-lg font-semibold mb-4">Tambah Pendapatan Baru</h3>
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
                    <Label htmlFor="type">Jenis Pendapatan</Label>
                    <select
                      id="type"
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value as IncomeType })}
                      required
                    >
                      <option value="Omset Usaha">Omset Usaha</option>
                      <option value="Konsinyasi Usaha">Konsinyasi Usaha</option>
                      <option value="Lainnya">Lainnya</option>
                    </select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="description">Deskripsi</Label>
                    <Input
                      id="description"
                      placeholder="Deskripsi pendapatan"
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
                    disabled={addIncomeMutation.isPending}
                  >
                    {addIncomeMutation.isPending ? (
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
              <span className="ml-2">Memuat data pendapatan...</span>
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
                  {filteredIncomes.length > 0 ? (
                    filteredIncomes.map((income) => (
                      <TableRow key={income.id}>
                        <TableCell>{format(income.date, "dd/MM/yyyy")}</TableCell>
                        <TableCell>
                          <span className={cn(
                            "inline-block px-2 py-1 rounded text-xs font-medium",
                            income.type === "Omset Usaha" && "bg-green-100 text-green-800",
                            income.type === "Konsinyasi Usaha" && "bg-blue-100 text-blue-800",
                            income.type === "Lainnya" && "bg-purple-100 text-purple-800"
                          )}>
                            {income.type}
                          </span>
                        </TableCell>
                        <TableCell>{income.description}</TableCell>
                        <TableCell className="text-right font-medium">
                          Rp {income.amount.toLocaleString('id-ID')}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-6 text-gray-500">
                        Tidak ada data pendapatan.
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

export default IncomeManagement;
