"use client";

import * as React from "react";
import { DropdownMenuLabel } from "@/components/ui/dropdown-menu";
import { User } from "@/types/api";

interface UserInfoProps {
  user: User | null;
}

export function UserInfo({ user }: UserInfoProps) {
  if (!user) return null;

  return (
    <DropdownMenuLabel className="font-normal p-4">
      <div className="flex flex-col space-y-1">
        <p className="text-sm font-medium leading-none">
          {user.get_display_name}
        </p>
        <p className="text-xs leading-none text-muted-foreground">
          {user.email}
        </p>
      </div>
    </DropdownMenuLabel>
  );
}