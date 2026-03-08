// src/lib/error-handler.ts
export class AppError extends Error {
  constructor(
    public code: string,
    public message: string,
    public statusCode: number = 400,
    public details?: any,
  ) {
    super(message);
  }
}

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
      message: error.message || "Algo deu errado",
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
