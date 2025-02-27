"use client";

import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { TrashIcon } from "lucide-react";
import { ReactNode } from "react";

interface DeleteAlertProps {
	/**
	 * The title of the delete alert dialog
	 * @default "Delete Confirmation"
	 */
	title?: string;
	/**
	 * The description/message of the delete alert dialog
	 * @default "Are you sure you want to delete this? This action cannot be undone."
	 */
	description?: string | ReactNode;
	/**
	 * The text for the cancel button
	 * @default "Cancel"
	 */
	cancelText?: string;
	/**
	 * The text for the delete button
	 * @default "Delete"
	 */
	deleteText?: string;
	/**
	 * Whether the delete operation is in progress
	 * @default false
	 */
	isDeleting?: boolean;
	/**
	 * The function to call when delete is confirmed
	 */
	onDelete: () => Promise<void>;
	/**
	 * Custom trigger button. If not provided, a default delete button will be used
	 */
	trigger?: ReactNode;
	/**
	 * Additional CSS classes for the trigger button (only used if no custom trigger is provided)
	 */
	triggerClassName?: string;
}

export function DeleteAlert({
	title = "Delete Confirmation",
	description = "Are you sure you want to delete this? This action cannot be undone.",
	cancelText = "Cancel",
	deleteText = "Delete",
	isDeleting = false,
	onDelete,
	trigger,
	triggerClassName,
}: DeleteAlertProps) {
	return (
		<AlertDialog>
			<AlertDialogTrigger asChild>
				{trigger || (
					<Button
						variant='destructive'
						size='icon'
						className={triggerClassName}>
						<TrashIcon className='h-4 w-4' />
					</Button>
				)}
			</AlertDialogTrigger>
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>{title}</AlertDialogTitle>
					<AlertDialogDescription>{description}</AlertDialogDescription>
				</AlertDialogHeader>
				<AlertDialogFooter>
					<AlertDialogCancel disabled={isDeleting}>
						{cancelText}
					</AlertDialogCancel>
					<AlertDialogAction
						onClick={(e) => {
							e.preventDefault();
							onDelete();
						}}
						disabled={isDeleting}
						className='bg-destructive text-destructive-foreground hover:bg-destructive/90'>
						{isDeleting ? (
							<>
								<span className='mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent' />
								{deleteText}...
							</>
						) : (
							deleteText
						)}
					</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
}
