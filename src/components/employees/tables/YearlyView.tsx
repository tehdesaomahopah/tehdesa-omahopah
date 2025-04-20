
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

interface YearlyViewProps {
  data: any[];
  isLoading: boolean;
}

const YearlyView: React.FC<YearlyViewProps> = ({ data, isLoading }) => {
  // Group and count working days by employee name and month
  const groupedData = data.reduce((acc: any[], curr) => {
    const month = format(new Date(curr.work_date), "MMMM", { locale: idLocale });
    const existingEmployee = acc.find(item => item.name === curr.name);
    
    if (existingEmployee) {
      existingEmployee.months[month] = (existingEmployee.months[month] || 0) + 1;
    } else {
      acc.push({ 
        name: curr.name, 
        months: { [month]: 1 }
      });
    }
    return acc;
  }, []);

  // Get unique months for table headers
  const uniqueMonths = Array.from(
    new Set(data.map(item => 
      format(new Date(item.work_date), "MMMM", { locale: idLocale })
    ))
  ).sort((a, b) => {
    const monthA = new Date(format(new Date(`${a} 1`), "yyyy-MM-dd"));
    const monthB = new Date(format(new Date(`${b} 1`), "yyyy-MM-dd"));
    return monthA.getTime() - monthB.getTime();
  });

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Nama</TableHead>
          {uniqueMonths.map(month => (
            <TableHead key={month}>{month}</TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {isLoading ? (
          <TableRow>
            <TableCell colSpan={uniqueMonths.length + 1} className="text-center">
              Memuat data...
            </TableCell>
          </TableRow>
        ) : groupedData.length === 0 ? (
          <TableRow>
            <TableCell colSpan={uniqueMonths.length + 1} className="text-center">
              Tidak ada data
            </TableCell>
          </TableRow>
        ) : (
          groupedData.map((item: any) => (
            <TableRow key={item.name}>
              <TableCell>{item.name}</TableCell>
              {uniqueMonths.map(month => (
                <TableCell key={`${item.name}-${month}`}>
                  {item.months[month] || 0} hari
                </TableCell>
              ))}
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );
};

export default YearlyView;
