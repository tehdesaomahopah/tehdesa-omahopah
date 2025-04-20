
import React from "react";
import { useForm } from "react-hook-form";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

interface EmployeeEditFormProps {
  employee: {
    id: string;
    name: string;
    work_date: string;
    business_id: string;
  };
}

interface FormData {
  name: string;
  workDate: Date;
}

const EmployeeEditForm: React.FC<EmployeeEditFormProps> = ({ employee }) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [date, setDate] = React.useState<Date>(new Date(employee.work_date));
  
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    defaultValues: {
      name: employee.name,
    },
  });

  const onSubmit = async (data: FormData) => {
    if (!date) return;

    try {
      const { error } = await supabase
        .from("employees")
        .update({
          name: data.name,
          work_date: format(date, "yyyy-MM-dd"),
        })
        .eq("id", employee.id);

      if (error) throw error;

      toast({
        title: "Berhasil",
        description: "Data karyawan berhasil diperbarui",
      });

      queryClient.invalidateQueries({ queryKey: ["employees", employee.business_id] });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Gagal memperbarui data karyawan",
      });
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <label htmlFor="name" className="text-sm font-medium">
          Nama Karyawan
        </label>
        <Input
          id="name"
          placeholder="Masukkan nama karyawan"
          {...register("name", { required: "Nama karyawan harus diisi" })}
        />
        {errors.name && (
          <p className="text-sm text-destructive">{errors.name.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Tanggal Kerja</label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-full justify-start text-left font-normal",
                !date && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {date ? format(date, "dd MMMM yyyy", { locale: id }) : "Pilih tanggal"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={date}
              onSelect={(newDate) => newDate && setDate(newDate)}
              locale={id}
            />
          </PopoverContent>
        </Popover>
      </div>

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Menyimpan..." : "Simpan"}
      </Button>
    </form>
  );
};

export default EmployeeEditForm;
