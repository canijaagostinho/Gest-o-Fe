"use client";

/**
 * CSRF Token Hook - Camada 5 (Proteção Frontend)
 * OWASP A01: Broken Access Control / CSRF (Cross-Site Request Forgery)
 *
 * Generates a cryptographically-random CSRF token stored in sessionStorage
 * and bound to the current session. The token must be validated server-side
 * on all state-changing form submissions (POST/PUT/DELETE).
 *
 * Usage:
 *   const { csrfToken, getHeaders } = useCsrfToken();
 *   // Include in fetch calls: fetch('/api/...', { headers: getHeaders() })
 */
import { useState, useEffect, useCallback } from "react";

const CSRF_KEY = "gf_csrf_token";

function generateToken(): string {
  const arr = new Uint8Array(32);
  crypto.getRandomValues(arr);
  return Array.from(arr, (byte) => byte.toString(16).padStart(2, "0")).join("");
}

export function useCsrfToken() {
  const [csrfToken, setCsrfToken] = useState<string>("");

  useEffect(() => {
    // Retrieve or generate a new token for this browser session
    let token = sessionStorage.getItem(CSRF_KEY);
    if (!token) {
      token = generateToken();
      sessionStorage.setItem(CSRF_KEY, token);
    }
    setCsrfToken(token);
  }, []);

  /**
   * Returns the headers object to include in API calls with the CSRF token.
   */
  const getHeaders = useCallback(
    (): Record<string, string> => ({
      "X-CSRF-Token": csrfToken,
    }),
    [csrfToken],
  );

  /**
   * Rotates the CSRF token (call after successful sensitive operations).
   */
  const rotateToken = useCallback(() => {
    const newToken = generateToken();
    sessionStorage.setItem(CSRF_KEY, newToken);
    setCsrfToken(newToken);
  }, []);

  return { csrfToken, getHeaders, rotateToken };
}
