"use client";

/**
 * useSecureForm Hook - Camada 5 (Proteção Frontend)
 * Provides client-side form validation aligned with server-side Zod schemas.
 * Enforces: required fields, email format, password strength, max length.
 *
 * Principle: Client validation is for UX only. Server MUST always re-validate.
 * This hook never replaces, only complements, server-side validation.
 */
import { useState, useCallback } from "react";

export type FieldRules = {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  email?: boolean;
  /** Enforce strong password: uppercase + lowercase + special char */
  strongPassword?: boolean;
  /** Custom regex pattern */
  pattern?: { regex: RegExp; message: string };
};

export type FormErrors<T> = Partial<Record<keyof T, string>>;

const PASSWORD_REGEX =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*(),.?":{}|<>]).{8,}$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// Blocks HTML tag attempts in text fields (DOM XSS prevention)
const XSS_REGEX = /<[^>]*>/;

function validateField(
  value: string,
  rules: FieldRules,
  fieldName: string,
): string | undefined {
  if (rules.required && !value?.trim()) {
    return `${fieldName} é obrigatório.`;
  }
  if (value && XSS_REGEX.test(value)) {
    return `${fieldName} contém caracteres inválidos (HTML não permitido).`;
  }
  if (rules.email && value && !EMAIL_REGEX.test(value)) {
    return "Email inválido.";
  }
  if (rules.strongPassword && value && !PASSWORD_REGEX.test(value)) {
    return "A senha deve ter mínimo 8 caracteres, letras maiúsculas, minúsculas e um caractere especial.";
  }
  if (rules.minLength && value && value.length < rules.minLength) {
    return `Mínimo de ${rules.minLength} caracteres.`;
  }
  if (rules.maxLength && value && value.length > rules.maxLength) {
    return `Máximo de ${rules.maxLength} caracteres.`;
  }
  if (rules.pattern && value && !rules.pattern.regex.test(value)) {
    return rules.pattern.message;
  }
  return undefined;
}

export function useSecureForm<T extends Record<string, string>>(
  rules: Partial<Record<keyof T, FieldRules>>,
  fieldLabels?: Partial<Record<keyof T, string>>,
) {
  const [errors, setErrors] = useState<FormErrors<T>>({});
  const [touched, setTouched] = useState<Partial<Record<keyof T, boolean>>>({});

  /** Validate a single field on blur */
  const validateOne = useCallback(
    (name: keyof T, value: string) => {
      const fieldRule = rules[name];
      if (!fieldRule) return;
      const label = (fieldLabels?.[name] as string) ?? String(name);
      const error = validateField(value, fieldRule, label);
      setErrors((prev) => ({ ...prev, [name]: error }));
    },
    [rules, fieldLabels],
  );

  /** Mark field as touched */
  const onBlur = useCallback(
    (name: keyof T, value: string) => {
      setTouched((prev) => ({ ...prev, [name]: true }));
      validateOne(name, value);
    },
    [validateOne],
  );

  /** Validate all fields, return true if valid */
  const validateAll = useCallback(
    (data: T): boolean => {
      const newErrors: FormErrors<T> = {};
      let isValid = true;

      for (const key in rules) {
        const name = key as keyof T;
        const label = (fieldLabels?.[name] as string) ?? String(name);
        const error = validateField(data[name] ?? "", rules[name]!, label);
        if (error) {
          newErrors[name] = error;
          isValid = false;
        }
      }

      setErrors(newErrors);
      // Mark all fields as touched on submit attempt
      const allTouched = Object.keys(rules).reduce(
        (acc, key) => ({ ...acc, [key]: true }),
        {},
      );
      setTouched(allTouched as Partial<Record<keyof T, boolean>>);
      return isValid;
    },
    [rules, fieldLabels],
  );

  const clearErrors = useCallback(() => setErrors({}), []);

  return { errors, touched, onBlur, validateAll, validateOne, clearErrors };
}
