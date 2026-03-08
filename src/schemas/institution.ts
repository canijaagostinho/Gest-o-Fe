import * as z from "zod";

export const institutionSchema = z.object({
  name: z.string().min(2, {
    message: "O nome deve ter pelo menos 2 caracteres.",
  }),
  email: z.string().email({
    message: "Email inválido.",
  }),
  phone: z.string().optional(),
  address: z.string().optional(),
  nuit: z.string().optional(),
  logo_url: z
    .string()
    .url({ message: "URL inválida" })
    .optional()
    .or(z.literal("")),
  website: z
    .string()
    .url({ message: "URL inválida" })
    .optional()
    .or(z.literal("")),
  primary_color: z.string().optional(),
  number_of_employees: z.coerce
    .number()
    .min(0, "Deve ser um número positivo")
    .default(0),
});

export type InstitutionFormValues = z.infer<typeof institutionSchema>;
