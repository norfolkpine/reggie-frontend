"use client";
import type React from "react";
import Sidebar from "@/components/sidebar";
import { useState } from "react";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [activeView, setActiveView] = useState("chat");

  const handleViewChange = (view: string) => {
    setActiveView(view);
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="h-screen overflow-auto flex-1 pt-2 pr-2 pb-2">
        <div className="bg-white rounded-xl border shadow-sm h-full overflow-auto">
          {children}
        </div>
      </div>
    </div>
  );
}
