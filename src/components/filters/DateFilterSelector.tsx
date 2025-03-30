
import { useMemo } from "react";
import { format } from "date-fns";
import { id } from 'date-fns/locale';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface DateFilterSelectorProps {
  filterType: 'month' | 'year';
  selectedMonth: string;
  selectedYear: string;
  onFilterTypeChange: (value: 'month' | 'year') => void;
  onMonthChange: (value: string) => void;
  onYearChange: (value: string) => void;
}

const DateFilterSelector = ({
  filterType,
  selectedMonth,
  selectedYear,
  onFilterTypeChange,
  onMonthChange,
  onYearChange
}: DateFilterSelectorProps) => {
  
  const availableYears = useMemo(() => {
    const currentYear = new Date().getFullYear();
    return Array.from({ length: 5 }, (_, i) => (currentYear - 2 + i).toString());
  }, []);
  
  const months = [
    { value: '01', label: 'Januari' },
    { value: '02', label: 'Februari' },
    { value: '03', label: 'Maret' },
    { value: '04', label: 'April' },
    { value: '05', label: 'Mei' },
    { value: '06', label: 'Juni' },
    { value: '07', label: 'Juli' },
    { value: '08', label: 'Agustus' },
    { value: '09', label: 'September' },
    { value: '10', label: 'Oktober' },
    { value: '11', label: 'November' },
    { value: '12', label: 'Desember' }
  ];

  return (
    <div className="flex flex-col md:flex-row gap-2 md:items-center">
      <span className="text-sm font-medium">Tampilkan:</span>
      <Select 
        value={filterType}
        onValueChange={(value) => onFilterTypeChange(value as 'month' | 'year')}
      >
        <SelectTrigger className="w-[140px]">
          <SelectValue placeholder="Pilih tampilan" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="month">Bulanan</SelectItem>
          <SelectItem value="year">Tahunan</SelectItem>
        </SelectContent>
      </Select>
      
      {filterType === 'month' ? (
        <>
          <Select
            value={selectedMonth}
            onValueChange={onMonthChange}
          >
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Pilih bulan" />
            </SelectTrigger>
            <SelectContent>
              {months.map((month) => (
                <SelectItem key={month.value} value={month.value}>
                  {month.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select
            value={selectedYear}
            onValueChange={onYearChange}
          >
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Pilih tahun" />
            </SelectTrigger>
            <SelectContent>
              {availableYears.map((year) => (
                <SelectItem key={year} value={year}>{year}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </>
      ) : (
        <Select
          value={selectedYear}
          onValueChange={onYearChange}
        >
          <SelectTrigger className="w-[120px]">
            <SelectValue placeholder="Pilih tahun" />
          </SelectTrigger>
          <SelectContent>
            {availableYears.map((year) => (
              <SelectItem key={year} value={year}>{year}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
    </div>
  );
};

export default DateFilterSelector;
