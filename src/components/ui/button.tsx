import * as React from "react"
import { cn } from "@/lib/utils"

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost'
  size?: 'default' | 'sm' | 'lg'
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'default', ...props }, ref) => {
    return (
      <button
        className={cn(
          "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none",
          variant === 'default' && "bg-blue-600 text-white hover:bg-blue-700",
          variant === 'destructive' && "bg-red-600 text-white hover:bg-red-700",
          variant === 'outline' && "border border-gray-300 bg-transparent hover:bg-gray-50",
          variant === 'secondary' && "bg-gray-100 text-gray-900 hover:bg-gray-200",
          variant === 'ghost' && "hover:bg-gray-100",
          size === 'default' && "h-10 py-2 px-4",
          size === 'sm' && "h-9 px-3 rounded-md",
          size === 'lg' && "h-11 px-8 rounded-md",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button }
