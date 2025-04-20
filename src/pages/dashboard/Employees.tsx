
import React from "react";
import { useParams } from "react-router-dom";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import DashboardLayout from "@/components/layout/DashboardLayout";
import EmployeeForm from "@/components/employees/EmployeeForm";
import EmployeeList from "@/components/employees/EmployeeList";

const Employees = () => {
  const { businessId } = useParams<{ businessId: string }>();

  if (!businessId) {
    return <div>Loading...</div>;
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">KaryawanKu</h2>
          <p className="text-muted-foreground">
            Kelola data karyawan yang bekerja setiap harinya
          </p>
        </div>
        
        <EmployeeForm businessId={businessId} />
        <EmployeeList businessId={businessId} />
      </div>
    </DashboardLayout>
  );
};

export default Employees;
