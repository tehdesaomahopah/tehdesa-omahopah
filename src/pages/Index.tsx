
import { useState, useCallback, useEffect } from "react";
import { format, getYear, getMonth, startOfMonth, endOfMonth, startOfYear, endOfYear } from "date-fns";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";
import { BarChart } from "@/components/ui/charts";
import { useIncomeComparison } from "@/hooks/income/useIncomeComparison";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const Index = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  
  // View type state (monthly or yearly)
  const [viewType, setViewType] = useState<"monthly" | "yearly">("monthly");
  
  // Month and Year selections
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  
  // Calculate date range based on view type and selections
  const [dateRange, setDateRange] = useState<{
    from: Date;
    to: Date;
  }>(() => {
    if (viewType === "monthly") {
      const currentDate = new Date(selectedYear, selectedMonth);
      return {
        from: startOfMonth(currentDate),
        to: endOfMonth(currentDate),
      };
    } else {
      return {
        from: startOfYear(new Date(selectedYear, 0)),
        to: endOfYear(new Date(selectedYear, 0)),
      };
    }
  });

  // Update date range when selections change
  useEffect(() => {
    if (viewType === "monthly") {
      const monthDate = new Date(selectedYear, selectedMonth);
      setDateRange({
        from: startOfMonth(monthDate),
        to: endOfMonth(monthDate),
      });
    } else {
      setDateRange({
        from: startOfYear(new Date(selectedYear, 0)),
        to: endOfYear(new Date(selectedYear, 0)),
      });
    }
  }, [viewType, selectedMonth, selectedYear]);

  // Update date range when view type changes
  const handleViewTypeChange = useCallback((value: "monthly" | "yearly") => {
    setViewType(value);
    if (value === "monthly") {
      const monthDate = new Date(selectedYear, selectedMonth);
      setDateRange({
        from: startOfMonth(monthDate),
        to: endOfMonth(monthDate),
      });
    } else {
      setDateRange({
        from: startOfYear(new Date(selectedYear, 0)),
        to: endOfYear(new Date(selectedYear, 0)),
      });
    }
  }, [selectedMonth, selectedYear]);

  const businesses = [
    { id: "cijati", name: "Teh Desa Cijati", image: "/lovable-uploads/f9c2176e-769a-418b-b132-effcf585d9d2.png" },
    { id: "shaquilla", name: "Teh Desa Shaquilla", image: "/lovable-uploads/6e49ba5d-9a6a-4856-8ced-cf1ec2227d64.png" },
    { id: "kartini", name: "Teh Desa Kartini", image: "/lovable-uploads/857b8953-cda3-4d8c-999b-f517b5af6cab.png" }
  ];

  const { 
    chartData, 
    isLoading: isLoadingIncomeData 
  } = useIncomeComparison(businesses.map(b => b.id), dateRange.from, dateRange.to);

  const handleBusinessSelect = (businessId: string) => {
    // Navigate to the dashboard for the selected business
    navigate(`/dashboard/${businessId}/cash`);
  };

  // Generate month options
  const months = [
    { value: 0, label: "Januari" },
    { value: 1, label: "Februari" },
    { value: 2, label: "Maret" },
    { value: 3, label: "April" },
    { value: 4, label: "Mei" },
    { value: 5, label: "Juni" },
    { value: 6, label: "Juli" },
    { value: 7, label: "Agustus" },
    { value: 8, label: "September" },
    { value: 9, label: "Oktober" },
    { value: 10, label: "November" },
    { value: 11, label: "Desember" }
  ];

  // Generate year options (last 5 years to next 5 years)
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 11 }, (_, i) => currentYear - 5 + i);

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-green-100">
      <div className="container mx-auto py-8 px-4">
        <header className="mb-10 text-center">
          <h1 className="text-4xl font-bold text-green-800 mb-2">Teh Desa Omah-Opah</h1>
          <p className="text-green-600">Aplikasi Manajemen Keuangan</p>
        </header>
        
        <div className="max-w-4xl mx-auto mb-8">
          <Card className="border-green-200 shadow-lg">
            <CardHeader className="bg-green-50 border-b border-green-100">
              <CardTitle className="text-2xl text-green-800">Pilih Usaha</CardTitle>
              <CardDescription>Silakan pilih usaha yang ingin Anda kelola</CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {businesses.map((business) => (
                  <div 
                    key={business.id}
                    className="flex flex-col items-center p-4 border border-green-200 rounded-lg hover:bg-green-50 cursor-pointer transition-colors"
                    onClick={() => handleBusinessSelect(business.id)}
                  >
                    <img 
                      src={business.image} 
                      alt={business.name} 
                      className="w-32 h-32 object-contain mb-4"
                    />
                    <h3 className="font-medium text-green-800">{business.name}</h3>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Income Comparison Chart */}
        <div className="max-w-6xl mx-auto">
          <Card className="border-green-200 shadow-lg">
            <CardHeader className="bg-green-50 border-b border-green-100">
              <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                <div>
                  <CardTitle className="text-2xl text-green-800">Perbandingan Pendapatan</CardTitle>
                  <CardDescription>Perbandingan pendapatan dari ketiga usaha</CardDescription>
                </div>
                <div className="flex items-center gap-4">
                  {/* View type selector */}
                  <Select
                    value={viewType}
                    onValueChange={(value) => handleViewTypeChange(value as "monthly" | "yearly")}
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Pilih periode" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="monthly">Bulanan</SelectItem>
                      <SelectItem value="yearly">Tahunan</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  {/* Month selector (only shown when viewType is monthly) */}
                  {viewType === "monthly" && (
                    <Select
                      value={selectedMonth.toString()}
                      onValueChange={(value) => setSelectedMonth(parseInt(value))}
                    >
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Pilih bulan" />
                      </SelectTrigger>
                      <SelectContent>
                        {months.map((month) => (
                          <SelectItem key={month.value} value={month.value.toString()}>
                            {month.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                  
                  {/* Year selector */}
                  <Select
                    value={selectedYear.toString()}
                    onValueChange={(value) => setSelectedYear(parseInt(value))}
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Pilih tahun" />
                    </SelectTrigger>
                    <SelectContent>
                      {years.map((year) => (
                        <SelectItem key={year} value={year.toString()}>
                          {year}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="h-96 w-full">
                {isLoadingIncomeData ? (
                  <div className="flex justify-center items-center h-full">
                    <p>Memuat data pendapatan...</p>
                  </div>
                ) : chartData.length === 0 ? (
                  <div className="flex justify-center items-center h-full">
                    <p>Tidak ada data pendapatan pada periode ini.</p>
                  </div>
                ) : (
                  <BarChart 
                    data={chartData}
                    dataKeys={["Cijati", "Shaquilla", "Kartini"]}
                    colors={["#10b981", "#3b82f6", "#8b5cf6"]} 
                  />
                )}
              </div>
              <div className="flex justify-center mt-4 gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  <span>Teh Desa Cijati</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                  <span>Teh Desa Shaquilla</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                  <span>Teh Desa Kartini</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Index;
