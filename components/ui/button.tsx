import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";
import { cn } from "@/lib/utils";

// Heights stay at 44px+ so every control is an easy thumb target.
export const buttonVariants = cva(
	"inline-flex select-none items-center justify-center gap-2 whitespace-nowrap rounded-lg font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-60 [&_svg]:size-[18px] [&_svg]:shrink-0",
	{
		variants: {
			variant: {
				primary: "bg-primary text-primary-foreground hover:bg-primary/90 active:bg-primary/80",
				secondary: "border border-input/60 bg-card text-foreground hover:bg-muted",
				ghost: "text-foreground hover:bg-muted",
				danger: "border border-danger/40 bg-card text-danger hover:bg-danger/10",
				dangerSolid: "bg-danger text-white hover:bg-danger/90 dark:text-background",
			},
			size: {
				md: "h-12 px-5 text-base",
				sm: "h-11 px-4 text-[15px]",
				icon: "size-11",
			},
		},
		defaultVariants: { variant: "primary", size: "md" },
	}
);

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
	asChild?: boolean;
	pending?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
	({ className, variant, size, asChild, pending, disabled, children, ...props }, ref) => {
		const Comp = asChild ? Slot : "button";
		return (
			<Comp
				ref={ref}
				className={cn(buttonVariants({ variant, size }), className)}
				disabled={disabled || pending}
				aria-busy={pending || undefined}
				{...props}>
				{pending ? (
					<>
						<span aria-hidden className='size-4 animate-spin rounded-full border-2 border-current border-t-transparent' />
						{children}
					</>
				) : (
					children
				)}
			</Comp>
		);
	}
);
Button.displayName = "Button";
