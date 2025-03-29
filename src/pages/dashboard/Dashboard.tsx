
import { useParams } from "react-router-dom";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Bar } from "recharts";
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Calendar as CalendarIcon
} from "lucide-react";
import { format } from "date-fns";

// Dummy data for charts
const incomeData = [
  { name: 'Jan', amount: 4000 },
  { name: 'Feb', amount: 3000 },
  { name: 'Mar', amount: 5000 },
  { name: 'Apr', amount: 4500 },
  { name: 'May', amount: 6000 },
  { name: 'Jun', amount: 5500 },
];

const expenseData = [
  { name: 'Jan', amount: 2000 },
  { name: 'Feb', amount: 2200 },
  { name: 'Mar', amount: 2500 },
  { name: 'Apr', amount: 2300 },
  { name: 'May', amount: 3000 },
  { name: 'Jun', amount: 2800 },
];

const comparativeData = [
  { name: 'Jan', income: 4000, expense: 2000 },
  { name: 'Feb', income: 3000, expense: 2200 },
  { name: 'Mar', income: 5000, expense: 2500 },
  { name: 'Apr', income: 4500, expense: 2300 },
  { name: 'May', income: 6000, expense: 3000 },
  { name: 'Jun', income: 5500, expense: 2800 },
];

const Dashboard = () => {
  const { businessId } = useParams<{ businessId: string }>();
  
  const totalIncome = incomeData.reduce((sum, item) => sum + item.amount, 0);
  const totalExpense = expenseData.reduce((sum, item) => sum + item.amount, 0);
  const profit = totalIncome - totalExpense;
  const profitRate = (profit / totalIncome) * 100;

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
        <p className="text-gray-600">Ringkasan keuangan Anda per {format(new Date(), "dd MMMM yyyy")}</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Total Pendapatan</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <TrendingUp className="w-5 h-5 mr-2 text-green-500" />
              <div className="text-2xl font-bold">Rp {totalIncome.toLocaleString()}</div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Total Pengeluaran</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <TrendingDown className="w-5 h-5 mr-2 text-red-500" />
              <div className="text-2xl font-bold">Rp {totalExpense.toLocaleString()}</div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Keuntungan</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col">
              <div className="flex items-center">
                <DollarSign className="w-5 h-5 mr-2 text-blue-500" />
                <div className="text-2xl font-bold">Rp {profit.toLocaleString()}</div>
              </div>
              <div className="text-sm text-gray-500 mt-1">
                Profit rate: {profitRate.toFixed(1)}%
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Pendapatan vs Pengeluaran</CardTitle>
            <CardDescription>Perbandingan 6 bulan terakhir</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={comparativeData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={(value) => `Rp ${value.toLocaleString()}`} />
                  <Legend />
                  <Bar dataKey="income" name="Pendapatan" fill="#10B981" />
                  <Bar dataKey="expense" name="Pengeluaran" fill="#EF4444" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Tren Keuangan</CardTitle>
            <CardDescription>Perkembangan 6 bulan terakhir</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={comparativeData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={(value) => `Rp ${value.toLocaleString()}`} />
                  <Legend />
                  <Line type="monotone" dataKey="income" name="Pendapatan" stroke="#10B981" activeDot={{ r: 8 }} />
                  <Line type="monotone" dataKey="expense" name="Pengeluaran" stroke="#EF4444" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent transactions */}
      <Card>
        <CardHeader>
          <CardTitle>Transaksi Terbaru</CardTitle>
          <CardDescription>5 transaksi terakhir</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { type: 'income', description: 'Penjualan Teh Desa', amount: 850000, date: '2023-06-15' },
              { type: 'expense', description: 'Belanja Bahan', amount: 350000, date: '2023-06-14' },
              { type: 'income', description: 'Konsinyasi Toko Jaya', amount: 540000, date: '2023-06-13' },
              { type: 'expense', description: 'Upah Pegawai', amount: 450000, date: '2023-06-12' },
              { type: 'income', description: 'Penjualan Online', amount: 320000, date: '2023-06-10' },
            ].map((transaction, index) => (
              <div key={index} className="flex items-center justify-between border-b border-gray-100 pb-3">
                <div className="flex items-center">
                  {transaction.type === 'income' ? (
                    <ArrowUpCircle className="w-10 h-10 mr-3 text-green-500" />
                  ) : (
                    <ArrowDownCircle className="w-10 h-10 mr-3 text-red-500" />
                  )}
                  <div>
                    <p className="font-medium">{transaction.description}</p>
                    <div className="flex items-center text-sm text-gray-500">
                      <CalendarIcon className="w-3 h-3 mr-1" />
                      <span>{format(new Date(transaction.date), "dd MMM yyyy")}</span>
                    </div>
                  </div>
                </div>
                <div className={`font-semibold ${transaction.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                  {transaction.type === 'income' ? '+' : '-'} Rp {transaction.amount.toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
};

export default Dashboard;
