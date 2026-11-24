"use client";

import * as AlertDialog from "@radix-ui/react-alert-dialog";
import { useState } from "react";
import { Button } from "./button";

interface ConfirmDialogProps {
	trigger: React.ReactNode;
	title: string;
	description: React.ReactNode;
	confirmLabel: string;
	onConfirm: () => Promise<boolean>;
}

/** Destructive confirmation; stays open while the action runs and closes only on success. */
export function ConfirmDialog({ trigger, title, description, confirmLabel, onConfirm }: ConfirmDialogProps) {
	const [open, setOpen] = useState(false);
	const [pending, setPending] = useState(false);

	return (
		<AlertDialog.Root open={open} onOpenChange={(next) => !pending && setOpen(next)}>
			<AlertDialog.Trigger asChild>{trigger}</AlertDialog.Trigger>
			<AlertDialog.Portal>
				<AlertDialog.Overlay className='fixed inset-0 z-50 bg-foreground/40 backdrop-blur-[2px] data-[state=open]:animate-in data-[state=open]:fade-in-0' />
				<AlertDialog.Content className='fixed inset-x-0 bottom-0 z-50 rounded-t-2xl border bg-card p-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] shadow-xl data-[state=open]:animate-in data-[state=open]:slide-in-from-bottom-8 sm:inset-x-auto sm:bottom-auto sm:left-1/2 sm:top-1/2 sm:w-[min(28rem,calc(100vw-2rem))] sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-2xl sm:pb-6 sm:data-[state=open]:slide-in-from-bottom-2'>
					<AlertDialog.Title className='text-xl font-semibold'>{title}</AlertDialog.Title>
					<AlertDialog.Description asChild>
						<div className='mt-2 space-y-2 text-[15px] leading-relaxed text-muted-foreground'>{description}</div>
					</AlertDialog.Description>
					<div className='mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end'>
						<AlertDialog.Cancel asChild>
							<Button variant='secondary' disabled={pending}>
								Cancel
							</Button>
						</AlertDialog.Cancel>
						<Button
							variant='dangerSolid'
							pending={pending}
							onClick={async () => {
								setPending(true);
								const ok = await onConfirm();
								setPending(false);
								if (ok) setOpen(false);
							}}>
							{confirmLabel}
						</Button>
					</div>
				</AlertDialog.Content>
			</AlertDialog.Portal>
		</AlertDialog.Root>
	);
}
