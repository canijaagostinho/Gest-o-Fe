import { Agent, Client, Loan, Payment, Account, User, LoanCollateral } from "./database";

export * from "./database";

export type RoleName = "admin_geral" | "gestor" | "admin" | "operador" | "user";

export interface UserProfile extends User {
    role: { name: RoleName } | { name: RoleName }[];
    institutions?: {
        subscriptions: { status: string } | { status: string }[];
    };
}

export interface ActionResponse<T = unknown> {
    success: boolean;
    data?: T;
    error?: string;
    message?: string;
}

export interface LoanCreateData {
    client_id: string;
    loan_amount: number;
    interest_rate: number;
    term: number;
    payment_frequency: string;
    interest_type: string;
    processing_fee: number;
    start_date: string;
    purpose: string;
    contract_number: string;
    account_id: string;
    user_id: string;
    institution_id: string;
    total_to_pay: number;
    installment_amount: number;
    installments: any[];
    collateral?: Partial<LoanCollateral>;
    agent_id?: string;
    late_fee_rate?: number;
    mora_rate?: number;
}

export interface AuditLog {
    id: string;
    entity_type: string;
    entity_id: string;
    action: string;
    changes: Record<string, unknown>;
    created_at: string;
    user: {
        full_name: string | null;
        email: string | null;
    } | null;
}

export interface UserCreateData {
    email: string;
    password?: string;
    full_name: string;
    institution_id: string;
    role_id: string;
}

export interface UserUpdateData extends Partial<UserCreateData> {
    id: string;
}

export interface AccountCreateData {
    name: string;
    balance: number;
    bank_provider?: string;
    is_default?: boolean;
}

export interface AccountUpdateData {
    name: string;
    bank_provider?: string;
    is_default?: boolean;
}
