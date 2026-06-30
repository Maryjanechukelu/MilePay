import type { Metadata, Viewport } from "next";
import { Syne, Inter } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";
import { Providers } from "./providers";

const syne = Syne({
  subsets: ["latin"],
  variable: "--font-syne",
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "MilePay - Get paid as you deliver",
    template: "%s | MilePay",
  },
  description:
    "MilePay holds your project funds securely and releases payment automatically as each milestone is approved. Built for Nigerian freelancers, tutors, designers, consultants and their clients.",
  keywords: [
    "freelance payment Nigeria",
    "milestone payment",
    "escrow Nigeria",
    "protect freelance work",
    "Nomba payment",
    "Nigerian freelancer",
  ],
  authors: [{ name: "Codechic Enterprise" }],
  creator: "Codechic Enterprise",
  openGraph: {
    type: "website",
    locale: "en_NG",
    url: "https://milepay.ng",
    siteName: "MilePay",
    title: "MilePay - Get paid as you deliver",
    description:
      "Milestone-based payment protection for Nigerian service providers and their clients.",
    images: [
      {
        url: "https://milepay.ng/og-image.png",
        width: 1200,
        height: 630,
        alt: "MilePay - Milestone Payment Platform",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "MilePay - Get paid as you deliver",
    description:
      "Milestone-based payment protection for Nigerian service providers.",
    images: ["https://milepay.ng/og-image.png"],
    creator: "@codechic",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  themeColor: "#0A2E1A",
  colorScheme: "light",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Providers>
      <html lang="en" className={`${syne.variable} ${inter.variable}`}>
        <body className="font-sans bg-cream text-slate-800 antialiased">
          {children}
          <Toaster
            position="top-right"
            toastOptions={{
              classNames: {
                toast:
                  "font-sans text-sm shadow-lg border border-slate-100 rounded-xl",
                title: "font-semibold",
                success: "border-forest-200 bg-forest-50 text-forest-900",
                error: "border-red-200 bg-red-50 text-red-900",
                warning: "border-amber-200 bg-amber-50 text-amber-900",
              },
            }}
          />
        </body>
      </html>
    </Providers>
  );
}
