
import { ThemeProvider } from "@/context/ThemeContext";
import React from "react";
import NavBar from "@/layout/NavBar";
import Footer from "@/layout/Footer";

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="relative flex flex-col min-h-screen bg-white z-1 dark:bg-gray-900">
      <ThemeProvider>
        <NavBar />
        <div className="flex-1 pt-16 md:pt-20 p-2 sm:p-0">
          {children}
        </div>
        <Footer />
      </ThemeProvider>
    </div>
  );
}
