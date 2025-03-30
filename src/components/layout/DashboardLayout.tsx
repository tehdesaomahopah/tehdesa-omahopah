
import { useEffect, useState } from "react";
import { Link, NavLink, useLocation, useParams } from "react-router-dom";
import { cn } from "@/lib/utils";
import { 
  BarChart3, 
  CalendarDays, 
  ChevronDown,
  LogOut,
  Menu,
  X,
  Banknote,
  TrendingUp,
  TrendingDown,
  FileBarChart
} from "lucide-react";
import { useBusinessResolver } from "@/hooks/business/useBusinessResolver";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const businessImages: Record<string, string> = {
  "cijati": "/lovable-uploads/f9c2176e-769a-418b-b132-effcf585d9d2.png",
  "shaquilla": "/lovable-uploads/6e49ba5d-9a6a-4856-8ced-cf1ec2227d64.png",
  "kartini": "/lovable-uploads/857b8953-cda3-4d8c-999b-f517b5af6cab.png"
};

const businessNames: Record<string, string> = {
  "cijati": "Teh Desa Cijati",
  "shaquilla": "Teh Desa Shaquilla",
  "kartini": "Teh Desa Kartini"
};

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const { businessId } = useParams<{ businessId: string }>();
  const { resolvedId } = useBusinessResolver(businessId);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const location = useLocation();

  // Close sidebar when location changes (mobile navigation)
  useEffect(() => {
    setIsSidebarOpen(false);
  }, [location]);

  const businessImage = businessId ? businessImages[businessId] : "";
  const businessName = businessId ? businessNames[businessId] : "Teh Desa";

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside 
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 transform bg-white shadow-lg transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-auto lg:h-screen", 
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Sidebar header with logo */}
        <div className="flex h-16 items-center justify-between border-b px-6">
          <Link to="/" className="flex items-center space-x-3">
            <span className="text-xl font-semibold">Teh Desa</span>
          </Link>
          <button 
            onClick={() => setIsSidebarOpen(false)}
            className="rounded-md p-1 text-gray-500 hover:bg-gray-100 hover:text-gray-700 lg:hidden"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Business info with logo */}
        {businessId && (
          <div className="flex flex-col items-center justify-center py-4 border-b">
            {businessImage && (
              <img 
                src={businessImage}
                alt={businessName}
                className="h-24 w-24 object-contain mb-2"
              />
            )}
            <h2 className="text-lg font-semibold text-gray-800">{businessName}</h2>
          </div>
        )}

        {/* Sidebar content/navigation */}
        <nav className="flex flex-col p-4 space-y-1">
          <NavLink
            to={`/dashboard/${businessId}/cash`}
            className={({ isActive }) => cn(
              "flex items-center rounded-md px-3 py-2 text-sm font-medium transition-all",
              isActive 
                ? "bg-emerald-50 text-emerald-600" 
                : "text-gray-600 hover:bg-gray-100 hover:text-gray-700"
            )}
          >
            <Banknote className="mr-3 h-5 w-5" />
            <span>Ringkasan Kas</span>
          </NavLink>

          <NavLink
            to={`/dashboard/${businessId}/income`}
            className={({ isActive }) => cn(
              "flex items-center rounded-md px-3 py-2 text-sm font-medium transition-all",
              isActive 
                ? "bg-emerald-50 text-emerald-600" 
                : "text-gray-600 hover:bg-gray-100 hover:text-gray-700"
            )}
          >
            <TrendingUp className="mr-3 h-5 w-5" />
            <span>Pendapatan</span>
          </NavLink>

          <NavLink
            to={`/dashboard/${businessId}/expense`}
            className={({ isActive }) => cn(
              "flex items-center rounded-md px-3 py-2 text-sm font-medium transition-all",
              isActive 
                ? "bg-emerald-50 text-emerald-600" 
                : "text-gray-600 hover:bg-gray-100 hover:text-gray-700"
            )}
          >
            <TrendingDown className="mr-3 h-5 w-5" />
            <span>Pengeluaran</span>
          </NavLink>

          <NavLink
            to={`/dashboard/${businessId}/reports`}
            className={({ isActive }) => cn(
              "flex items-center rounded-md px-3 py-2 text-sm font-medium transition-all",
              isActive 
                ? "bg-emerald-50 text-emerald-600" 
                : "text-gray-600 hover:bg-gray-100 hover:text-gray-700"
            )}
          >
            <FileBarChart className="mr-3 h-5 w-5" />
            <span>Laporan</span>
          </NavLink>
        </nav>
      </aside>

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top navigation */}
        <header className="flex h-16 items-center bg-white shadow-sm">
          <div className="flex w-full items-center justify-between px-4 lg:px-6">
            {/* Mobile menu button */}
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="rounded-md p-1 text-gray-500 hover:bg-gray-100 hover:text-gray-700 lg:hidden"
            >
              <Menu className="h-6 w-6" />
            </button>

            <div className="flex-1 lg:pl-2">
              <h2 className="text-lg font-semibold lg:hidden">
                {businessId ? businessNames[businessId] || "Dashboard" : "Dashboard"}
              </h2>
            </div>

            {/* User dropdown */}
            <div className="relative">
              <button 
                onClick={() => setIsDropdownOpen(!isDropdownOpen)} 
                className="flex items-center space-x-2 rounded-md p-1 hover:bg-gray-100"
              >
                <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                  <span className="text-sm font-medium text-gray-600">A</span>
                </div>
                <span className="hidden text-sm font-medium text-gray-700 lg:block">Admin</span>
                <ChevronDown className="h-4 w-4 text-gray-500" />
              </button>

              {/* Dropdown menu */}
              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5">
                  <Link 
                    to="/"
                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => setIsDropdownOpen(false)}
                  >
                    <LogOut className="mr-3 h-5 w-5" />
                    <span>Keluar</span>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto bg-gray-50 p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
