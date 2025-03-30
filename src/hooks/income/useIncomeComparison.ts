
import { useState, useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { format, parseISO, isWithinInterval, eachDayOfInterval, startOfMonth, endOfMonth, startOfYear, endOfYear, getDate } from "date-fns";
import { id } from "date-fns/locale"; // Indonesian locale
import { supabase } from "@/integrations/supabase/client";
import { mapIncomeFromRow } from "@/types/supabase";

export const useIncomeComparison = (businessIds: string[], fromDate: Date, toDate: Date) => {
  // Determine if we're using monthly or yearly view
  const diffDays = Math.ceil((toDate.getTime() - fromDate.getTime()) / (1000 * 60 * 60 * 24));
  const useYearlyGrouping = diffDays > 100; // If more than ~3 months, use yearly grouping

  // Fetch income data from Supabase for all businesses
  const { data: incomesData, isLoading, error } = useQuery({
    queryKey: ['incomes-comparison', businessIds, fromDate.toISOString(), toDate.toISOString()],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('incomes')
        .select('*')
        .in('business_id', businessIds)
        .gte('date', fromDate.toISOString())
        .lte('date', toDate.toISOString());
        
      if (error) {
        console.error("Error fetching incomes:", error);
        throw error;
      }
      
      return data.map(income => mapIncomeFromRow(income));
    }
  });
  
  // Process data for the chart
  const chartData = useMemo(() => {
    if (!incomesData) return [];

    // Group by month or year depending on the date range
    if (useYearlyGrouping) {
      // Group by year
      const yearlyData = businessIds.reduce((acc, businessId) => {
        const businessIncomes = incomesData.filter(income => income.businessId === businessId);
        
        businessIncomes.forEach(income => {
          const year = new Date(income.date).getFullYear();
          const yearKey = `${year}`;
          
          if (!acc[yearKey]) {
            acc[yearKey] = businessIds.reduce((businessAcc, id) => {
              businessAcc[id === 'cijati' ? 'Cijati' : id === 'shaquilla' ? 'Shaquilla' : 'Kartini'] = 0;
              return businessAcc;
            }, { name: yearKey } as Record<string, any>);
          }
          
          const businessKey = businessId === 'cijati' ? 'Cijati' : businessId === 'shaquilla' ? 'Shaquilla' : 'Kartini';
          acc[yearKey][businessKey] += Number(income.amount);
        });
        
        return acc;
      }, {} as Record<string, Record<string, any>>);
      
      return Object.values(yearlyData).sort((a, b) => {
        const yearA = parseInt(a.name);
        const yearB = parseInt(b.name);
        return yearA - yearB;
      });
    } else {
      // Group by day or month depending on date range
      const isMonthView = diffDays <= 31;
      
      if (isMonthView) {
        // Group by day for monthly view
        const dailyData = businessIds.reduce((acc, businessId) => {
          const businessIncomes = incomesData.filter(income => income.businessId === businessId);
          
          // Create entries for all days in the range
          const days = eachDayOfInterval({ start: fromDate, end: toDate });
          days.forEach(day => {
            // Format as just the date number (1, 2, 3, etc.)
            const dayKey = `${getDate(day)}`;
            
            if (!acc[dayKey]) {
              acc[dayKey] = businessIds.reduce((businessAcc, id) => {
                businessAcc[id === 'cijati' ? 'Cijati' : id === 'shaquilla' ? 'Shaquilla' : 'Kartini'] = 0;
                return businessAcc;
              }, { name: dayKey } as Record<string, any>);
            }
          });
          
          // Add income data to the corresponding days
          businessIncomes.forEach(income => {
            const dayKey = `${getDate(new Date(income.date))}`;
            const businessKey = businessId === 'cijati' ? 'Cijati' : businessId === 'shaquilla' ? 'Shaquilla' : 'Kartini';
            
            if (acc[dayKey]) {
              acc[dayKey][businessKey] += Number(income.amount);
            }
          });
          
          return acc;
        }, {} as Record<string, Record<string, any>>);
        
        // Sort by day of month
        return Object.values(dailyData).sort((a, b) => {
          return parseInt(a.name) - parseInt(b.name);
        });
      } else {
        // Group by month for yearly view
        const monthlyData = businessIds.reduce((acc, businessId) => {
          const businessIncomes = incomesData.filter(income => income.businessId === businessId);
          
          businessIncomes.forEach(income => {
            // Format with Indonesian month names
            const monthKey = format(new Date(income.date), "MMMM", { locale: id });
            
            if (!acc[monthKey]) {
              acc[monthKey] = businessIds.reduce((businessAcc, id) => {
                businessAcc[id === 'cijati' ? 'Cijati' : id === 'shaquilla' ? 'Shaquilla' : 'Kartini'] = 0;
                return businessAcc;
              }, { name: monthKey } as Record<string, any>);
            }
            
            const businessKey = businessId === 'cijati' ? 'Cijati' : businessId === 'shaquilla' ? 'Shaquilla' : 'Kartini';
            acc[monthKey][businessKey] += Number(income.amount);
          });
          
          return acc;
        }, {} as Record<string, Record<string, any>>);
        
        // Map of month names to their numeric values for sorting
        const monthOrder: Record<string, number> = {
          "Januari": 0, "Februari": 1, "Maret": 2, "April": 3, 
          "Mei": 4, "Juni": 5, "Juli": 6, "Agustus": 7, 
          "September": 8, "Oktober": 9, "November": 10, "Desember": 11
        };
        
        // Sort by month order
        return Object.values(monthlyData).sort((a, b) => {
          return monthOrder[a.name] - monthOrder[b.name];
        });
      }
    }
  }, [incomesData, businessIds, useYearlyGrouping, diffDays, fromDate, toDate]);

  return {
    chartData,
    isLoading,
    error
  };
};
