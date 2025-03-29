
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Expense } from "@/types/supabase";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2 } from "lucide-react";

interface ExpenseListProps {
  expenses: Expense[];
  isLoading: boolean;
  error: Error | null;
  searchTerm: string;
}

const ExpenseList = ({ expenses, isLoading, error, searchTerm }: ExpenseListProps) => {
  // Filter expenses based on search term
  const filteredExpenses = expenses.filter(
    (expense) => (
      expense.description.toLowerCase().includes(searchTerm.toLowerCase()) || 
      expense.type.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Memuat data pengeluaran...</span>
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
  );
};

export default ExpenseList;
