import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import AnimatedButton from "@/components/common/AnimatedButton"

interface CTAProps {
  badge?: {
    text: string
  }
  title: string | React.ReactNode
  description?: string
  action: {
    text: string
    href: string
    variant?: "default" | "glow"
  }
  withGlow?: boolean
  className?: string
}

export function CTASection({
  badge,
  title,
  description,
  action,
  withGlow = true,
  className,
}: CTAProps) {
  return (
    <section className={cn("overflow-hidden pt-0 md:pt-0", className)}>
      <div className="relative mx-auto flex max-w-container flex-col items-center gap-6 px-8 py-12 text-center sm:gap-8 md:py-24">
        {/* Badge */}
        {badge && (
          <Badge
            variant="outline"
            className="opacity-0 animate-fade-in-up delay-100"
          >
            <span className="text-muted-foreground">{badge.text}</span>
          </Badge>
        )}

        {/* Title */}
        <h2 className="text-3xl font-semibold sm:text-5xl opacity-0 animate-fade-in-up delay-200">
          {title}
        </h2>

        {/* Description */}
        {description && (
          <p className="text-muted-foreground opacity-0 animate-fade-in-up delay-300">
            {description}
          </p>
        )}

        {/* Action Button */}
        <div className="opacity-0 animate-fade-in-up delay-500">
          <AnimatedButton
            href={action.href}
            label={action.text}
            className="bg-foreground-blue text-white shadow-lg shadow-foreground-blue/20 hover:shadow-xl hover:shadow-foreground-blue/30 transition-all"
          />
        </div>

        {/* Glow Effect */}
        {withGlow && (
          <div className="fade-top-lg pointer-events-none absolute inset-0 rounded-2xl shadow-glow" />
        )}
      </div>
    </section>
  )
}
