
import { useState } from "react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Income } from "@/types/supabase";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2, Pencil, Trash2, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

interface IncomeListProps {
  incomes: Income[];
  isLoading: boolean;
  error: Error | null;
  searchTerm: string;
  onUpdateIncome: (id: string, data: Partial<Income>) => void;
  onDeleteIncome: (id: string) => void;
}

const IncomeList = ({ 
  incomes, 
  isLoading, 
  error, 
  searchTerm, 
  onUpdateIncome, 
  onDeleteIncome 
}: IncomeListProps) => {
  const [editingIncome, setEditingIncome] = useState<{
    id: string;
    data: {
      type: string;
      description: string;
      amount: number;
    }
  } | null>(null);

  // Filter incomes based on search term
  const filteredIncomes = incomes.filter(
    (income) => (
      income.description.toLowerCase().includes(searchTerm.toLowerCase()) || 
      income.type.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const handleEditClick = (income: Income) => {
    setEditingIncome({
      id: income.id,
      data: {
        type: income.type,
        description: income.description,
        amount: income.amount
      }
    });
  };

  const handleCancelEdit = () => {
    setEditingIncome(null);
  };

  const handleSaveEdit = () => {
    if (editingIncome) {
      onUpdateIncome(editingIncome.id, editingIncome.data);
      setEditingIncome(null);
    }
  };

  const handleInputChange = (field: string, value: string | number) => {
    if (editingIncome) {
      setEditingIncome({
        ...editingIncome,
        data: {
          ...editingIncome.data,
          [field]: value
        }
      });
    }
  };

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
            <TableHead className="text-right">Aksi</TableHead>
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
                          <DialogTitle>Edit Pendapatan</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                          <div className="grid grid-cols-4 items-center gap-4">
                            <label htmlFor="edit-type" className="text-right text-sm font-medium">
                              Jenis
                            </label>
                            <Select 
                              defaultValue={income.type}
                              onValueChange={(value) => handleInputChange("type", value)}
                            >
                              <SelectTrigger className="col-span-3">
                                <SelectValue placeholder="Pilih jenis pendapatan" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Omset Usaha">Omset Usaha</SelectItem>
                                <SelectItem value="Konsinyasi Usaha">Konsinyasi Usaha</SelectItem>
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
                              defaultValue={income.description}
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
                              defaultValue={income.amount}
                              className="col-span-3"
                              onChange={(e) => handleInputChange("amount", Number(e.target.value))}
                            />
                          </div>
                        </div>
                        <DialogFooter>
                          <Button type="submit" onClick={() => onUpdateIncome(income.id, {
                            type: document.getElementById("edit-type") ? (document.getElementById("edit-type") as HTMLSelectElement).value : income.type,
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
                          <AlertDialogTitle>Hapus Pendapatan</AlertDialogTitle>
                          <AlertDialogDescription>
                            Apakah Anda yakin ingin menghapus data pendapatan ini? Tindakan ini tidak dapat dibatalkan.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Batal</AlertDialogCancel>
                          <AlertDialogAction onClick={() => onDeleteIncome(income.id)} className="bg-red-600 hover:bg-red-700">
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
