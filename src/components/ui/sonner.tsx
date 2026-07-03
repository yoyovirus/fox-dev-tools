"use client"

import { useThemeContext } from "@/components/AppThemeProvider"
import { Toaster as Sonner, type ToasterProps } from "sonner"
import { CheckCircledIcon, InfoCircledIcon, ExclamationTriangleIcon, CrossCircledIcon, UpdateIcon } from "@radix-ui/react-icons"

const Toaster = ({ ...props }: ToasterProps) => {
  const { mode = "dark" } = useThemeContext()

  return (
    <Sonner
      theme={mode as ToasterProps["theme"]}
      className="toaster group"
      icons={{
        success: (
          <CheckCircledIcon className="size-4" />
        ),
        info: (
          <InfoCircledIcon className="size-4" />
        ),
        warning: (
          <ExclamationTriangleIcon className="size-4" />
        ),
        error: (
          <CrossCircledIcon className="size-4" />
        ),
        loading: (
          <UpdateIcon className="size-4 animate-spin" />
        ),
      }}
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
          "--border-radius": "var(--radius)",
        } as React.CSSProperties
      }
      toastOptions={{
        classNames: {
          toast: "cn-toast",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
