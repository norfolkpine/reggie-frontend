"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useAuth } from "@/contexts/auth-context"
import { toast } from "sonner"

interface ProfileDialogProps {
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export function ProfileDialog({ open, onOpenChange }: ProfileDialogProps) {
  const { user, updateUser } = useAuth()
  const [loading, setLoading] = React.useState(false)
  const [formData, setFormData] = React.useState({
    first_name: user?.first_name || "",
    last_name: user?.last_name || "",
  })

  React.useEffect(() => {
    if (user) {
      setFormData({
        first_name: user.first_name || "",
        last_name: user.last_name || "",
      })
    }
  }, [user])

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      await updateUser(formData)
      toast.success("Profile updated successfully")
      onOpenChange?.(false)
    } catch (error) {
      console.error("Failed to update profile:", error)
      toast.error("Failed to update profile. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Profile</DialogTitle>
          <DialogDescription>
            Manage your profile information
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="flex items-center justify-center">
              <Avatar className="h-24 w-24">
                <AvatarImage src={user?.avatar_url} alt={user?.get_display_name || 'User'} />
                <AvatarFallback>{user?.get_display_name?.slice(0, 2).toUpperCase() || 'U'}</AvatarFallback>
              </Avatar>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="first_name">First Name</Label>
              <Input 
                id="first_name" 
                value={formData.first_name}
                onChange={(e) => handleInputChange("first_name", e.target.value)}
                disabled={loading}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="last_name">Last Name</Label>
              <Input 
                id="last_name" 
                value={formData.last_name}
                onChange={(e) => handleInputChange("last_name", e.target.value)}
                disabled={loading}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={user?.email} disabled />
            </div>
            <div className="flex justify-end space-x-2">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => onOpenChange?.(false)}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}