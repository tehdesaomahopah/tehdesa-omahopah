
import { useState } from "react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Loader2 } from "lucide-react";
import { Income } from "@/types/supabase";

type IncomeType = "Omset Usaha" | "Konsinyasi Usaha" | "Lainnya";

interface IncomeFormProps {
  businessId: string;
  onSubmit: (income: Omit<Income, 'id' | 'createdAt'>) => void;
  isPending: boolean;
  onCancel: () => void;
}

const IncomeForm = ({ businessId, onSubmit, isPending, onCancel }: IncomeFormProps) => {
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

  const formatCurrency = (value: string) => {
    const number = value.replace(/[^0-9]/g, "");
    return new Intl.NumberFormat("id-ID").format(parseInt(number || "0", 10));
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value;
    const formattedValue = formatCurrency(rawValue);
    setFormData({ ...formData, amount: formattedValue });
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Parse amount to number
    const numericAmount = parseInt(formData.amount.replace(/[^0-9]/g, ""), 10);
    
    // Create new income entry
    const newIncome = {
      businessId,
      date: formData.date,
      type: formData.type,
      description: formData.description,
      amount: numericAmount,
    };
    
    // Add income to database
    onSubmit(newIncome);
  };

  return (
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

export default IncomeForm;
