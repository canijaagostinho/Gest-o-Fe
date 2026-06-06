import * as z from "zod";

export function isValidName(name: string): boolean {
  const cleanName = name.trim();
  if (cleanName.length < 2) return false;

  // If the whole name is a short uppercase abbreviation (like BM, BCI, KPMG, PWC, ABS), it's valid
  const isShortAbbreviation = /^[A-Z0-9\.\-\&]{2,5}$/.test(cleanName);
  if (isShortAbbreviation) return true;

  // A name should contain at least one vowel (a, e, i, o, u, y, with or without accents)
  const hasVowel = /[aeiouyáéíóúâêîôûãõàèìòùäëïöü]/i.test(name);
  if (!hasVowel) return false;

  // It shouldn't contain 4 or more consecutive consonants (excluding spaces/hyphens/numbers)
  const consecutiveConsonants = /[^aeiouyáéíóúâêîôûãõàèìòùäëïöü\s\d\W]{4,}/i.test(name);
  if (consecutiveConsonants) return false;

  // It shouldn't contain too many uppercase letters mixed in a single word (random casing)
  const words = name.split(/\s+/);
  for (const word of words) {
    const cleanWord = word.replace(/[^a-zA-Z]/g, "");
    if (cleanWord.length > 3) {
      const isAllCaps = cleanWord === cleanWord.toUpperCase();
      if (!isAllCaps) {
        // Count uppercase letters after the first character
        const uppercaseCount = (cleanWord.slice(1).match(/[A-Z]/g) || []).length;
        if (uppercaseCount >= 2) {
          return false;
        }
      }
    }
  }

  // It shouldn't contain random repetitions of characters (e.g. "aaaa", "zzzz")
  const hasThreeOrMoreIdenticalConsecutive = /(.)\1\1/.test(name);
  if (hasThreeOrMoreIdenticalConsecutive) return false;

  return true;
}

export const institutionSchema = z.object({
  name: z.string().min(2, {
    message: "O nome deve ter pelo menos 2 caracteres.",
  }).refine((val) => isValidName(val), {
    message: "Nome de instituição inválido (evite sequências desordenadas de caracteres).",
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
