
import { useState, useMemo } from "react";
import { format, isWithinInterval, startOfMonth, endOfMonth } from "date-fns";
import { Income, Expense } from "@/types/supabase";
import { useIncomeData } from "@/hooks/income/useIncomeData";
import { useExpenseData } from "@/hooks/expense/useExpenseData";

export const useCashData = (businessId: string | undefined, selectedMonth: Date) => {
  // Get month range for filtering
  const monthStart = startOfMonth(selectedMonth);
  const monthEnd = endOfMonth(selectedMonth);

  // Fetch income and expense data
  const { incomes, isLoading: isLoadingIncomes, error: incomeError } = useIncomeData(businessId);
  const { expenses, isLoading: isLoadingExpenses, error: expenseError } = useExpenseData(businessId);

  // Filter transactions for the selected month
  const filteredIncomes = useMemo(() => {
    return incomes.filter(
      (income) => isWithinInterval(income.date, { start: monthStart, end: monthEnd })
    );
  }, [incomes, monthStart, monthEnd]);

  const filteredExpenses = useMemo(() => {
    return expenses.filter(
      (expense) => isWithinInterval(expense.date, { start: monthStart, end: monthEnd })
    );
  }, [expenses, monthStart, monthEnd]);

  // Calculate totals
  const totalIncome = useMemo(() => {
    return filteredIncomes.reduce((sum, income) => sum + income.amount, 0);
  }, [filteredIncomes]);

  const totalExpense = useMemo(() => {
    return filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0);
  }, [filteredExpenses]);

  const balance = totalIncome - totalExpense;

  // Group incomes by type
  const incomeByType = useMemo(() => {
    return filteredIncomes.reduce((acc, income) => {
      if (!acc[income.type]) {
        acc[income.type] = 0;
      }
      acc[income.type] += income.amount;
      return acc;
    }, {} as Record<string, number>);
  }, [filteredIncomes]);

  // Group expenses by type
  const expenseByType = useMemo(() => {
    return filteredExpenses.reduce((acc, expense) => {
      if (!acc[expense.type]) {
        acc[expense.type] = 0;
      }
      acc[expense.type] += expense.amount;
      return acc;
    }, {} as Record<string, number>);
  }, [filteredExpenses]);

  // Recent transactions (combined and sorted)
  const recentTransactions = useMemo(() => {
    const incomes = filteredIncomes.map(income => ({
      ...income,
      transactionType: 'income' as const
    }));
    
    const expenses = filteredExpenses.map(expense => ({
      ...expense,
      transactionType: 'expense' as const
    }));
    
    return [...incomes, ...expenses].sort((a, b) => 
      b.date.getTime() - a.date.getTime()
    ).slice(0, 5);
  }, [filteredIncomes, filteredExpenses]);

  return {
    isLoading: isLoadingIncomes || isLoadingExpenses,
    error: incomeError || expenseError,
    filteredIncomes,
    filteredExpenses,
    totalIncome,
    totalExpense,
    balance,
    incomeByType,
    expenseByType,
    recentTransactions
  };
};
