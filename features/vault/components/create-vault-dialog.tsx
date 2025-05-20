"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { HelpCircle } from "lucide-react"
import { set } from "date-fns"

interface CreateVaultDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreateVault: (name: string, description: string) => void
}

export function CreateVaultDialog({ open, onOpenChange, onCreateVault }: CreateVaultDialogProps) {
  const [vaultName, setVaultName] = useState("")
  const [vaultDesc, setVaultDesc] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (vaultName.trim()) {
      onCreateVault(vaultName, vaultDesc)
      setVaultName("")
      setVaultDesc("")
      onOpenChange(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Vault name</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <Input
              placeholder="E.g. Birthday Party Planning"
              value={vaultName}
              onChange={(e) => setVaultName(e.target.value)}
              autoFocus
            />
             <Input
              placeholder="Add a description for your vault"
              value={vaultDesc}
              onChange={(e) => setVaultDesc(e.target.value)}
            />
            <div className="flex items-start gap-2 text-sm text-muted-foreground">
              <HelpCircle className="h-5 w-5 shrink-0" />
              <div>
                <div className="font-medium text-foreground">What&apos;s a vault?</div>
                <div>
                  Vaults keep chats, files, and custom instructions in one place. Use them for ongoing work, or just
                  to keep things tidy.
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={!vaultName.trim()}>
              Create vault
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
