// src/lib/error-handler.ts
export class AppError extends Error {
  constructor(
    public code: string,
    public message: string,
    public statusCode: number = 400,
    public details?: Record<string, unknown>,
  ) {
    super(message);
  }
}

export const translateSupabaseError = (error: any): string => {
  if (!error) return "Ocorreu um erro inesperado.";
  
  const message = typeof error === 'string' ? error : error.message || "";
  const code = typeof error === 'object' ? error.code : "";

  // Common Supabase Auth / PostgREST Errors
  if (message.includes("already registered") || message.includes("exists") || code === "23505") {
    return "Este endereço de e-mail já está em uso por outro utilizador. Por favor, utilize um e-mail diferente ou verifique se o utilizador já possui uma conta.";
  }
  
  if (message.includes("invalid login credentials") || message.includes("Invalid login credentials") || message.includes("Invalid credentials")) {
    return "Não foi possível entrar. O e-mail ou a senha fornecidos estão incorretos. Por favor, tente novamente.";
  }

  if (message.includes("Email not confirmed")) {
    return "O seu endereço de e-mail precisa de confirmação. Por favor, abra o link enviado para a sua caixa de entrada.";
  }

  if (message.includes("Password should be at least 6 characters")) {
    return "Aumente a segurança da sua senha: ela deve conter, no mínimo, 6 caracteres.";
  }

  if (message.includes("rate limit exceeded")) {
    return "Muitas tentativas em pouco tempo. Por segurança, aguarde alguns minutos antes de tentar novamente.";
  }

  if (message.includes("User not found")) {
    return "Utilizador não localizado. Verifique se o e-mail foi digitado corretamente.";
  }

  if (message.includes("JWT expired") || message.includes("session expired")) {
    return "A sua sessão de segurança expirou. Por favor, faça login novamente para continuar.";
  }

  if (message.includes("database error") || code?.startsWith("23") || code?.startsWith("P")) {
    return "Houve um problema ao guardar os dados no servidor. Por favor, verifique os campos e tente novamente.";
  }

  // Fallback to original message if no translation found, but ensured it's a string
  return message || "Ocorreu uma falha inesperada na operação. Tente novamente.";
};

export const handleError = (error: unknown) => {
  if (error instanceof AppError) {
    return {
      code: error.code,
      message: error.message,
      statusCode: error.statusCode,
      details: error.details,
    };
  }

  if (error instanceof Error) {
    return {
      code: "UNKNOWN_ERROR",
      message: translateSupabaseError(error),
      statusCode: 500,
    };
  }

  return {
    code: "UNKNOWN_ERROR",
    message: "Algo deu errado",
    statusCode: 500,
  };
};

import { toast } from "sonner";

export const toastError = (error: unknown) => {
  const { code, message } = handleError(error);
  console.error(`[${code}]`, message);
  toast.error(message);
};
