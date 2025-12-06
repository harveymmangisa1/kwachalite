// Type declarations for packages without built-in types
declare module '@hookform/resolvers/zod' {
    import { Resolver } from 'react-hook-form';
    import { z } from 'zod';

    export function zodResolver<T extends z.ZodType<any, any>>(
        schema: T,
        schemaOptions?: any,
        resolverOptions?: any
    ): Resolver<z.infer<T>>;
}

declare module 'lucide-react' {
    import { FC, SVGProps } from 'react';

    export type LucideIcon = FC<SVGProps<SVGSVGElement>>;

    export const Search: LucideIcon;
    export const Flame: LucideIcon;
    export const Trophy: LucideIcon;
    export const Calendar: LucideIcon;
    export const Zap: LucideIcon;
    export const Award: LucideIcon;
    export const Snowflake: LucideIcon;
    export const TrendingUp: LucideIcon;
    export const Target: LucideIcon;
    export const Star: LucideIcon;
    export const Cloud: LucideIcon;
    export const CloudOff: LucideIcon;
    export const AlertCircle: LucideIcon;
    export const CheckCircle2: LucideIcon;
    export const Loader2: LucideIcon;
    export const WifiOff: LucideIcon;
    export const X: LucideIcon;
    export const CalendarIcon: LucideIcon;
    export const PlusCircle: LucideIcon;
    export const Check: LucideIcon;
    export const ChevronsUpDown: LucideIcon;

    // Dashboard icons
    export const FileText: LucideIcon;
    export const PiggyBank: LucideIcon;
    export const Landmark: LucideIcon;
    export const ArrowUp: LucideIcon;
    export const ArrowDown: LucideIcon;
    export const Filter: LucideIcon;
    export const Wallet: LucideIcon;
    export const Bell: LucideIcon;
    export const DollarSign: LucideIcon;

    // Additional common icons
    export const Home: LucideIcon;
    export const Settings: LucideIcon;
    export const User: LucideIcon;
    export const Users: LucideIcon;
    export const Menu: LucideIcon;
    export const ChevronDown: LucideIcon;
    export const ChevronUp: LucideIcon;
    export const ChevronLeft: LucideIcon;
    export const ChevronRight: LucideIcon;
    export const Plus: LucideIcon;
    export const Minus: LucideIcon;
    export const Edit: LucideIcon;
    export const Trash: LucideIcon;
    export const Save: LucideIcon;
    export const Download: LucideIcon;
    export const Upload: LucideIcon;
    export const Eye: LucideIcon;
    export const EyeOff: LucideIcon;
    export const Lock: LucideIcon;
    export const Unlock: LucideIcon;
    export const Mail: LucideIcon;
    export const Phone: LucideIcon;
    export const MapPin: LucideIcon;
    export const MoreVertical: LucideIcon;
    export const MoreHorizontal: LucideIcon;

    // Add more icons as needed
    const icons: Record<string, LucideIcon>;
    export default icons;
}
