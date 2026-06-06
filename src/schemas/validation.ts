/**
 * Centralized Zod Schema Validation - Camada 4 (OWASP A03: Injection & A04: Insecure Design)
 * All data entering server actions must be validated against these strict schemas.
 * Unknown / extra fields are stripped by default via .strict() or .strip() to prevent
 * mass-assignment injection attacks.
 */
import { z } from "zod";

// --- Shared Primitives ---
const uuidSchema = z.string().uuid({ message: "ID inválido." });
const currencySchema = z
  .number({ message: "Deve ser um número." })
  .positive({ message: "O valor deve ser positivo." })
  .multipleOf(0.01, { message: "Máximo de 2 casas decimais." });

const safeStringSchema = (min = 1, max = 255) =>
  z
    .string()
    .min(min, { message: `Mínimo de ${min} caractere(s).` })
    .max(max, { message: `Máximo de ${max} caracteres.` })
    .regex(/^[^<>"'`;(){}\\]*$/, {
      message: "Caracteres especiais inválidos detectados.",
    });

// --- OWASP A07: Identification & Authentication ---
export const passwordSchema = z
  .string()
  .min(8, { message: "A senha deve ter pelo menos 8 caracteres." })
  .regex(/[A-Z]/, { message: "A senha deve ter pelo menos uma letra maiúscula." })
  .regex(/[a-z]/, { message: "A senha deve ter pelo menos uma letra minúscula." })
  .regex(/[!@#$%^&*(),.?":{}|<>]/, {
    message: "A senha deve ter pelo menos um caractere especial.",
  });

export const userCreateSchema = z.object({
  full_name: safeStringSchema(2, 100),
  email: z.string().email({ message: "Email inválido." }).max(150),
  password: passwordSchema,
  role_id: uuidSchema,
  institution_id: uuidSchema,
});

export const userUpdateSchema = z.object({
  id: uuidSchema,
  full_name: safeStringSchema(2, 100),
  email: z.string().email({ message: "Email inválido." }).max(150),
  password: passwordSchema.optional().or(z.literal("")),
  role_id: uuidSchema,
});

// --- OWASP A03: Injection - Client Data ---
export const clientUpdateSchema = z.object({
  full_name: safeStringSchema(2, 100),
  email: z
    .string()
    .email({ message: "Email inválido." })
    .max(150)
    .optional()
    .or(z.literal("")),
  phone: z
    .string()
    .max(30)
    .regex(/^[+\d\s\-().]*$/, { message: "Número de telefone inválido." })
    .optional(),
  id_number: safeStringSchema(3, 30),
  address: z.string().max(300).optional().or(z.literal("")),
  code: z.string().max(50).optional().or(z.literal("")),
});

// --- OWASP A01 & A03: Loan Integrity ---
export const loanCreateSchema = z
  .object({
    client_id: uuidSchema,
    institution_id: uuidSchema,
    account_id: uuidSchema,
    user_id: uuidSchema,
    loan_amount: currencySchema.max(9_999_999, "Valor máximo excedido."),
    interest_rate: z
      .number()
      .min(0)
      .max(100, { message: "Taxa de juro não pode exceder 100%." }),
    number_of_installments: z
      .number()
      .int()
      .min(1, "Mínimo 1 parcela.")
      .max(360, "Máximo 360 parcelas."),
    contract_number: z.string().max(50).optional(),
    installments: z.array(
      z.object({
        amount: currencySchema,
        due_date: z.string().optional(),
        dueDate: z.string().optional(),
        number: z.number().int().positive().optional(),
        installment_number: z.number().int().positive().optional(),
      })
    ).min(1, "Deve ter ao menos 1 parcela."),
  })
  .passthrough(); // Allow extra typed fields from LoanCreateData

// --- OWASP A03: Payment Validation ---
export const paymentCreateSchema = z.object({
  loan_id: uuidSchema,
  client_id: uuidSchema,
  amount: currencySchema,
  payment_date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, { message: "Data inválida. Formato: YYYY-MM-DD." }),
  account_id: uuidSchema,
  user_id: uuidSchema,
  institution_id: uuidSchema,
  installment_id: uuidSchema.optional(),
  payment_method: z
    .string()
    .max(50)
    .optional()
    .default("Dinheiro"),
  notes: z.string().max(500).optional(),
});
