import * as React from "react"
import { AlertDialog } from "@base-ui/react/alert-dialog"
import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"

function AlertDialogRoot({
  ...props
}: AlertDialog.Root.Props) {
  return <AlertDialog.Root {...props} />
}

function AlertDialogTrigger({
  ...props
}: AlertDialog.Trigger.Props) {
  return <AlertDialog.Trigger {...props} />
}

function AlertDialogPortal({
  ...props
}: AlertDialog.Portal.Props) {
  return <AlertDialog.Portal {...props} />
}

function AlertDialogOverlay({
  className,
  ...props
}: AlertDialog.Backdrop.Props) {
  return (
    <AlertDialog.Backdrop
      className={cn(
        "fixed inset-0 z-50 bg-black/80 data-[ending-style]:opacity-0 data-[starting-style]:opacity-0 transition-opacity duration-200",
        className,
      )}
      {...props}
    />
  )
}

function AlertDialogContent({
  className,
  ...props
}: AlertDialog.Popup.Props) {
  return (
    <AlertDialog.Portal>
      <AlertDialogOverlay />
      <AlertDialog.Popup
        className={cn(
          "fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 data-[ending-style]:scale-95 data-[ending-style]:opacity-0 data-[starting-style]:scale-95 data-[starting-style]:opacity-0 sm:rounded-lg",
          className,
        )}
        {...props}
      />
    </AlertDialog.Portal>
  )
}

function AlertDialogHeader({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "flex flex-col space-y-2 text-center sm:text-left",
        className,
      )}
      {...props}
    />
  )
}

function AlertDialogFooter({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2",
        className,
      )}
      {...props}
    />
  )
}

function AlertDialogTitle({
  className,
  ...props
}: AlertDialog.Title.Props) {
  return (
    <AlertDialog.Title
      className={cn("text-lg font-semibold", className)}
      {...props}
    />
  )
}

function AlertDialogDescription({
  className,
  ...props
}: AlertDialog.Description.Props) {
  return (
    <AlertDialog.Description
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    />
  )
}

function AlertDialogAction({
  className,
  variant,
  ...props
}: AlertDialog.Close.Props & { variant?: "default" | "destructive" }) {
  return (
    <AlertDialog.Close
      className={cn(
        buttonVariants({ variant: variant === "destructive" ? "destructive" : "default" }),
        className,
      )}
      {...props}
    />
  )
}

function AlertDialogCancel({
  className,
  ...props
}: AlertDialog.Close.Props) {
  return (
    <AlertDialog.Close
      className={cn(
        buttonVariants({ variant: "outline" }),
        "mt-2 sm:mt-0",
        className,
      )}
      {...props}
    />
  )
}

export {
  AlertDialogRoot as AlertDialog,
  AlertDialogPortal as AlertDialogPortal,
  AlertDialogOverlay as AlertDialogOverlay,
  AlertDialogTrigger as AlertDialogTrigger,
  AlertDialogContent as AlertDialogContent,
  AlertDialogHeader as AlertDialogHeader,
  AlertDialogFooter as AlertDialogFooter,
  AlertDialogTitle as AlertDialogTitle,
  AlertDialogDescription as AlertDialogDescription,
  AlertDialogAction as AlertDialogAction,
  AlertDialogCancel as AlertDialogCancel,
}
