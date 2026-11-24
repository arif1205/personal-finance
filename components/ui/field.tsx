import { ChevronDown } from "lucide-react";
import * as React from "react";
import { cn } from "@/lib/utils";

const control =
	"w-full rounded-lg border border-input/70 bg-card px-3.5 text-base text-foreground placeholder:text-muted-foreground/80 transition-colors hover:border-input disabled:opacity-60 aria-[invalid=true]:border-danger";

interface FieldProps {
	id: string;
	label: string;
	hint?: string;
	error?: string;
	optional?: boolean;
	className?: string;
	children: (a11y: { id: string; "aria-invalid"?: true; "aria-describedby"?: string }) => React.ReactNode;
}

/** Label, control, hint and error wired together so screen readers announce all of them. */
export function Field({ id, label, hint, error, optional, className, children }: FieldProps) {
	const describedBy = [hint && `${id}-hint`, error && `${id}-error`].filter(Boolean).join(" ") || undefined;
	return (
		<div className={cn("space-y-1.5", className)}>
			<label htmlFor={id} className='block text-[15px] font-medium'>
				{label}
				{optional && <span className='font-normal text-muted-foreground'> (optional)</span>}
			</label>
			{children({ id, "aria-invalid": error ? true : undefined, "aria-describedby": describedBy })}
			{hint && !error && (
				<p id={`${id}-hint`} className='text-sm text-muted-foreground'>
					{hint}
				</p>
			)}
			{error && (
				<p id={`${id}-error`} className='text-sm font-medium text-danger'>
					{error}
				</p>
			)}
		</div>
	);
}

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(({ className, ...props }, ref) => (
	<input ref={ref} className={cn(control, "h-12", className)} {...props} />
));
Input.displayName = "Input";

export const Textarea = React.forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(
	({ className, ...props }, ref) => <textarea ref={ref} rows={3} className={cn(control, "min-h-24 py-3 leading-relaxed", className)} {...props} />
);
Textarea.displayName = "Textarea";

export const Select = React.forwardRef<HTMLSelectElement, React.SelectHTMLAttributes<HTMLSelectElement>>(({ className, ...props }, ref) => (
	<div className='relative'>
		<select ref={ref} className={cn(control, "h-12 appearance-none pr-10", className)} {...props} />
		<ChevronDown aria-hidden className='pointer-events-none absolute right-3.5 top-1/2 size-[18px] -translate-y-1/2 text-muted-foreground' />
	</div>
));
Select.displayName = "Select";
