import type { Metadata } from "next";
import { Inter, Plus_Jakarta_Sans, Sora } from "next/font/google"; // Import Sora
import type { Viewport } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const jakarta = Plus_Jakarta_Sans({ subsets: ["latin"], variable: "--font-jakarta" });
const sora = Sora({ subsets: ["latin"], variable: "--font-sora" }); // Configure Sora

export const metadata: Metadata = {
  metadataBase: new URL("https://gestaoflex.com"),
  title: {
    default: "Gestão Flex | Garanta que seu Capital Volte com Lucro",
    template: "%s | Gestão Flex"
  },
  description: "A plataforma definitiva para agentes e credores em Moçambique. Automatize suas cobranças no WhatsApp e tenha controle total do seu capital.",
  keywords: ["microcrédito", "gestão financeira", "empréstimos", "SaaS", "Gestão Flex"],
  authors: [{ name: "Gestão Flex" }],
  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: "https://gestaoflex.com",
    title: "Gestão Flex | Sistema de Microcrédito Profissional",
    description: "A plataforma mais completa para gestão de microcrédito.",
    siteName: "Gestão Flex",
    images: [
      {
        url: "/logo.png",
        width: 800,
        height: 600,
        alt: "Gestão Flex Logo",
      },
    ],
  },
  icons: {
    icon: "/logo.png",
    shortcut: "/logo.png",
    apple: "/logo.png",
  },
  verification: {
    google: "PLACEHOLDER_FOR_GOOGLE_VERIFICATION_CODE",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
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
