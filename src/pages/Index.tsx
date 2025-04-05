import React, { useState, useCallback, useEffect } from "react";
import { format, getYear, getMonth, startOfMonth, endOfMonth, startOfYear, endOfYear } from "date-fns";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";
import { BarChart } from "@/components/ui/charts";
import { useIncomeComparison } from "@/hooks/income/useIncomeComparison";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import DateFilterSelector from "@/components/filters/DateFilterSelector";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Index = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  
  // View type state (monthly or yearly)
  const [viewType, setViewType] = useState<"monthly" | "yearly">("yearly"); // Changed default to yearly
  
  // Month and Year selections
  const [selectedMonth, setSelectedMonth] = useState<string>(format(new Date(), 'MM'));
  const [selectedYear, setSelectedYear] = useState<string>(format(new Date(), 'yyyy'));
  
  // Display type (chart or table)
  const [displayType, setDisplayType] = useState<"chart" | "table">("chart");
  
  // Active tab (income or expense)
  const [activeTab, setActiveTab] = useState<"income" | "expense">("income");
  
  const businesses = [
    { id: "cijati", name: "Teh Desa Cijati", image: "/lovable-uploads/f9c2176e-769a-418b-b132-effcf585d9d2.png" },
    { id: "shaquilla", name: "Teh Desa Shaquilla", image: "/lovable-uploads/6e49ba5d-9a6a-4856-8ced-cf1ec2227d64.png" },
    { id: "kartini", name: "Teh Wangi Kartini", image: "/lovable-uploads/3108c4ce-6689-4fa2-a0fd-26e146de5614.png" }
  ];

  const { 
    incomeChartData,
    expenseChartData, 
    isLoading: isLoadingComparisonData 
  } = useIncomeComparison(
    businesses.map(b => b.id), 
    viewType, 
    parseInt(selectedMonth) - 1, 
    parseInt(selectedYear)
  );

  const handleBusinessSelect = (businessId: string) => {
    // Navigate to the dashboard for the selected business
    navigate(`/dashboard/${businessId}/cash`);
  };

  // Handle filter type change
  const handleFilterTypeChange = (value: 'month' | 'year') => {
    setViewType(value === 'month' ? 'monthly' : 'yearly');
  };

  // Period text for display
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

  const periodText = viewType === 'monthly' 
    ? `${months.find(m => m.value === selectedMonth)?.label} ${selectedYear}`
    : `Tahun ${selectedYear}`;
    
  // Get the active chart data based on current tab
  const activeChartData = activeTab === "income" ? incomeChartData : expenseChartData;

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-green-100">
      <div className="container mx-auto py-8 px-4">
        <header className="mb-10 text-center">
          <h1 className="text-4xl font-bold text-green-800 mb-2">Teh Desa Omah-Opah</h1>
          <p className="text-sm text-green-600 mb-4">
            Aplikasi manajemen keuangan yang dirancang untuk mencatat, mengelola, dan menganalisis arus kas dari usaha Omah-Opah.
            <br />
            Aplikasi ini hadir untuk membantu usaha berkembang dengan lebih tertata, transparan, dan berdaya saing dalam perjalanan menuju kesuksesan.</p>
          <div className="max-w-3xl mx-auto">
            <p className="text-green-700 font-bold italic">
              Seperti filosofi Desa, usaha ini dilakukan dengan penuh ketenangan dan kebersamaan
            </p>
          </div>
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

        {/* Comparison Charts */}
        <div className="max-w-6xl mx-auto">
          <Card className="border-green-200 shadow-lg">
            <CardHeader className="bg-green-50 border-b border-green-100">
              <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                <div>
                  <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "income" | "expense")}>
                    <TabsList>
                      <TabsTrigger value="income">Perbandingan Pendapatan</TabsTrigger>
                      <TabsTrigger value="expense">Perbandingan Pengeluaran</TabsTrigger>
                    </TabsList>
                  </Tabs>
                  <CardDescription className="mt-2">
                    Periode: {periodText}
                  </CardDescription>
                </div>
                <div className="flex flex-col md:flex-row gap-2">
                  <DateFilterSelector
                    filterType={viewType === 'monthly' ? 'month' : 'year'}
                    selectedMonth={selectedMonth}
                    selectedYear={selectedYear}
                    onFilterTypeChange={handleFilterTypeChange}
                    onMonthChange={setSelectedMonth}
                    onYearChange={setSelectedYear}
                  />
                  <Select value={displayType} onValueChange={(value) => setDisplayType(value as "chart" | "table")}>
                    <SelectTrigger className="w-[120px]">
                      <SelectValue placeholder="Tampilan" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="chart">Grafik</SelectItem>
                      <SelectItem value="table">Tabel</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              {isLoadingComparisonData ? (
                <div className="flex justify-center items-center h-96">
                  <p>Memuat data pendapatan...</p>
                </div>
              ) : activeChartData.length === 0 ? (
                <div className="flex justify-center items-center h-96">
                  <p>Tidak ada data pada periode ini.</p>
                </div>
              ) : displayType === "chart" ? (
                <div className="h-96 w-full">
                  <BarChart 
                    data={activeChartData}
                    dataKeys={["Cijati", "Shaquilla", "Kartini"]}
                    colors={["#10b981", "#E25822", "#DDA0DD"]} 
                  />
                  <div className="flex justify-center mt-4 gap-4">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-green-500"></div>
                      <span>Cijati</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: "#E25822" }}></div>
                      <span>Shaquilla</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: "#DDA0DD" }}></div>
                      <span>Kartini</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>
                          {viewType === "yearly" ? "Bulan" : "Tanggal"}
                        </TableHead>
                        <TableHead>Cijati</TableHead>
                        <TableHead>Shaquilla</TableHead>
                        <TableHead>Kartini</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {activeChartData.map((item, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium">{item.name}</TableCell>
                          <TableCell>Rp {item.Cijati.toLocaleString('id-ID')}</TableCell>
                          <TableCell>Rp {item.Shaquilla.toLocaleString('id-ID')}</TableCell>
                          <TableCell>Rp {item.Kartini.toLocaleString('id-ID')}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Index;
