import { cn } from '@/lib/utils';

interface LogoProps {
  className?: string;
  showText?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export default function Logo({ className, showText = true, size = 'md' }: LogoProps) {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10', 
    lg: 'w-12 h-12'
  };

  const textSizeClasses = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl'
  };

  return (
    <div
      className={cn(
        'flex items-center gap-3 text-primary font-bold',
        showText && textSizeClasses[size],
        className
      )}
    >
      <div className={cn('rounded-xl overflow-hidden shadow-sm', sizeClasses[size])}>
        <img 
          src="/Assets/logo.png" 
          alt="KwachaLite Logo" 
          className="w-full h-full object-cover"
        />
      </div>
      {showText && <span>KwachaLite</span>}
    </div>
  );
}
