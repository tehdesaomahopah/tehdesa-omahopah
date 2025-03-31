
import { useState } from "react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Income } from "@/types/supabase";
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
      date: Date;
      type: string;
      description: string;
      amount: number;
    }
  } | null>(null);
  
  // Sorting state
  const [sortConfig, setSortConfig] = useState<{
    key: keyof Income;
    direction: 'ascending' | 'descending';
  }>({
    key: 'date',
    direction: 'descending' // Default sort by latest date first
  });
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  // Filter incomes based on search term
  const filteredIncomes = incomes.filter(
    (income) => (
      income.description.toLowerCase().includes(searchTerm.toLowerCase()) || 
      income.type.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );
  
  // Handle sorting
  const handleSort = (key: keyof Income) => {
    const direction = 
      sortConfig.key === key && sortConfig.direction === 'ascending' 
        ? 'descending' 
        : 'ascending';
    
    setSortConfig({ key, direction });
  };
  
  // Apply sorting
  const sortedIncomes = [...filteredIncomes].sort((a, b) => {
    if (a[sortConfig.key] < b[sortConfig.key]) {
      return sortConfig.direction === 'ascending' ? -1 : 1;
    }
    if (a[sortConfig.key] > b[sortConfig.key]) {
      return sortConfig.direction === 'ascending' ? 1 : -1;
    }
    return 0;
  });
  
  // Paginate incomes
  const totalPages = Math.ceil(sortedIncomes.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentIncomes = sortedIncomes.slice(startIndex, endIndex);
  
  const handleEditDateChange = (date: Date | undefined) => {
    if (date && editingIncome) {
      // Make sure we preserve the exact selected date
      setEditingIncome({
        ...editingIncome,
        data: {
          ...editingIncome.data,
          date
        }
      });
    }
  };

  const handleEditClick = (income: Income) => {
    setEditingIncome({
      id: income.id,
      data: {
        date: new Date(income.date),
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

  const handleInputChange = (field: string, value: string | number | Date) => {
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

  const renderPagination = () => {
    if (totalPages <= 1) return null;
    
    return (
      <Pagination className="mt-4">
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious 
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
            />
          </PaginationItem>
          
          {[...Array(totalPages)].map((_, i) => {
            const page = i + 1;
            // Show first page, current page, last page, and pages around current
            if (
              page === 1 || 
              page === totalPages || 
              (page >= currentPage - 1 && page <= currentPage + 1)
            ) {
              return (
                <PaginationItem key={page}>
                  <PaginationLink 
                    isActive={currentPage === page}
                    onClick={() => setCurrentPage(page)}
                  >
                    {page}
                  </PaginationLink>
                </PaginationItem>
              );
            } 
            // Show ellipsis
            else if (
              page === currentPage - 2 || 
              page === currentPage + 2
            ) {
              return <PaginationEllipsis key={`ellipsis-${page}`} />;
            }
            return null;
          })}
          
          <PaginationItem>
            <PaginationNext 
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    );
  };

  const getSortIcon = (key: keyof Income) => {
    if (sortConfig.key !== key) return null;
    return sortConfig.direction === 'ascending' ? <ArrowUp className="h-4 w-4 ml-1" /> : <ArrowDown className="h-4 w-4 ml-1" />;
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
                  {getSortIcon('date')}
                </div>
              </TableHead>
              <TableHead className="cursor-pointer" onClick={() => handleSort('type')}>
                <div className="flex items-center">
                  Jenis
                  {getSortIcon('type')}
                </div>
              </TableHead>
              <TableHead className="cursor-pointer" onClick={() => handleSort('description')}>
                <div className="flex items-center">
                  Deskripsi
                  {getSortIcon('description')}
                </div>
              </TableHead>
              <TableHead className="text-right cursor-pointer" onClick={() => handleSort('amount')}>
                <div className="flex items-center justify-end">
                  Nominal
                  {getSortIcon('amount')}
                </div>
              </TableHead>
              <TableHead className="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentIncomes.length > 0 ? (
              currentIncomes.map((income) => (
                <TableRow key={income.id}>
                  <TableCell>{format(new Date(income.date), "dd/MM/yyyy")}</TableCell>
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
                          <Button 
                            variant="outline" 
                            size="icon" 
                            className="h-8 w-8"
                            onClick={() => handleEditClick(income)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Edit Pendapatan</DialogTitle>
                          </DialogHeader>
                          {editingIncome && (
                            <div className="space-y-4 py-4">
                              <div className="grid grid-cols-4 items-center gap-4">
                                <label className="text-right text-sm font-medium">
                                  Tanggal
                                </label>
                                <div className="col-span-3">
                                  <Popover>
                                    <PopoverTrigger asChild>
                                      <Button
                                        id="date-picker"
                                        variant="outline"
                                        className="w-full justify-start text-left font-normal"
                                      >
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {editingIncome?.data.date ? (
                                          format(editingIncome.data.date, "dd MMMM yyyy")
                                        ) : (
                                          format(new Date(income.date), "dd MMMM yyyy")
                                        )}
                                      </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0">
                                      <Calendar
                                        mode="single"
                                        selected={editingIncome?.data.date}
                                        onSelect={handleEditDateChange}
                                        initialFocus
                                        className="p-3 pointer-events-auto"
                                      />
                                    </PopoverContent>
                                  </Popover>
                                </div>
                              </div>
                              <div className="grid grid-cols-4 items-center gap-4">
                                <label htmlFor="edit-type" className="text-right text-sm font-medium">
                                  Jenis
                                </label>
                                <Select 
                                  value={editingIncome.data.type}
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
                                  value={editingIncome.data.description}
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
                                  value={editingIncome.data.amount}
                                  className="col-span-3"
                                  onChange={(e) => handleInputChange("amount", Number(e.target.value))}
                                />
                              </div>
                            </div>
                          )}
                          <DialogFooter>
                            <Button variant="outline" onClick={handleCancelEdit}>
                              Batal
                            </Button>
                            <Button type="submit" onClick={handleSaveEdit}>
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
      {renderPagination()}
    </>
  );
};

export default IncomeList;
