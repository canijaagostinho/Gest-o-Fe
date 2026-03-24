import type { Metadata } from "next";
import { Inter, Plus_Jakarta_Sans, Sora } from "next/font/google"; // Import Sora
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const jakarta = Plus_Jakarta_Sans({ subsets: ["latin"], variable: "--font-jakarta" });
const sora = Sora({ subsets: ["latin"], variable: "--font-sora" }); // Configure Sora

export const metadata: Metadata = {
  metadataBase: new URL("https://gestaoflex.com"),
  title: {
    default: "Gestão Flex | Sistema de Microcrédito Profissional",
    template: "%s | Gestão Flex"
  },
  description: "A plataforma mais completa para gestão de microcrédito. Automatize seus processos e cresça com segurança.",
  keywords: ["microcrédito", "gestão financeira", "empréstimos", "SaaS", "Gestão Flex"],
  authors: [{ name: "Gestão Flex" }],
  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: "https://gestaoflex.com",
    title: "Gestão Flex | Sistema de Microcrédito Profissional",
    description: "A plataforma mais completa para gestão de microcrédito.",
    siteName: "Gestão Flex",
  },
  verification: {
    google: "PLACEHOLDER_FOR_GOOGLE_VERIFICATION_CODE",
  },
};

import { ThemeProvider } from "@/components/theme-provider";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${jakarta.variable} ${sora.variable} font-jakarta antialiased bg-neutral-50 dark:bg-neutral-900`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
          disableTransitionOnChange
        >
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
