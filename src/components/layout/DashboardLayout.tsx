
import React from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { 
  ArrowUpCircle, 
  ArrowDownCircle, 
  Wallet, 
  FileText, 
  ChevronLeft,
  Home
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const { businessId } = useParams<{ businessId: string }>();
  const navigate = useNavigate();
  const isMobile = useIsMobile();

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
      label: "Home", 
      href: "/" 
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
    <div className="flex min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      {/* Sidebar */}
      <div className="w-64 bg-white border-r border-gray-200 shadow-sm hidden md:block">
        <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-green-700 to-green-600">
          <h2 className="text-xl font-semibold text-white mt-4">{getBusinessName(businessId || '')}</h2>
        </div>
        <nav className="p-4">
          <ul className="space-y-2">
            {navigationItems.map((item) => (
              <li key={item.href}>
                <Link
                  to={item.href}
                  className={cn(
                    "flex items-center gap-2 p-2 rounded-md hover:bg-green-50 transition-colors",
                    window.location.pathname === item.href
                      ? "bg-gradient-to-r from-green-100 to-green-50 text-green-800 font-medium shadow-sm" 
                      : "text-gray-600"
                  )}
                >
                  <item.icon size={18} className={window.location.pathname === item.href ? "text-green-600" : ""} />
                  <span>{item.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      {/* Mobile navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 md:hidden z-10 shadow-lg">
        <div className="flex justify-around items-center">
          {navigationItems.map((item) => (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                "flex flex-col items-center gap-1 p-3",
                window.location.pathname === item.href 
                  ? "text-green-700" 
                  : "text-gray-600"
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
        <div className="max-w-7xl mx-auto bg-white rounded-lg shadow-sm p-6">
          {children}
        </div>
      </div>
    </div>
  );
};

export default DashboardLayout;
