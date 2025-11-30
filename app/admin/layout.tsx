"use client";

import { useSidebar } from "@/context/SidebarContext";
import AppHeader from "@/layout/AppHeader";
import AppSidebar from "@/layout/AppSidebar";
import Backdrop from "@/layout/Backdrop";
import React from "react";




export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { isExpanded, isHovered, isMobileOpen } = useSidebar();

  // Dynamic class for main content margin based on sidebar state
  let mainContentMargin = "lg:ml-[90px]";
  if (isMobileOpen) {
    mainContentMargin = "ml-0";
  } else if (isExpanded || isHovered) {
    mainContentMargin = "lg:ml-[290px]";
  }

  return (
    <div className="min-h-screen xl:flex bg-white dark:bg-gray-900">
      {/* Sidebar and Backdrop */}
      <AppSidebar />
      <Backdrop />
      {/* Main Content Area */}
      <div
        className={`flex-1 transition-all  duration-300 ease-in-out ${mainContentMargin}`}
      >
        {/* Header */}
        <AppHeader />
        {/* Page Content */}
        <div className="p-4 mx-auto max-w-(--breakpoint-2xl) md:p-6 bg-white dark:bg-gray-900">{children}</div>
      </div>
    </div>
  );
}
