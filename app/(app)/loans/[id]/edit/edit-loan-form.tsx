"use client";

import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Field, Input, Textarea } from "@/components/ui/field";
import { api } from "@/lib/fetch-wrapper";
import { balanceState, formatMoney } from "@/lib/money";
import type { Currency } from "@prisma/client";
import { revalidateApp } from "@/lib/revalidate";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

type Loan = { id: string; title: string; description: string; balance: number; payments: number };

export function EditLoanForm({ loan, currency }: { loan: Loan; currency: Currency }) {
	const router = useRouter();
	const [title, setTitle] = useState(loan.title);
	const [description, setDescription] = useState(loan.description);
	const [error, setError] = useState<string>();
	const [pending, setPending] = useState(false);
	const state = balanceState(loan.balance);

	const submit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!title.trim()) {
			setError("Enter who this loan is with.");
			document.getElementById("loan-title")?.focus();
			return;
		}
		setPending(true);
		try {
			await api.patch(`/loans/${loan.id}`, { title, description });
			toast.success("Loan updated");
			await revalidateApp();
			router.push(`/loans/${loan.id}`);
		} catch (err) {
			const message = err instanceof Error ? err.message : "Changes not saved. Try again.";
			setError(message);
			toast.error(message);
			setPending(false);
		}
	};

	return (
		<div className='space-y-10'>
			<form onSubmit={submit} noValidate className='space-y-6 rounded-2xl border bg-card p-4 shadow-sm sm:p-6'>
				<Field id='loan-title' label='Who is it with?' error={error}>
					{(a11y) => (
						<Input
							{...a11y}
							value={title}
							maxLength={200}
							autoComplete='off'
							disabled={pending}
							onChange={(e) => {
								setTitle(e.target.value);
								setError(undefined);
							}}
						/>
					)}
				</Field>
				<Field id='loan-note' label='About this loan' optional>
					{(a11y) => <Textarea {...a11y} value={description} maxLength={1000} disabled={pending} onChange={(e) => setDescription(e.target.value)} />}
				</Field>
				<div className='flex flex-col-reverse gap-3 sm:flex-row'>
					<Button type='button' variant='secondary' disabled={pending} onClick={() => router.back()} className='sm:flex-1'>
						Cancel
					</Button>
					<Button type='submit' pending={pending} className='sm:flex-1'>
						Save changes
					</Button>
				</div>
			</form>

			<section aria-labelledby='danger' className='space-y-3'>
				<h2 id='danger' className='text-lg font-semibold'>
					Delete this loan
				</h2>
				<p className='text-[15px] text-muted-foreground'>
					Removes the loan and its {loan.payments} {loan.payments === 1 ? "payment" : "payments"}.
				</p>
				<ConfirmDialog
					trigger={
						<Button variant='danger' className='w-full sm:w-auto'>
							Delete loan
						</Button>
					}
					title='Delete this loan?'
					description={
						<>
							<p>
								<strong className='break-words font-semibold text-foreground'>{loan.title}</strong> and all {loan.payments} payments will be removed. This can&apos;t be
								undone.
							</p>
							{state !== "settled" && (
								<p className='font-medium text-danger'>
									It isn&apos;t settled: {state === "owed" ? "they still owe you" : "you still owe them"} {formatMoney(loan.balance, currency)}.
								</p>
							)}
						</>
					}
					confirmLabel='Delete loan'
					onConfirm={async () => {
						try {
							await api.delete(`/loans/${loan.id}`);
							toast.success("Loan deleted");
							await revalidateApp();
							router.push("/loans");
							return true;
						} catch (err) {
							toast.error(err instanceof Error ? err.message : "Loan not deleted. Try again.");
							return false;
						}
					}}
				/>
			</section>
		</div>
	);
}
