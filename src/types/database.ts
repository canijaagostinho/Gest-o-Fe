export interface Agent {
  id: string;
  institution_id: string;
  full_name: string;
  email?: string | null;
  phone?: string | null;
  status: "active" | "inactive";
  commission_rate: number;
  created_at: string;
  updated_at: string;
}

export interface Expense {
  id: string;
  institution_id: string;
  category: string;
  amount: number;
  date: string;
  description?: string | null;
  user_id?: string | null;
  created_at: string;
  updated_at: string;
}

export interface Commission {
  id: string;
  institution_id: string;
  agent_id: string;
  loan_id?: string | null;
  amount: number;
  status: "pending" | "paid";
  created_at: string;
  updated_at: string;
}

export interface LoanCollateral {
  id: string;
  loan_id: string;
  type: string;
  description: string;
  value: number;
  image_url?: string | null;
  location?: string | null;
  documents?: { name: string; url: string }[] | null;
  created_at: string;
  updated_at: string;
}

export interface Institution {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  address?: string | null;
  nuit?: string | null;
  logo_url?: string | null;
  website?: string | null;
  primary_color?: string | null;
  number_of_employees?: number;
  created_at: string;
  updated_at: string;
}

export interface User {
  id: string;
  email: string;
  full_name?: string | null;
  role_id: string;
  institution_id?: string | null;
  avatar_url?: string | null;
  phone?: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Client {
  id: string;
  institution_id: string;
  full_name: string;
  email?: string | null;
  phone?: string | null;
  nuit?: string | null;
  address?: string | null;
  occupation?: string | null;
  marital_status?: string | null;
  monthly_income?: number | null;
  spouse_name?: string | null;
  spouse_nuit?: string | null;
  status: "active" | "inactive";
  created_at: string;
  updated_at: string;
}

export interface Loan {
  id: string;
  institution_id: string;
  client_id: string;
  amount: number;
  interest_rate: number;
  term: number;
  frequency: string;
  interest_type: string;
  status: "pending" | "approved" | "active" | "paid" | "defaulted";
  disbursement_date?: string | null;
  maturity_date?: string | null;
  created_at: string;
  updated_at: string;
}

export interface Payment {
  id: string;
  institution_id: string;
  loan_id: string;
  amount: number;
  payment_date: string;
  status: "pending" | "paid" | "reversed";
  created_at: string;
  updated_at: string;
}

export interface Account {
  id: string;
  institution_id: string;
  name: string;
  balance: number;
  bank_provider?: string | null;
  is_default: boolean;
  created_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: "info" | "warning" | "error" | "success";
  is_read: boolean;
  action_url?: string | null;
  created_at: string;
}

export interface AuditLog {
  id: string;
  user_id: string;
  action: string;
  entity_type: string;
  entity_id: string;
  changes?: Record<string, unknown> | null;
  created_at: string;
}
