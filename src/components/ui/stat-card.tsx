import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const statCardVariants = cva(
  "rounded-2xl border bg-card p-6 transition-all duration-300 hover:shadow-lg",
  {
    variants: {
      variant: {
        default: "hover:border-primary/20",
        success: "border-success/20 bg-success/5 hover:border-success/40",
        warning: "border-warning/20 bg-warning/5 hover:border-warning/40",
        error: "border-error/20 bg-error/5 hover:border-error/40",
        gradient: "bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20 hover:border-primary/40",
      },
      size: {
        default: "p-6",
        sm: "p-4",
        lg: "p-8",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface StatCardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof statCardVariants> {
  title: string
  value: string | number
  change?: {
    value: number
    label: string
    trend: 'up' | 'down' | 'neutral'
  }
  icon?: React.ReactNode
  description?: string
}

const StatCard = React.forwardRef<HTMLDivElement, StatCardProps>(
  ({ className, variant, size, title, value, change, icon, description, ...props }, ref) => {
    const trendColor = change?.trend === 'up' ? 'text-success' : 
                      change?.trend === 'down' ? 'text-error' : 'text-muted-foreground'
    
    return (
      <div
        ref={ref}
        className={cn(statCardVariants({ variant, size }), className)}
        {...props}
      >
        <div className="flex items-start justify-between">
          <div className="space-y-2 flex-1">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold tracking-tight">{value}</p>
            {description && (
              <p className="text-xs text-muted-foreground">{description}</p>
            )}
            {change && (
              <div className="flex items-center gap-1 text-xs">
                <span className={cn("font-medium", trendColor)}>
                  {change.trend === 'up' && '+'}
                  {change.value}%
                </span>
                <span className="text-muted-foreground">{change.label}</span>
              </div>
            )}
          </div>
          {icon && (
            <div className="p-2 rounded-lg bg-muted/50">
              {icon}
            </div>
          )}
        </div>
      </div>
    )
  }
)
StatCard.displayName = "StatCard"

export { StatCard, statCardVariants }