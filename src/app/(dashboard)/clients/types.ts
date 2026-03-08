export type Client = {
  id: string;
  code?: string | null;
  full_name: string;
  email: string | null;
  phone: string | null;
  id_number: string | null;
  status: string;
  classification: string;
  created_at: string;
  repayment_progress?: number;
};
