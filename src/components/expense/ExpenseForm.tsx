
import { useState } from "react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Loader2 } from "lucide-react";
import { Expense } from "@/types/supabase";

type ExpenseType = "Bagi Hasil" | "Belanja Bahan" | "Iuran" | "Maintenance" | "Marketing" | "Upah Pegawai" | "Lainnya";

interface ExpenseFormProps {
  businessId: string;
  onSubmit: (expense: Omit<Expense, 'id' | 'createdAt'>) => void;
  isPending: boolean;
  onCancel: () => void;
}

const ExpenseForm = ({ businessId, onSubmit, isPending, onCancel }: ExpenseFormProps) => {
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

  const formatCurrency = (value: string) => {
    const number = value.replace(/[^0-9]/g, "");
    return new Intl.NumberFormat("id-ID").format(parseInt(number || "0", 10));
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value;
    const formattedValue = formatCurrency(rawValue);
    setFormData({ ...formData, amount: formattedValue });
  };

  // Handle date change with full Date object
  const handleDateChange = (date: Date | undefined) => {
    if (date) {
      setFormData({ ...formData, date });
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Parse amount to number
    const numericAmount = parseInt(formData.amount.replace(/[^0-9]/g, ""), 10);
    
    // Create new expense entry with exact selected date (use selected date directly)
    const newExpense = {
      businessId,
      date: formData.date, // Use the date directly without modifications
      type: formData.type,
      description: formData.description,
      amount: numericAmount,
    };
    
    // Add expense to database
    onSubmit(newExpense);
  };

  return (
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
                  onSelect={handleDateChange}
                  initialFocus
                  className="p-3 pointer-events-auto"
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
          <Button type="button" variant="outline" onClick={onCancel}>
            Batal
          </Button>
          <Button 
            type="submit"
            disabled={isPending}
          >
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Menyimpan...
              </>
            ) : 'Simpan'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ExpenseForm;
