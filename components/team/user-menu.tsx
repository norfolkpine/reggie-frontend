"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { DropdownMenuItem, DropdownMenuGroup, DropdownMenuSeparator, DropdownMenuShortcut } from "@/components/ui/dropdown-menu";
import { useRouter } from "next/navigation";
import { MenuItem } from "@/types/menu";

interface UserMenuProps {
  menuItems: MenuItem[];
  onItemSelect: (key: string) => void;
  onLogout: () => void;
  onPricingClick?: () => void;
}

export function UserMenu({ menuItems, onItemSelect, onLogout, onPricingClick }: UserMenuProps) {
  const router = useRouter();

  const handlePricingClick = (e: Event) => {
    e.preventDefault();
    if (onPricingClick) {
      onPricingClick();
    } else {
      router.push("/pricing");
    }
  };

  return (
    <>
      <DropdownMenuGroup>
        {menuItems.map(({ key, label, shortcut }) => (
          <DropdownMenuItem
            key={key}
            onSelect={(e) => {
              e.preventDefault();
              onItemSelect(key);
            }}
            className="py-2"
          >
            {label}
            <DropdownMenuShortcut>{shortcut}</DropdownMenuShortcut>
          </DropdownMenuItem>
        ))}
      </DropdownMenuGroup>
      <DropdownMenuSeparator />
      <DropdownMenuItem className="py-2" onClick={onLogout}>
        Log out
        <DropdownMenuShortcut>⇧⌘Q</DropdownMenuShortcut>
      </DropdownMenuItem>
      <DropdownMenuSeparator />
      <DropdownMenuItem
        className="cursor-pointer focus:bg-accent focus:text-accent-foreground hover:bg-accent hover:text-accent-foreground p-3"
        onSelect={handlePricingClick}
      >
        <div className="flex flex-col">
          <span className="font-medium">Upgrade to Premium</span>
          <span className="text-xs text-muted-foreground">
            Get more features and benefits
          </span>
        </div>
      </DropdownMenuItem>
    </>
  );
}