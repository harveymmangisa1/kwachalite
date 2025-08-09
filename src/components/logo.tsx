import { Wallet } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function Logo({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'flex items-center gap-2 text-primary font-bold text-xl',
        className
      )}
    >
      <div className="bg-primary text-primary-foreground p-2 rounded-lg">
        <Wallet className="h-6 w-6" />
      </div>
      <span>KwachaLite</span>
    </div>
  );
}
