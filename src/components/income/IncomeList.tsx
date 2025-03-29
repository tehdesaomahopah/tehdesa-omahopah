
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Income } from "@/types/supabase";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2 } from "lucide-react";

interface IncomeListProps {
  incomes: Income[];
  isLoading: boolean;
  error: Error | null;
  searchTerm: string;
}

const IncomeList = ({ incomes, isLoading, error, searchTerm }: IncomeListProps) => {
  // Filter incomes based on search term
  const filteredIncomes = incomes.filter(
    (income) => (
      income.description.toLowerCase().includes(searchTerm.toLowerCase()) || 
      income.type.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Memuat data pendapatan...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-6 text-red-500">
        Terjadi kesalahan saat memuat data. Silakan coba lagi.
      </div>
    );
  }

  return (
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
  );
};

export default IncomeList;
