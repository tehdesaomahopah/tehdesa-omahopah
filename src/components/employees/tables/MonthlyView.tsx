
import React from "react";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface MonthlyViewProps {
  data: any[];
  isLoading: boolean;
}

const MonthlyView: React.FC<MonthlyViewProps> = ({ data, isLoading }) => {
  // Group and count working days by employee name
  const groupedData = data.reduce((acc: any[], curr) => {
    const existingEmployee = acc.find(item => item.name === curr.name);
    if (existingEmployee) {
      existingEmployee.workDays += 1;
    } else {
      acc.push({ name: curr.name, workDays: 1 });
    }
    return acc;
  }, []);

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Nama</TableHead>
          <TableHead>Jumlah Hari Kerja</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {isLoading ? (
          <TableRow>
            <TableCell colSpan={2} className="text-center">
              Memuat data...
            </TableCell>
          </TableRow>
        ) : groupedData.length === 0 ? (
          <TableRow>
            <TableCell colSpan={2} className="text-center">
              Tidak ada data
            </TableCell>
          </TableRow>
        ) : (
          groupedData.map((item: any) => (
            <TableRow key={item.name}>
              <TableCell>{item.name}</TableCell>
              <TableCell>{item.workDays} hari</TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );
};

export default MonthlyView;
