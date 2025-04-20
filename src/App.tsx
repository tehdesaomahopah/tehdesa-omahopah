
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Income from "./pages/dashboard/Income";
import Expense from "./pages/dashboard/Expense";
import CashSummary from "./pages/dashboard/CashSummary";
import Reports from "./pages/dashboard/Reports";
import Employees from "./pages/dashboard/Employees";

const queryClient = new QueryClient();

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/dashboard/:businessId/income" element={<Income />} />
            <Route path="/dashboard/:businessId/expense" element={<Expense />} />
            <Route path="/dashboard/:businessId/cash" element={<CashSummary />} />
            <Route path="/dashboard/:businessId/reports" element={<Reports />} />
            <Route path="/dashboard/:businessId/employees" element={<Employees />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
