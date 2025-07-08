import * as React from "react"
import { cn } from "@/lib/utils"

export interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  variant?: 'default' | 'error'
}

const Label = React.forwardRef<HTMLLabelElement, LabelProps>(
  ({ className, variant = 'default', ...props }, ref) => (
    <label
      ref={ref}
      className={cn(
        "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
        variant === 'error' && "text-red-500",
        className
      )}
      {...props}
    />
  )
)
Label.displayName = "Label"

export { Label }
