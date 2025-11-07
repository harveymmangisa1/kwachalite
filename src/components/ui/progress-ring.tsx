import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const progressRingVariants = cva(
  "relative inline-flex items-center justify-center",
  {
    variants: {
      size: {
        sm: "w-12 h-12",
        default: "w-16 h-16",
        lg: "w-20 h-20",
        xl: "w-24 h-24",
      },
    },
    defaultVariants: {
      size: "default",
    },
  }
)

export interface ProgressRingProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof progressRingVariants> {
  value: number
  max?: number
  strokeWidth?: number
  showLabel?: boolean
  label?: string
  color?: 'primary' | 'success' | 'warning' | 'error'
}

const ProgressRing = React.forwardRef<HTMLDivElement, ProgressRingProps>(
  ({ className, size, value, max = 100, strokeWidth = 4, showLabel = true, label, color = 'primary', ...props }, ref) => {
    const percentage = Math.min(Math.max((value / max) * 100, 0), 100)
    const radius = (parseInt(size?.split('-')[1] || '16') * 4 - strokeWidth) / 2
    const circumference = 2 * Math.PI * radius
    const strokeDashoffset = circumference - (percentage / 100) * circumference

    const colorClasses = {
      primary: 'text-primary stroke-primary',
      success: 'text-success stroke-success',
      warning: 'text-warning stroke-warning',
      error: 'text-error stroke-error',
    }

    return (
      <div
        ref={ref}
        className={cn(progressRingVariants({ size }), className)}
        {...props}
      >
        <svg
          className="transform -rotate-90"
          width="100%"
          height="100%"
          viewBox={`0 0 ${radius * 2 + strokeWidth} ${radius * 2 + strokeWidth}`}
        >
          {/* Background circle */}
          <circle
            cx={radius + strokeWidth / 2}
            cy={radius + strokeWidth / 2}
            r={radius}
            strokeWidth={strokeWidth}
            fill="none"
            className="stroke-muted/20"
          />
          {/* Progress circle */}
          <circle
            cx={radius + strokeWidth / 2}
            cy={radius + strokeWidth / 2}
            r={radius}
            strokeWidth={strokeWidth}
            fill="none"
            className={cn(colorClasses[color], "transition-all duration-500 ease-out")}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
          />
        </svg>
        {showLabel && (
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-lg font-bold">{Math.round(percentage)}%</span>
            {label && <span className="text-xs text-muted-foreground">{label}</span>}
          </div>
        )}
      </div>
    )
  }
)
ProgressRing.displayName = "ProgressRing"

export { ProgressRing, progressRingVariants }