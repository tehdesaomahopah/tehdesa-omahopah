
import { useState, useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { format, isWithinInterval, eachDayOfInterval, startOfMonth, endOfMonth } from "date-fns";
import { useIncomeData } from "@/hooks/income/useIncomeData";

export const useIncomeComparison = (businessIds: string[], fromDate: Date, toDate: Date) => {
  const allBusinessesData = businessIds.map(businessId => {
    const { incomes, isLoading, error } = useIncomeData(businessId);
    return { businessId, incomes, isLoading, error };
  });

  const isLoading = allBusinessesData.some(data => data.isLoading);
  const error = allBusinessesData.find(data => data.error)?.error;

  // Process data for the chart
  const chartData = useMemo(() => {
    if (isLoading || error) return [];

    // Filter incomes by date range for each business
    const filteredIncomesByBusiness = businessIds.reduce((acc, businessId) => {
      const businessData = allBusinessesData.find(data => data.businessId === businessId);
      if (businessData) {
        acc[businessId] = businessData.incomes.filter(income => 
          isWithinInterval(income.date, { start: fromDate, end: toDate })
        );
      }
      return acc;
    }, {} as Record<string, any[]>);

    // Group by day or month depending on the date range
    const diffDays = Math.ceil((toDate.getTime() - fromDate.getTime()) / (1000 * 60 * 60 * 24));
    const useMonthlyGrouping = diffDays > 31;

    if (useMonthlyGrouping) {
      // Group by month
      const months: Record<string, Record<string, number>> = {};
      
      for (const businessId of businessIds) {
        const businessIncomes = filteredIncomesByBusiness[businessId] || [];
        
        for (const income of businessIncomes) {
          const monthKey = format(income.date, 'MMM yyyy');
          
          if (!months[monthKey]) {
            months[monthKey] = businessIds.reduce((acc, id) => {
              acc[id === 'cijati' ? 'Cijati' : id === 'shaquilla' ? 'Shaquilla' : 'Kartini'] = 0;
              return acc;
            }, { name: monthKey } as Record<string, any>);
          }
          
          const businessKey = businessId === 'cijati' ? 'Cijati' : businessId === 'shaquilla' ? 'Shaquilla' : 'Kartini';
          months[monthKey][businessKey] += income.amount;
        }
      }
      
      return Object.values(months).sort((a, b) => {
        const dateA = new Date(a.name);
        const dateB = new Date(b.name);
        return dateA.getTime() - dateB.getTime();
      });
    } else {
      // Group by day
      const days: Record<string, Record<string, number>> = {};
      
      const dateRange = eachDayOfInterval({ start: fromDate, end: toDate });
      
      // Initialize all days with zero values
      for (const day of dateRange) {
        const dayKey = format(day, 'dd MMM');
        days[dayKey] = businessIds.reduce((acc, id) => {
          acc[id === 'cijati' ? 'Cijati' : id === 'shaquilla' ? 'Shaquilla' : 'Kartini'] = 0;
          return acc;
        }, { name: dayKey } as Record<string, any>);
      }
      
      // Fill in actual income values
      for (const businessId of businessIds) {
        const businessIncomes = filteredIncomesByBusiness[businessId] || [];
        
        for (const income of businessIncomes) {
          const dayKey = format(income.date, 'dd MMM');
          const businessKey = businessId === 'cijati' ? 'Cijati' : businessId === 'shaquilla' ? 'Shaquilla' : 'Kartini';
          days[dayKey][businessKey] += income.amount;
        }
      }
      
      return Object.values(days);
    }
  }, [businessIds, allBusinessesData, fromDate, toDate, isLoading, error]);

  return {
    chartData,
    isLoading,
    error
  };
};
