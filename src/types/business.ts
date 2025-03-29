
export type Business = {
  id: string;
  name: string;
  image: string;
};

export type IncomeType = 'Omset Usaha' | 'Konsinyasi Usaha' | 'Lainnya';
export type ExpenseType = 'Bagi Hasil' | 'Belanja Bahan' | 'Iuran' | 'Maintenance' | 'Marketing' | 'Upah Pegawai' | 'Lainnya';

export type Income = {
  id: string;
  businessId: string;
  date: Date;
  type: IncomeType;
  description: string;
  amount: number;
};

export type Expense = {
  id: string;
  businessId: string;
  date: Date;
  type: ExpenseType;
  description: string;
  amount: number;
};
