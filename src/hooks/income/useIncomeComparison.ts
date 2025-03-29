
import { useState, useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { format, parseISO, isWithinInterval, eachDayOfInterval, startOfMonth, endOfMonth, startOfYear, endOfYear } from "date-fns";
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
      // Group by month
      const monthlyData = businessIds.reduce((acc, businessId) => {
        const businessIncomes = incomesData.filter(income => income.businessId === businessId);
        
        businessIncomes.forEach(income => {
          const monthKey = format(income.date, 'MMM yyyy');
          
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
      
      return Object.values(monthlyData).sort((a, b) => {
        const dateA = new Date(a.name);
        const dateB = new Date(b.name);
        return dateA.getTime() - dateB.getTime();
      });
    }
  }, [incomesData, businessIds, useYearlyGrouping]);

  return {
    chartData,
    isLoading,
    error
  };
};
