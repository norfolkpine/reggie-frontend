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
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="h-screen overflow-auto flex-1">{children}</div>
    </div>
  );
}
