
import React from "react";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import { Edit2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import EmployeeEditForm from "../EmployeeEditForm";

interface CustomViewProps {
  data: any[];
  isLoading: boolean;
  onDelete: (id: string) => void;
}

const CustomView: React.FC<CustomViewProps> = ({ data, isLoading, onDelete }) => {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Tanggal</TableHead>
          <TableHead>Nama</TableHead>
          <TableHead className="text-right">Aksi</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {isLoading ? (
          <TableRow>
            <TableCell colSpan={3} className="text-center">
              Memuat data...
            </TableCell>
          </TableRow>
        ) : data.length === 0 ? (
          <TableRow>
            <TableCell colSpan={3} className="text-center">
              Tidak ada data
            </TableCell>
          </TableRow>
        ) : (
          data.map((employee) => (
            <TableRow key={employee.id}>
              <TableCell>
                {format(new Date(employee.work_date), "dd MMMM yyyy", { locale: idLocale })}
              </TableCell>
              <TableCell>{employee.name}</TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="icon">
                        <Edit2 className="h-4 w-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Edit Data Karyawan</DialogTitle>
                      </DialogHeader>
                      <EmployeeEditForm employee={employee} />
                    </DialogContent>
                  </Dialog>
                  <Button
                    variant="destructive"
                    size="icon"
                    onClick={() => onDelete(employee.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );
};

export default CustomView;
