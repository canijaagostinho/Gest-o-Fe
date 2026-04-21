import { createBrowserClient } from "@supabase/ssr";
import { SupabaseClient } from "@supabase/supabase-js";

let client: SupabaseClient;

export function createClient() {
  // If we're on the server, we should always return a new client
  if (typeof window === "undefined") {
    return createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookieOptions: {
          maxAge: undefined as any,
          expires: undefined as any,
        },
      }
    );
  }

  if (client) return client;

  client = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          if (typeof document === "undefined") return [];
          const parsed = document.cookie.split("; ").reduce((acc, current) => {
            const [key, ...vals] = current.split("=");
            if (!key) return acc;
            acc[key] = vals.join("=");
            return acc;
          }, {} as Record<string, string>);
          
          return Object.keys(parsed).map((name) => ({
            name,
            value: decodeURIComponent(parsed[name] ?? ""),
          }));
        },
        setAll(setCookies) {
          if (typeof document === "undefined") return;
          setCookies.forEach(({ name, value, options }) => {
            if (!value) {
              // Deletar cookie (logout)
              document.cookie = `${encodeURIComponent(name)}=; Path=${options.path || '/'}; Max-Age=0`;
              return;
            }
            
            // Cookie de sessão: Não usamos options.maxAge!
            let cookieStr = `${encodeURIComponent(name)}=${encodeURIComponent(value)}`;
            if (options.path) cookieStr += `; Path=${options.path}`;
            if (options.domain) cookieStr += `; Domain=${options.domain}`;
            if (options.sameSite) cookieStr += `; SameSite=${options.sameSite}`;
            if (options.secure) cookieStr += `; Secure`;
            
            document.cookie = cookieStr;
          });
        },
      },
    }
  );

  return client;
}
