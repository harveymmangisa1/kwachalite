import { cn } from '@/lib/utils';

interface LogoProps {
  className?: string;
  showText?: boolean;
  size?: 'sm' | 'md' | 'lg';
  logoUrl?: string;
  fallbackText?: string;
}

export default function Logo({ 
  className, 
  showText = true, 
  size = 'md', 
  logoUrl,
  fallbackText = "KwachaLite" 
}: LogoProps) {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8', 
    lg: 'w-10 h-10'
  };

  const textSizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg'
  };

  return (
    <div
      className={cn(
        'flex items-center gap-2 text-primary font-semibold',
        showText && textSizeClasses[size],
        className
      )}
    >
      <div className={cn('rounded-lg overflow-hidden shadow-sm flex-shrink-0', sizeClasses[size])}>
        {logoUrl ? (
          <img 
            src={logoUrl} 
            alt="Business Logo" 
            className="w-full h-full object-contain bg-white"
            onError={(e) => {
              // Fallback to default logo if custom logo fails to load
              const target = e.target as HTMLImageElement;
              target.src = "/Assets/logo.png";
            }}
          />
        ) : (
          <img 
            src="/Assets/logo.png" 
            alt="KwachaLite Logo" 
            className="w-full h-full object-cover"
          />
        )}
      </div>
      {showText && <span>{fallbackText}</span>}
    </div>
  );
}
