import { cn } from "@/lib/utils";

interface SectionDividerProps {
	children: React.ReactNode;
	className?: string;
	textBg?: string;
}

export function SectionDivider({
	children,
	className,
	textBg,
}: SectionDividerProps) {
	return (
		<div className={`relative ${className}`}>
			<div className='absolute inset-0 flex items-center'>
				<div className='w-full border-t border-dashed border-muted-foreground/25' />
			</div>
			<div className='relative flex justify-center'>
				<span className={cn("px-2 text-xl font-medium bg-card", textBg)}>
					{children}
				</span>
			</div>
		</div>
	);
}
