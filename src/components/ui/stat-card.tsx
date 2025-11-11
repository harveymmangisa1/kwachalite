import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const statCardVariants = cva(
  "rounded-xl sm:rounded-2xl border bg-card p-4 sm:p-6 transition-all duration-300 hover:shadow-lg",
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
        default: "p-4 sm:p-6",
        sm: "p-3 sm:p-4",
        lg: "p-6 sm:p-8",
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
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1.5 sm:space-y-2 flex-1 min-w-0">
            <p className="text-xs sm:text-sm font-medium text-muted-foreground truncate">{title}</p>
            <p className="text-lg sm:text-2xl font-bold tracking-tight truncate">{value}</p>
            {description && (
              <p className="text-xs text-muted-foreground hidden sm:block">{description}</p>
            )}
            {change && (
              <div className="flex items-center gap-1 text-xs">
                <span className={cn("font-medium", trendColor)}>
                  {change.trend === 'up' && '+'}
                  {change.value}%
                </span>
                <span className="text-muted-foreground hidden sm:inline">{change.label}</span>
                <span className="text-muted-foreground sm:hidden">vs last</span>
              </div>
            )}
          </div>
          {icon && (
            <div className="p-1.5 sm:p-2 rounded-lg bg-muted/50 flex-shrink-0">
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