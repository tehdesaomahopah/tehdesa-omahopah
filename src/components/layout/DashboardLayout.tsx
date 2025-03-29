
import React from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { 
  Home, 
  ArrowUpCircle, 
  ArrowDownCircle, 
  Wallet, 
  FileText, 
  BarChart3,
  ChevronLeft
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const { businessId } = useParams<{ businessId: string }>();
  const navigate = useNavigate();

  const getBusinessName = (id: string) => {
    switch (id) {
      case 'cijati':
        return 'Teh Desa Cijati';
      case 'shaquilla':
        return 'Teh Desa Shaquilla';
      case 'kartini':
        return 'Teh Desa Kartini';
      default:
        return 'Teh Desa';
    }
  };

  const navigationItems = [
    { 
      icon: Home, 
      label: "Dashboard", 
      href: `/dashboard/${businessId}` 
    },
    { 
      icon: ArrowUpCircle, 
      label: "Pendapatan", 
      href: `/dashboard/${businessId}/income` 
    },
    { 
      icon: ArrowDownCircle, 
      label: "Pengeluaran", 
      href: `/dashboard/${businessId}/expense` 
    },
    { 
      icon: Wallet, 
      label: "KasKu", 
      href: `/dashboard/${businessId}/cash` 
    },
    { 
      icon: FileText, 
      label: "Laporan", 
      href: `/dashboard/${businessId}/reports` 
    },
  ];

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-64 bg-white border-r border-gray-200 hidden md:block">
        <div className="p-4 border-b border-gray-200">
          <Link to="/">
            <Button variant="ghost" className="flex items-center gap-2 text-green-700">
              <ChevronLeft size={16} />
              <span>Kembali</span>
            </Button>
          </Link>
          <h2 className="text-xl font-semibold text-green-800 mt-4">{getBusinessName(businessId || '')}</h2>
        </div>
        <nav className="p-4">
          <ul className="space-y-2">
            {navigationItems.map((item) => (
              <li key={item.href}>
                <Link
                  to={item.href}
                  className={cn(
                    "flex items-center gap-2 p-2 rounded-md hover:bg-green-50 transition-colors",
                    window.location.pathname === item.href ? "bg-green-100 text-green-800" : "text-gray-600"
                  )}
                >
                  <item.icon size={18} />
                  <span>{item.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      {/* Mobile navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 md:hidden z-10">
        <div className="flex justify-around items-center">
          {navigationItems.map((item) => (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                "flex flex-col items-center gap-1 p-3",
                window.location.pathname === item.href ? "text-green-800" : "text-gray-600"
              )}
            >
              <item.icon size={20} />
              <span className="text-xs">{item.label}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 p-4 overflow-auto pb-20 md:pb-4">
        {children}
      </div>
    </div>
  );
};

export default DashboardLayout;
