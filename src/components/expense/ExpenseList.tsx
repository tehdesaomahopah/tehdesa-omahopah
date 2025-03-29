
import { useState } from "react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Expense } from "@/types/supabase";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2, Pencil, Trash2, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

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
      type: string;
      description: string;
      amount: number;
    }
  } | null>(null);

  // Filter expenses based on search term
  const filteredExpenses = expenses.filter(
    (expense) => (
      expense.description.toLowerCase().includes(searchTerm.toLowerCase()) || 
      expense.type.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const handleEditClick = (expense: Expense) => {
    setEditingExpense({
      id: expense.id,
      data: {
        type: expense.type,
        description: expense.description,
        amount: expense.amount
      }
    });
  };

  const handleCancelEdit = () => {
    setEditingExpense(null);
  };

  const handleSaveEdit = () => {
    if (editingExpense) {
      onUpdateExpense(editingExpense.id, editingExpense.data);
      setEditingExpense(null);
    }
  };

  const handleInputChange = (field: string, value: string | number) => {
    if (editingExpense) {
      setEditingExpense({
        ...editingExpense,
        data: {
          ...editingExpense.data,
          [field]: value
        }
      });
    }
  };

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
            <TableHead className="text-right">Aksi</TableHead>
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
                <TableCell className="text-right">
                  <div className="flex justify-end space-x-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="icon" className="h-8 w-8">
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Edit Pengeluaran</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                          <div className="grid grid-cols-4 items-center gap-4">
                            <label htmlFor="edit-type" className="text-right text-sm font-medium">
                              Jenis
                            </label>
                            <Select 
                              defaultValue={expense.type}
                              onValueChange={(value) => handleInputChange("type", value)}
                            >
                              <SelectTrigger className="col-span-3">
                                <SelectValue placeholder="Pilih jenis pengeluaran" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Belanja Bahan">Belanja Bahan</SelectItem>
                                <SelectItem value="Upah Pegawai">Upah Pegawai</SelectItem>
                                <SelectItem value="Marketing">Marketing</SelectItem>
                                <SelectItem value="Maintenance">Maintenance</SelectItem>
                                <SelectItem value="Bagi Hasil">Bagi Hasil</SelectItem>
                                <SelectItem value="Iuran">Iuran</SelectItem>
                                <SelectItem value="Lainnya">Lainnya</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="grid grid-cols-4 items-center gap-4">
                            <label htmlFor="edit-description" className="text-right text-sm font-medium">
                              Deskripsi
                            </label>
                            <Input
                              id="edit-description"
                              defaultValue={expense.description}
                              className="col-span-3"
                              onChange={(e) => handleInputChange("description", e.target.value)}
                            />
                          </div>
                          <div className="grid grid-cols-4 items-center gap-4">
                            <label htmlFor="edit-amount" className="text-right text-sm font-medium">
                              Nominal
                            </label>
                            <Input
                              id="edit-amount"
                              type="number"
                              defaultValue={expense.amount}
                              className="col-span-3"
                              onChange={(e) => handleInputChange("amount", Number(e.target.value))}
                            />
                          </div>
                        </div>
                        <DialogFooter>
                          <Button type="submit" onClick={() => onUpdateExpense(expense.id, {
                            type: document.getElementById("edit-type") ? (document.getElementById("edit-type") as HTMLSelectElement).value : expense.type,
                            description: (document.getElementById("edit-description") as HTMLInputElement).value,
                            amount: Number((document.getElementById("edit-amount") as HTMLInputElement).value)
                          })}>
                            Simpan
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>

                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="outline" size="icon" className="h-8 w-8 bg-red-50 hover:bg-red-100 text-red-600 hover:text-red-700">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Hapus Pengeluaran</AlertDialogTitle>
                          <AlertDialogDescription>
                            Apakah Anda yakin ingin menghapus data pengeluaran ini? Tindakan ini tidak dapat dibatalkan.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Batal</AlertDialogCancel>
                          <AlertDialogAction onClick={() => onDeleteExpense(expense.id)} className="bg-red-600 hover:bg-red-700">
                            Hapus
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={5} className="text-center py-6 text-gray-500">
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
