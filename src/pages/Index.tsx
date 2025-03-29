
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const navigate = useNavigate();
  
  const businesses = [
    { id: "cijati", name: "Teh Desa Cijati", image: "/placeholder.svg" },
    { id: "shaquilla", name: "Teh Desa Shaquilla", image: "/placeholder.svg" },
    { id: "kartini", name: "Teh Desa Kartini", image: "/placeholder.svg" }
  ];

  const handleBusinessSelect = (businessId: string) => {
    // Navigate to the dashboard for the selected business
    navigate(`/dashboard/${businessId}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-green-100">
      <div className="container mx-auto py-8 px-4">
        <header className="mb-10 text-center">
          <h1 className="text-4xl font-bold text-green-800 mb-2">Teh Desa Omah-Opah</h1>
          <p className="text-green-600">Aplikasi Manajemen Keuangan</p>
        </header>
        
        <div className="max-w-4xl mx-auto">
          <Card className="border-green-200 shadow-lg">
            <CardHeader className="bg-green-50 border-b border-green-100">
              <CardTitle className="text-2xl text-green-800">Pilih Usaha</CardTitle>
              <CardDescription>Silakan pilih usaha yang ingin Anda kelola</CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {businesses.map((business) => (
                  <div 
                    key={business.id}
                    className="flex flex-col items-center p-4 border border-green-200 rounded-lg hover:bg-green-50 cursor-pointer transition-colors"
                    onClick={() => handleBusinessSelect(business.id)}
                  >
                    <img 
                      src={business.image} 
                      alt={business.name} 
                      className="w-24 h-24 object-contain mb-4"
                    />
                    <h3 className="font-medium text-green-800">{business.name}</h3>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Index;
