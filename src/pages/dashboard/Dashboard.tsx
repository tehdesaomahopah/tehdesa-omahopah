import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useParams } from "react-router-dom";
import { BarChart, LineChart, PieChart } from "@/components/ui/chart";
import { ArrowUpCircle, ArrowDownCircle } from "lucide-react";

const Dashboard = () => {
  const { businessId } = useParams<{ businessId: string }>();

  // Dummy data for demonstration
  const incomeData = [
    { name: "Jan", value: 2400 },
    { name: "Feb", value: 1398 },
    { name: "Mar", value: 3200 },
    { name: "Apr", value: 2780 },
    { name: "May", value: 1890 },
    { name: "Jun", value: 2390 },
    { name: "Jul", value: 3490 },
  ];

  const expenseData = [
    { name: "Jan", value: 1400 },
    { name: "Feb", value: 2398 },
    { name: "Mar", value: 1200 },
    { name: "Apr", value: 1780 },
    { name: "May", value: 2890 },
    { name: "Jun", value: 1390 },
    { name: "Jul", value: 2490 },
  ];

  const cashFlowData = [
    { name: "Jan", income: 2400, expense: 1400 },
    { name: "Feb", income: 1398, expense: 2398 },
    { name: "Mar", income: 3200, expense: 1200 },
    { name: "Apr", income: 2780, expense: 1780 },
    { name: "May", income: 1890, expense: 2890 },
    { name: "Jun", income: 2390, expense: 1390 },
    { name: "Jul", income: 3490, expense: 2490 },
  ];

  const pieChartData = [
    { name: "Income", value: 2400 },
    { name: "Expense", value: 1398 },
    { name: "Cash", value: 3200 },
  ];

  return (
    <div className="container mx-auto py-8">
      <header className="mb-6">
        <h1 className="text-3xl font-semibold text-gray-800">Dashboard - {businessId}</h1>
        <p className="text-gray-500">Selamat datang di dashboard keuangan Anda.</p>
      </header>

      <Tabs defaultvalue="ringkasan" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="ringkasan">Ringkasan</TabsTrigger>
          <TabsTrigger value="pendapatan">Pendapatan</TabsTrigger>
          <TabsTrigger value="pengeluaran">Pengeluaran</TabsTrigger>
          <TabsTrigger value="arus-kas">Arus Kas</TabsTrigger>
          <TabsTrigger value="laporan">Laporan</TabsTrigger>
        </TabsList>
        <TabsContent value="ringkasan" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Total Pendapatan</CardTitle>
                <CardDescription>Ringkasan pendapatan keseluruhan</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">Rp 12,500,000</div>
                <div className="flex items-center text-sm text-green-500 mt-2">
                  <ArrowUpCircle className="h-4 w-4 mr-1" />
                  <span>+12% dari bulan lalu</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Total Pengeluaran</CardTitle>
                <CardDescription>Ringkasan pengeluaran keseluruhan</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">Rp 5,500,000</div>
                <div className="flex items-center text-sm text-red-500 mt-2">
                  <ArrowDownCircle className="h-4 w-4 mr-1" />
                  <span>-8% dari bulan lalu</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Arus Kas Bersih</CardTitle>
                <CardDescription>Ringkasan arus kas bersih</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">Rp 7,000,000</div>
                <div className="text-sm text-gray-500 mt-2">Stabil</div>
              </CardContent>
            </Card>
          </div>

          <Separator className="my-6" />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Grafik Pendapatan</CardTitle>
                <CardDescription>Analisis tren pendapatan dari waktu ke waktu</CardDescription>
              </CardHeader>
              <CardContent>
                <LineChart data={incomeData} dataKey="value" stroke="#82ca9d" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Grafik Pengeluaran</CardTitle>
                <CardDescription>Analisis tren pengeluaran dari waktu ke waktu</CardDescription>
              </CardHeader>
              <CardContent>
                <BarChart data={expenseData} dataKey="value" fill="#e48080" />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="pendapatan">
          <Card>
            <CardHeader>
              <CardTitle>Pendapatan</CardTitle>
            </CardHeader>
            <CardContent>
              <LineChart data={incomeData} dataKey="value" stroke="#82ca9d" />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pengeluaran">
          <Card>
            <CardHeader>
              <CardTitle>Pengeluaran</CardTitle>
            </CardHeader>
            <CardContent>
              <BarChart data={expenseData} dataKey="value" fill="#e48080" />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="arus-kas">
          <Card>
            <CardHeader>
              <CardTitle>Arus Kas</CardTitle>
            </CardHeader>
            <CardContent>
              <LineChart
                data={cashFlowData}
                dataKey="income"
                stroke="#82ca9d"
                dataKey2="expense"
                stroke2="#e48080"
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="laporan">
          <Card>
            <CardHeader>
              <CardTitle>Laporan</CardTitle>
            </CardHeader>
            <CardContent>
              <PieChart data={pieChartData} dataKey="value" nameKey="name" />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Dashboard;
