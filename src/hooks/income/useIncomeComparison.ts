
import { useState, useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { format, parseISO, isWithinInterval, eachDayOfInterval, startOfMonth, endOfMonth, startOfYear, endOfYear, getDate } from "date-fns";
import { id } from 'date-fns/locale';
import { supabase } from "@/integrations/supabase/client";
import { mapIncomeFromRow } from "@/types/supabase";

export const useIncomeComparison = (businessIds: string[], viewType: "monthly" | "yearly", selectedMonth: number, selectedYear: number) => {
  // Calculate date range based on view type and selections
  const dateRange = useMemo(() => {
    if (viewType === "monthly") {
      const monthDate = new Date(selectedYear, selectedMonth);
      return {
        from: startOfMonth(monthDate),
        to: endOfMonth(monthDate),
      };
    } else {
      return {
        from: startOfYear(new Date(selectedYear, 0)),
        to: endOfYear(new Date(selectedYear, 0)),
      };
    }
  }, [viewType, selectedMonth, selectedYear]);

  // Fetch income data from Supabase for all businesses
  const { data: incomesData, isLoading, error } = useQuery({
    queryKey: ['incomes-comparison', businessIds, dateRange.from.toISOString(), dateRange.to.toISOString()],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('incomes')
        .select('*')
        .in('business_id', businessIds)
        .gte('date', dateRange.from.toISOString())
        .lte('date', dateRange.to.toISOString());
        
      if (error) {
        console.error("Error fetching incomes:", error);
        throw error;
      }
      
      return data.map(income => mapIncomeFromRow(income));
    }
  });

  // Fetch expense data from Supabase for all businesses
  const { data: expensesData, isLoading: isLoadingExpenses } = useQuery({
    queryKey: ['expenses-comparison', businessIds, dateRange.from.toISOString(), dateRange.to.toISOString()],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('expenses')
        .select('*')
        .in('business_id', businessIds)
        .gte('date', dateRange.from.toISOString())
        .lte('date', dateRange.to.toISOString());
        
      if (error) {
        console.error("Error fetching expenses:", error);
        throw error;
      }
      
      return data;
    }
  });
  
  // Process data for the income chart
  const incomeChartData = useMemo(() => {
    if (!incomesData) return [];

    // Define months in Indonesian
    const months = [
      'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ];

    if (viewType === "yearly") {
      // Group by month for yearly view
      const monthlyData = businessIds.reduce((acc, businessId) => {
        const businessIncomes = incomesData.filter(income => income.businessId === businessId);
        
        // Initialize all months
        months.forEach((monthName, index) => {
          const monthKey = monthName;
          
          if (!acc[monthKey]) {
            acc[monthKey] = { name: monthKey };
            businessIds.forEach(id => {
              const businessKey = id === 'cijati' ? 'Cijati' : id === 'shaquilla' ? 'Shaquilla' : 'Kartini';
              acc[monthKey][businessKey] = 0;
            });
          }
        });
        
        // Aggregate income by month
        businessIncomes.forEach(income => {
          const monthIndex = new Date(income.date).getMonth();
          const monthName = months[monthIndex];
          
          if (acc[monthName]) {
            const businessKey = businessId === 'cijati' ? 'Cijati' : businessId === 'shaquilla' ? 'Shaquilla' : 'Kartini';
            acc[monthName][businessKey] += Number(income.amount);
          }
        });
        
        return acc;
      }, {} as Record<string, Record<string, any>>);
      
      // Convert to array and sort by month order
      return Object.values(monthlyData).sort((a, b) => {
        const indexA = months.indexOf(a.name);
        const indexB = months.indexOf(b.name);
        return indexA - indexB;
      });
    } else {
      // Group by day for monthly view
      const dailyData = businessIds.reduce((acc, businessId) => {
        const businessIncomes = incomesData.filter(income => income.businessId === businessId);
        
        // Create entries for all days in the range
        const days = eachDayOfInterval({ start: dateRange.from, end: dateRange.to });
        days.forEach(day => {
          const dayKey = format(day, 'dd');
          
          if (!acc[dayKey]) {
            acc[dayKey] = { name: dayKey };
            businessIds.forEach(id => {
              const businessKey = id === 'cijati' ? 'Cijati' : id === 'shaquilla' ? 'Shaquilla' : 'Kartini';
              acc[dayKey][businessKey] = 0;
            });
          }
        });
        
        // Add income data to the corresponding days
        businessIncomes.forEach(income => {
          const dayKey = format(new Date(income.date), 'dd');
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
    }
  }, [incomesData, businessIds, viewType, dateRange]);
  
  // Process data for the expense chart
  const expenseChartData = useMemo(() => {
    if (!expensesData) return [];

    // Define months in Indonesian
    const months = [
      'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ];

    if (viewType === "yearly") {
      // Group by month for yearly view
      const monthlyData = businessIds.reduce((acc, businessId) => {
        const businessExpenses = expensesData.filter(expense => expense.business_id === businessId);
        
        // Initialize all months
        months.forEach((monthName, index) => {
          const monthKey = monthName;
          
          if (!acc[monthKey]) {
            acc[monthKey] = { name: monthKey };
            businessIds.forEach(id => {
              const businessKey = id === 'cijati' ? 'Cijati' : id === 'shaquilla' ? 'Shaquilla' : 'Kartini';
              acc[monthKey][businessKey] = 0;
            });
          }
        });
        
        // Aggregate expenses by month
        businessExpenses.forEach(expense => {
          const monthIndex = new Date(expense.date).getMonth();
          const monthName = months[monthIndex];
          
          if (acc[monthName]) {
            const businessKey = businessId === 'cijati' ? 'Cijati' : businessId === 'shaquilla' ? 'Shaquilla' : 'Kartini';
            acc[monthName][businessKey] += Number(expense.amount);
          }
        });
        
        return acc;
      }, {} as Record<string, Record<string, any>>);
      
      // Convert to array and sort by month order
      return Object.values(monthlyData).sort((a, b) => {
        const indexA = months.indexOf(a.name);
        const indexB = months.indexOf(b.name);
        return indexA - indexB;
      });
    } else {
      // Group by day for monthly view
      const dailyData = businessIds.reduce((acc, businessId) => {
        const businessExpenses = expensesData.filter(expense => expense.business_id === businessId);
        
        // Create entries for all days in the range
        const days = eachDayOfInterval({ start: dateRange.from, end: dateRange.to });
        days.forEach(day => {
          const dayKey = format(day, 'dd');
          
          if (!acc[dayKey]) {
            acc[dayKey] = { name: dayKey };
            businessIds.forEach(id => {
              const businessKey = id === 'cijati' ? 'Cijati' : id === 'shaquilla' ? 'Shaquilla' : 'Kartini';
              acc[dayKey][businessKey] = 0;
            });
          }
        });
        
        // Add expense data to the corresponding days
        businessExpenses.forEach(expense => {
          const dayKey = format(new Date(expense.date), 'dd');
          const businessKey = businessId === 'cijati' ? 'Cijati' : businessId === 'shaquilla' ? 'Shaquilla' : 'Kartini';
          
          if (acc[dayKey]) {
            acc[dayKey][businessKey] += Number(expense.amount);
          }
        });
        
        return acc;
      }, {} as Record<string, Record<string, any>>);
      
      // Sort by day of month
      return Object.values(dailyData).sort((a, b) => {
        return parseInt(a.name) - parseInt(b.name);
      });
    }
  }, [expensesData, businessIds, viewType, dateRange]);

  return {
    incomeChartData,
    expenseChartData,
    isLoading: isLoading || isLoadingExpenses,
    error
  };
};
