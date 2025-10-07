import * as React from "react"
import { Card } from "@/components/ui/card"

interface DialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  children: React.ReactNode
}

export function Dialog({ open, onOpenChange, children }: DialogProps) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div 
        className="fixed inset-0 bg-black/50" 
        onClick={() => onOpenChange(false)}
      />
      <div className="relative z-50 w-full max-w-lg">
        {children}
      </div>
    </div>
  )
}

interface DialogContentProps {
  children: React.ReactNode
}

export function DialogContent({ children }: DialogContentProps) {
  return (
    <Card className="p-6 bg-background shadow-lg">
      {children}
    </Card>
  )
}

interface DialogHeaderProps {
  children: React.ReactNode
}

export function DialogHeader({ children }: DialogHeaderProps) {
  return <div className="mb-4">{children}</div>
}

interface DialogTitleProps {
  children: React.ReactNode
}

export function DialogTitle({ children }: DialogTitleProps) {
  return <h2 className="text-xl font-semibold">{children}</h2>
}

interface DialogDescriptionProps {
  children: React.ReactNode
}

export function DialogDescription({ children }: DialogDescriptionProps) {
  return <p className="text-sm text-muted-foreground mt-2">{children}</p>
}

interface DialogFooterProps {
  children: React.ReactNode
}

export function DialogFooter({ children }: DialogFooterProps) {
  return <div className="mt-6 flex gap-2 justify-end">{children}</div>
}
