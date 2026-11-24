"use client";

import { PaymentFields, usePaymentForm, type PaymentValues } from "@/components/app/payment-fields";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { api } from "@/lib/fetch-wrapper";
import { formatMoney, txLabel } from "@/lib/money";
import type { Currency } from "@prisma/client";
import { revalidateApp } from "@/lib/revalidate";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

export function EditPayment({ loanId, txId, currency, initial }: { loanId: string; txId: string; currency: Currency; initial: PaymentValues }) {
	const router = useRouter();
	const form = usePaymentForm(initial);
	const [pending, setPending] = useState(false);
	const url = `/loans/${loanId}/transactions/${txId}`;

	const submit = async (e: React.FormEvent) => {
		e.preventDefault();
		const payload = form.validate();
		if (!payload) return;
		setPending(true);
		try {
			await api.patch(url, payload);
			toast.success("Payment updated");
			await revalidateApp();
			router.push(`/loans/${loanId}`);
		} catch (error) {
			toast.error(error instanceof Error ? error.message : "Changes not saved. Try again.");
			setPending(false);
		}
	};

	return (
		<div className='space-y-10'>
			<form onSubmit={submit} noValidate className='space-y-6 rounded-2xl border bg-card p-4 shadow-sm sm:p-6'>
				<PaymentFields
					form={form}
					currency={currency}
					disabled={pending}
					typeLegend='What happened?'
					typeOptions={[
						{ value: "DEBIT", label: "I got money" },
						{ value: "CREDIT", label: "I gave money" },
					]}
				/>
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
					Remove this payment
				</h2>
				<p className='text-[15px] text-muted-foreground'>The loan balance will be recalculated without it.</p>
				<ConfirmDialog
					trigger={
						<Button variant='danger' className='w-full sm:w-auto'>
							Delete payment
						</Button>
					}
					title='Delete this payment?'
					description={
						<p>
							{txLabel[initial.type]} {formatMoney(Number(initial.amount), currency)} on {new Date(`${initial.date}T12:00:00Z`).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}. This can&apos;t be undone.
						</p>
					}
					confirmLabel='Delete payment'
					onConfirm={async () => {
						try {
							await api.delete(url);
							toast.success("Payment deleted");
							await revalidateApp();
							router.push(`/loans/${loanId}`);
							return true;
						} catch (error) {
							toast.error(error instanceof Error ? error.message : "Payment not deleted. Try again.");
							return false;
						}
					}}
				/>
			</section>
		</div>
	);
}
