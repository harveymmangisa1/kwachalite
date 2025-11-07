import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const formFieldVariants = cva(
  "space-y-2",
  {
    variants: {
      layout: {
        default: "",
        horizontal: "flex flex-row items-center gap-4 space-y-0",
        inline: "flex flex-wrap items-center gap-2 space-y-0",
      },
    },
    defaultVariants: {
      layout: "default",
    },
  }
)

const formLabelVariants = cva(
  "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
  {
    variants: {
      variant: {
        default: "text-foreground",
        muted: "text-muted-foreground",
        accent: "text-primary font-semibold",
      },
      size: {
        default: "text-sm",
        sm: "text-xs",
        lg: "text-base",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface FormFieldProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof formFieldVariants> {
  label?: string
  description?: string
  error?: string
  required?: boolean
}

export interface FormLabelProps
  extends React.LabelHTMLAttributes<HTMLLabelElement>,
    VariantProps<typeof formLabelVariants> {
  required?: boolean
}

const FormField = React.forwardRef<HTMLDivElement, FormFieldProps>(
  ({ className, layout, label, description, error, required, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(formFieldVariants({ layout }), className)}
        {...props}
      >
        {label && (
          <FormLabel required={required} className={layout === 'horizontal' ? "flex-shrink-0 w-32" : ""}>
            {label}
          </FormLabel>
        )}
        <div className={cn("flex-1", layout === 'horizontal' && "space-y-2")}>
          {children}
          {description && !error && (
            <p className="text-xs text-muted-foreground mt-1">{description}</p>
          )}
          {error && (
            <p className="text-xs text-error mt-1 flex items-center gap-1">
              <span className="w-1 h-1 rounded-full bg-error"></span>
              {error}
            </p>
          )}
        </div>
      </div>
    )
  }
)
FormField.displayName = "FormField"

const FormLabel = React.forwardRef<HTMLLabelElement, FormLabelProps>(
  ({ className, variant, size, required, children, ...props }, ref) => {
    return (
      <label
        ref={ref}
        className={cn(formLabelVariants({ variant, size }), className)}
        {...props}
      >
        {children}
        {required && <span className="text-error ml-1">*</span>}
      </label>
    )
  }
)
FormLabel.displayName = "FormLabel"

const FormDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
))
FormDescription.displayName = "FormDescription"

const FormMessage = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, children, ...props }, ref) => {
  if (!children) {
    return null
  }

  return (
    <p
      ref={ref}
      className={cn("text-sm font-medium text-error flex items-center gap-1", className)}
      {...props}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-error"></span>
      {children}
    </p>
  )
})
FormMessage.displayName = "FormMessage"

export {
  FormField,
  FormLabel,
  FormDescription,
  FormMessage,
  formFieldVariants,
  formLabelVariants,
}