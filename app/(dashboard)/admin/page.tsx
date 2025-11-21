"use client"
import AdminDashboard from "@/features/admin/admin-dashboard";
import { useAuth } from "@/contexts/auth-context";
import { useHeader } from "@/contexts/header-context";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";

export default function AdminPage() {
  const { user, loading } = useAuth();
  const { setHeaderCustomContent } = useHeader();

  // Set the page title in the header
  useEffect(() => {
    setHeaderCustomContent(<div className="text-lg font-medium ">Admin</div>);
    
    // return () => {
    //   setHeaderCustomContent(null);
    // };
  }, [setHeaderCustomContent]);

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user?.is_superuser && !user?.is_staff) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
          <p className="text-muted-foreground">You must be a superuser or staff member to access the Admin page.</p>
        </div>
      </div>
    );
  }

  return <AdminDashboard />
}
