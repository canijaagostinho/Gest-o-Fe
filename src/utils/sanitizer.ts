/**
 * Input sanitization utility for API and Form values (Camada 3 - Segurança de API)
 * Safeguards the application against XSS (Cross-Site Scripting) and HTML Injection attacks
 * by stripping HTML tags and escaping dangerous characters.
 */
export function sanitizeInput(val: string): string {
  if (!val || typeof val !== "string") return val;
  
  return val
    .replace(/<[^>]*>/g, "") // Strip HTML tag syntax entirely
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;")
    .trim();
}

/**
 * Sanitizes all string fields within a shallow object recursively.
 */
export function sanitizeObject<T extends Record<string, any>>(obj: T): T {
  const sanitized = { ...obj };
  for (const key in sanitized) {
    if (typeof sanitized[key] === "string") {
      sanitized[key] = sanitizeInput(sanitized[key]) as any;
    }
  }
  return sanitized;
}
