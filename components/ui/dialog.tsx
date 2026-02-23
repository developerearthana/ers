"use client"

import * as React from "react"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"

const DialogContext = React.createContext<{
    open: boolean;
    onOpenChange: (open: boolean) => void;
}>({ open: false, onOpenChange: () => { } })

const Dialog: React.FC<{
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    children: React.ReactNode;
}> = ({ open, onOpenChange, children }) => {
    const [isOpen, setIsOpen] = React.useState(open || false)

    React.useEffect(() => {
        if (open !== undefined) {
            setIsOpen(open)
        }
    }, [open])

    const handleOpenChange = (newOpen: boolean) => {
        setIsOpen(newOpen)
        onOpenChange?.(newOpen)
    }

    return (
        <DialogContext.Provider value={{ open: isOpen, onOpenChange: handleOpenChange }}>
            {children}
        </DialogContext.Provider>
    )
}

const DialogTrigger = React.forwardRef<
    HTMLButtonElement,
    React.ButtonHTMLAttributes<HTMLButtonElement> & { asChild?: boolean }
>(({ className, onClick, asChild, ...props }, ref) => {
    const { onOpenChange } = React.useContext(DialogContext)

    if (asChild) {
        // Logic for asChild, simple cloneElement for now or just rendering children with generic props
        // Since we don't have a full Slot implementation here, we'll just wrap or assume the child is a button.
        // For simplicity in this quick fix without Radix, if asChild is true, we just render the children
        // but we need to intercept the onClick.
        // A robust implementation needs Radix UI Slot.
        // Let's just create a wrapper that doesn't look like a button if asChild is implicit,
        // but for this specific use case (Button inside Trigger), we can just wrap it in a div that handles click
        // or clone it.

        // Simplest "asChild" fallback:
        const child = React.Children.only(props.children) as React.ReactElement;
        return React.cloneElement(child, {
            onClick: (e: React.MouseEvent) => {
                onOpenChange(true);
                (child.props as any).onClick?.(e);
                onClick?.(e as any);
            },
            ref: ref
        } as any);
    }

    return (
        <button
            ref={ref}
            className={cn(className)}
            onClick={(e) => {
                onOpenChange(true)
                onClick?.(e)
            }}
            {...props}
        />
    )
})
DialogTrigger.displayName = "DialogTrigger"

const DialogContent = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => {
    const { open, onOpenChange } = React.useContext(DialogContext)

    if (!open) return null

    return (
        <div className="fixed inset-0 z-50 flex items-start justify-center sm:items-center">
            <div
                className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity animate-in fade-in-0"
                onClick={() => onOpenChange(false)}
            />
            <div
                ref={ref}
                className={cn(
                    "fixed z-50 grid w-full gap-4 border bg-background p-6 shadow-lg duration-200 animate-in fade-in-0 zoom-in-95 sm:rounded-lg md:w-full max-h-[80vh] overflow-y-auto",
                    className
                )}
                {...props}
            >
                {children}
                <button
                    className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground"
                    onClick={() => onOpenChange(false)}
                >
                    <X className="h-4 w-4" />
                    <span className="sr-only">Close</span>
                </button>
            </div>
        </div>
    )
})
DialogContent.displayName = "DialogContent"

const DialogHeader = ({
    className,
    ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
    <div
        className={cn(
            "flex flex-col space-y-1.5 text-center sm:text-left",
            className
        )}
        {...props}
    />
)
DialogHeader.displayName = "DialogHeader"

const DialogTitle = React.forwardRef<
    HTMLParagraphElement,
    React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
    <h3
        ref={ref}
        className={cn(
            "text-lg font-semibold leading-none tracking-tight",
            className
        )}
        {...props}
    />
))
DialogTitle.displayName = "DialogTitle"

const DialogDescription = React.forwardRef<
    HTMLParagraphElement,
    React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
    <p
        ref={ref}
        className={cn("text-sm text-muted-foreground", className)}
        {...props}
    />
))
DialogDescription.displayName = "DialogDescription"

const DialogFooter = ({
    className,
    ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
    <div
        className={cn(
            "flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2",
            className
        )}
        {...props}
    />
)
DialogFooter.displayName = "DialogFooter"

export {
    Dialog,
    DialogTrigger,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
}
