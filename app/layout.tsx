import type { Metadata, Viewport } from "next";
import React from "react";
import { Inter } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import ClientLayout from "@/components/ClientLayout";

const inter = Inter({ subsets: ["latin"] });

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  title: "RemindAI - Your AI-Powered Personal Reminder Assistant",
  description: "Schedule reminders naturally via WhatsApp, Telegram, and Instagram using voice or text. Never forget a task again with RemindAI's intelligent scheduling.",
  keywords: ["AI reminder", "WhatsApp bot", "Telegram bot", "voice reminders", "productivity tool", "task management"],
  authors: [{ name: "RemindAI Team" }],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ClientLayout>
          {children}
        </ClientLayout>
        <Script
          id="razorpay-checkout-js"
          src="https://checkout.razorpay.com/v1/checkout.js"
          strategy="lazyOnload"
        />
      </body>
    </html>
  );
}
