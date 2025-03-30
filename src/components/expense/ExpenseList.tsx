import { useState } from "react";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { Expense } from "@/types/supabase";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2, Pencil, Trash2, ArrowDown, ArrowUp, CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface ExpenseListProps {
  expenses: Expense[];
  isLoading: boolean;
  error: Error | null;
  searchTerm: string;
  onUpdateExpense: (id: string, data: Partial<Expense>) => void;
  onDeleteExpense: (id: string) => void;
}

const ExpenseList = ({ 
  expenses, 
  isLoading, 
  error, 
  searchTerm, 
  onUpdateExpense, 
  onDeleteExpense 
}: ExpenseListProps) => {
  const [editingExpense, setEditingExpense] = useState<{
    id: string;
    data: {
      date: Date;
      type: string;
      description: string;
      amount: number;
    }
  } | null>(null);

  // Sorting state
  const [sortConfig, setSortConfig] = useState<{
    key: keyof Expense;
    direction: 'ascending' | 'descending';
  }>({
    key: 'date',
    direction: 'descending' // Default sort by latest date first
  });

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  // Filter expenses based on search term
  const filteredExpenses = expenses.filter(
    (expense) => (
      expense.description.toLowerCase().includes(searchTerm.toLowerCase()) || 
      expense.type.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  // Sorting function
  const handleSort = (key: keyof Expense) => {
    const direction = 
      sortConfig.key === key && sortConfig.direction === 'ascending' 
        ? 'descending' 
        : 'ascending';
    setSortConfig({ key, direction });
  };

  // Apply sorting
  const sortedExpenses = [...filteredExpenses].sort((a, b) => {
    if (a[sortConfig.key] < b[sortConfig.key]) {
      return sortConfig.direction === 'ascending' ? -1 : 1;
    }
    if (a[sortConfig.key] > b[sortConfig.key]) {
      return sortConfig.direction === 'ascending' ? 1 : -1;
    }
    return 0;
  });

  // Pagination logic
  const totalPages = Math.ceil(sortedExpenses.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentExpenses = sortedExpenses.slice(startIndex, endIndex);

  // Handle date change
  const handleEditDateChange = (date: Date | undefined) => {
    if (date && editingExpense) {
      setEditingExpense({
        ...editingExpense,
        data: {
          ...editingExpense.data,
          date: new Date(date.getFullYear(), date.getMonth(), date.getDate())
        }
      });
    }
  };

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="cursor-pointer" onClick={() => handleSort('date')}>
                <div className="flex items-center">
                  Tanggal
                  {sortConfig.key === 'date' && (sortConfig.direction === 'ascending' ? <ArrowUp className="h-4 w-4 ml-1" /> : <ArrowDown className="h-4 w-4 ml-1" />)}
                </div>
              </TableHead>
              <TableHead>Jenis</TableHead>
              <TableHead>Deskripsi</TableHead>
              <TableHead className="text-right">Nominal</TableHead>
              <TableHead className="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentExpenses.map((expense) => (
              <TableRow key={expense.id}>
                <TableCell>{format(new Date(expense.date), "dd/MM/yyyy", { locale: id })}</TableCell>
                <TableCell>{expense.type}</TableCell>
                <TableCell>{expense.description}</TableCell>
                <TableCell className="text-right font-medium">Rp {expense.amount.toLocaleString('id-ID')}</TableCell>
                <TableCell className="text-right">
                  <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setEditingExpense({ id: expense.id, data: { date: new Date(expense.date), type: expense.type, description: expense.description, amount: expense.amount } })}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="icon" className="h-8 w-8 bg-red-50 hover:bg-red-100 text-red-600 hover:text-red-700" onClick={() => onDeleteExpense(expense.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </>
  );
};

export default ExpenseList;
