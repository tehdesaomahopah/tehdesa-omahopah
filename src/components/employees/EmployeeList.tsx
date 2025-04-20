
import React, { useState } from "react";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import { useQuery } from "@tanstack/react-query";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import DateFilterSelector from "@/components/filters/DateFilterSelector";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import MonthlyView from "./tables/MonthlyView";
import YearlyView from "./tables/YearlyView";
import CustomView from "./tables/CustomView";

interface EmployeeListProps {
  businessId: string;
}

const EmployeeList: React.FC<EmployeeListProps> = ({ businessId }) => {
  const { toast } = useToast();
  const [viewType, setViewType] = useState<"monthly" | "yearly" | "custom">("monthly");
  const [selectedMonth, setSelectedMonth] = useState(format(new Date(), "MM"));
  const [selectedYear, setSelectedYear] = useState(format(new Date(), "yyyy"));
  const [startDate, setStartDate] = useState<Date>(new Date());
  const [endDate, setEndDate] = useState<Date>(new Date());

  const fetchEmployees = async () => {
    let query = supabase
      .from("employees")
      .select("*")
      .eq("business_id", businessId)
      .order("work_date", { ascending: false });

    if (viewType === "monthly") {
      const startOfMonth = `${selectedYear}-${selectedMonth}-01`;
      const endOfMonth = format(new Date(parseInt(selectedYear), parseInt(selectedMonth), 0), "yyyy-MM-dd");
      query = query.gte("work_date", startOfMonth).lte("work_date", endOfMonth);
    } else if (viewType === "yearly") {
      query = query.gte("work_date", `${selectedYear}-01-01`).lte("work_date", `${selectedYear}-12-31`);
    } else if (viewType === "custom") {
      query = query
        .gte("work_date", format(startDate, "yyyy-MM-dd"))
        .lte("work_date", format(endDate, "yyyy-MM-dd"));
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
  };

  const { data: employees, isLoading } = useQuery({
    queryKey: ["employees", businessId, viewType, selectedMonth, selectedYear, startDate, endDate],
    queryFn: fetchEmployees,
  });

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from("employees")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Berhasil",
        description: "Data karyawan berhasil dihapus",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Gagal menghapus data karyawan",
      });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <h3 className="text-lg font-medium">Rekap Data Karyawan</h3>
        <div className="flex gap-2">
          <Select value={viewType} onValueChange={(value: "monthly" | "yearly" | "custom") => setViewType(value)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Pilih periode" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="monthly">Bulanan</SelectItem>
              <SelectItem value="yearly">Tahunan</SelectItem>
              <SelectItem value="custom">Kustom</SelectItem>
            </SelectContent>
          </Select>
          
          {viewType !== "custom" && (
            <DateFilterSelector
              filterType={viewType === "monthly" ? "month" : "year"}
              selectedMonth={selectedMonth}
              selectedYear={selectedYear}
              onMonthChange={setSelectedMonth}
              onYearChange={setSelectedYear}
              onFilterTypeChange={(type) => setViewType(type === "month" ? "monthly" : "yearly")}
            />
          )}
        </div>
      </div>

      {viewType === "custom" && (
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <label className="text-sm font-medium">Tanggal Mulai</label>
            <Calendar
              mode="single"
              selected={startDate}
              onSelect={(date) => date && setStartDate(date)}
              className="rounded-md border"
              locale={idLocale}
            />
          </div>
          <div className="flex-1">
            <label className="text-sm font-medium">Tanggal Akhir</label>
            <Calendar
              mode="single"
              selected={endDate}
              onSelect={(date) => date && setEndDate(date)}
              className="rounded-md border"
              locale={idLocale}
            />
          </div>
        </div>
      )}

      <div className="rounded-md border">
        {viewType === "monthly" && (
          <MonthlyView data={employees || []} isLoading={isLoading} />
        )}
        {viewType === "yearly" && (
          <YearlyView data={employees || []} isLoading={isLoading} />
        )}
        {viewType === "custom" && (
          <CustomView 
            data={employees || []} 
            isLoading={isLoading} 
            onDelete={handleDelete}
          />
        )}
      </div>
    </div>
  );
};

export default EmployeeList;
