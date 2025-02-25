"use client";

import { cn } from "@/lib/utils";

interface LoadingProps extends React.HTMLAttributes<HTMLDivElement> {
	size?: "sm" | "md" | "lg";
}

const sizeClasses = {
	sm: "h-4 w-4",
	md: "h-8 w-8",
	lg: "h-12 w-12",
};

export function Loading({ size = "md", className, ...props }: LoadingProps) {
	return (
		<div
			role='status'
			className={cn("flex items-center justify-center", className)}
			{...props}>
			<div
				className={cn(
					"animate-spin rounded-full border-4 border-gray-200 border-t-primary",
					sizeClasses[size]
				)}
			/>
			<span className='sr-only'>Loading...</span>
		</div>
	);
}
