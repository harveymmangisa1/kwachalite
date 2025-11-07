import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const glassCardVariants = cva(
  "backdrop-blur-md border transition-all duration-300",
  {
    variants: {
      variant: {
        default: "bg-background/80 border-border/50 hover:bg-background/90 hover:border-border/70",
        subtle: "bg-background/60 border-border/30 hover:bg-background/80 hover:border-border/50",
        strong: "bg-background/90 border-border/70 hover:bg-background/95 hover:border-border/90",
      },
      effect: {
        none: "",
        glow: "hover:shadow-lg hover:shadow-primary/5",
        lift: "hover:-translate-y-1 hover:shadow-xl",
        scale: "hover:scale-[1.02] hover:shadow-lg",
      },
    },
    defaultVariants: {
      variant: "default",
      effect: "none",
    },
  }
)

export interface GlassCardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof glassCardVariants> {}

const GlassCard = React.forwardRef<HTMLDivElement, GlassCardProps>(
  ({ className, variant, effect, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(glassCardVariants({ variant, effect }), "rounded-2xl", className)}
        {...props}
      />
    )
  }
)
GlassCard.displayName = "GlassCard"

export { GlassCard, glassCardVariants }