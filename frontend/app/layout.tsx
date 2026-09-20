import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { DemoBanner } from "@/components/layout/demo-banner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { DemoStateProvider } from "@/lib/demo-state";
import { ThemeProvider, themeInitScript } from "@/lib/theme";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans", display: "swap" });
const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono", display: "swap" });

export const metadata: Metadata = {
  title: "BuildLedger — Construction finance, joined up",
  description:
    "Budget vs actual reconciliation, exception detection and plain-English answers across Xero, CostX, EzzyBills and ApprovalMax.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${mono.variable}`} suppressHydrationWarning>
      <head>
        {/* Applies the stored theme before first paint to avoid a flash. */}
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="min-h-screen font-sans antialiased">
        <ThemeProvider>
          <DemoStateProvider>
            <TooltipProvider delayDuration={200}>
              <div className="flex min-h-screen flex-col">
                <DemoBanner />
                {children}
              </div>
            </TooltipProvider>
          </DemoStateProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
