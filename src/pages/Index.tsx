
import { useState } from "react";
import { format, addMonths, startOfMonth, endOfMonth, startOfYear, endOfYear } from "date-fns";
import { useNavigate } from "react-router-dom";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { BarChart } from "@/components/ui/charts";
import { useIncomeComparison } from "@/hooks/income/useIncomeComparison";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const Index = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  
  // View type state (monthly or yearly)
  const [viewType, setViewType] = useState<"monthly" | "yearly">("monthly");
  
  // Custom date range filter
  const [dateRange, setDateRange] = useState<{
    from: Date;
    to: Date;
  }>(() => {
    if (viewType === "monthly") {
      return {
        from: startOfMonth(new Date()), // First day of current month
        to: endOfMonth(new Date()), // Last day of current month
      };
    } else {
      return {
        from: startOfYear(new Date()), // First day of current year
        to: endOfYear(new Date()), // Last day of current year
      };
    }
  });

  // Update date range when view type changes
  const handleViewTypeChange = (value: "monthly" | "yearly") => {
    setViewType(value);
    if (value === "monthly") {
      setDateRange({
        from: startOfMonth(new Date()),
        to: endOfMonth(new Date()),
      });
    } else {
      setDateRange({
        from: startOfYear(new Date()),
        to: endOfYear(new Date()),
      });
    }
  };

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
                  
                  <div className="flex items-center gap-2">
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className="justify-start text-left font-normal"
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {format(dateRange.from, "dd MMM yyyy")}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={dateRange.from}
                          onSelect={(date) => date && setDateRange({ ...dateRange, from: date })}
                          initialFocus
                          className="p-3 pointer-events-auto"
                        />
                      </PopoverContent>
                    </Popover>
                    <span>-</span>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className="justify-start text-left font-normal"
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {format(dateRange.to, "dd MMM yyyy")}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={dateRange.to}
                          onSelect={(date) => date && setDateRange({ ...dateRange, to: date })}
                          initialFocus
                          className="p-3 pointer-events-auto"
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
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
                    dataKey="Cijati" 
                    fill="#10b981"
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
