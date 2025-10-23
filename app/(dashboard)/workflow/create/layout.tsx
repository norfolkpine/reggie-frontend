"use client";

export default function WorkflowCreateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="fixed inset-0 bg-background z-50">
      {children}
    </div>
  );
}
