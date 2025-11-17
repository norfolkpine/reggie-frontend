"use client"

import React, { createContext, useCallback, useContext, useState, ReactNode } from "react"
import { BaseModal } from "@/components/ui/base-modal"

interface ModalState {
  open: boolean
  title?: ReactNode
  description?: ReactNode
  children?: ReactNode
  actions?: ReactNode
  className?: string
}

interface ModalContextValue {
  showModal: (props: Omit<ModalState, "open">) => void
  hideModal: () => void
}

const ModalContext = createContext<ModalContextValue | undefined>(undefined)

export function ModalProvider({ children }: { children: ReactNode }) {
  const [modal, setModal] = useState<ModalState>({ open: false })

  const showModal = useCallback((props: Omit<ModalState, "open">) => {
    setModal({ ...props, open: true })
  }, [])

  const hideModal = useCallback(() => {
    setModal((prev) => ({ ...prev, open: false }))
  }, [])

  return (
    <ModalContext.Provider value={{ showModal, hideModal }}>
      {children}
      <BaseModal
        open={modal.open}
        onOpenChange={hideModal}
        title={modal.title}
        description={modal.description}
        actions={modal.actions}
        className={modal.className}
      >
        {modal.children}
      </BaseModal>
    </ModalContext.Provider>
  )
}

export function useModal() {
  const ctx = useContext(ModalContext)
  if (!ctx) throw new Error("useModal must be used within a ModalProvider")
  return ctx
} 