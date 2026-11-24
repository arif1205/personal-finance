"use client";

import { PaymentFields, usePaymentForm } from "@/components/app/payment-fields";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/fetch-wrapper";
import { balanceDelta, balanceState, formatMoney } from "@/lib/money";
import type { Currency, TransactionMethod } from "@prisma/client";
import { revalidateApp } from "@/lib/revalidate";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

interface Props {
	loanId: string;
	name: string;
	balance: number;
	currency: Currency;
	lastMethod?: TransactionMethod;
}

export function RecordPayment({ loanId, name, balance, currency, lastMethod }: Props) {
	const router = useRouter();
	const state = balanceState(balance);
	// Most payments move the balance toward zero, so preselect that direction.
	const form = usePaymentForm({ type: state === "owed" ? "DEBIT" : "CREDIT", method: lastMethod ?? "CASH" });
	const [pending, setPending] = useState(false);

	const settlesWith = (state === "owed" && form.values.type === "DEBIT") || (state === "owe" && form.values.type === "CREDIT");
	const after = form.amount === null ? null : balance + balanceDelta(form.values.type, form.amount);

	const submit = async (e: React.FormEvent) => {
		e.preventDefault();
		const payload = form.validate();
		if (!payload) return;
		setPending(true);
		try {
			await api.post(`/loans/${loanId}/transactions`, payload);
			toast.success("Payment saved", { description: `${name}: ${form.values.type === "CREDIT" ? "you gave" : "you got"} ${formatMoney(payload.amount, currency)}.` });
			form.reset();
			await revalidateApp();
		} catch (error) {
			toast.error(error instanceof Error ? error.message : "Payment not saved. Try again.");
		} finally {
			setPending(false);
		}
	};

	return (
		<section aria-labelledby='record' className='rounded-2xl border bg-card p-4 shadow-sm sm:p-6'>
			<h2 id='record' className='mb-5 text-xl font-semibold'>
				Record a payment
			</h2>
			<form onSubmit={submit} noValidate className='space-y-6'>
				<PaymentFields
					form={form}
					currency={currency}
					disabled={pending}
					typeLegend='What happened?'
					typeOptions={[
						{ value: "DEBIT", label: "I got money" },
						{ value: "CREDIT", label: "I gave money" },
					]}
					amountExtra={
						<div className='-mt-2 space-y-2'>
							{settlesWith && (
								<button
									type='button'
									onClick={() => form.set("amount", String(Math.round(Math.abs(balance) * 100) / 100))}
									className='inline-flex h-10 items-center rounded-full border border-input/60 px-4 text-sm font-medium hover:bg-muted'>
									Fill full amount, {formatMoney(balance, currency)}
								</button>
							)}
							<p aria-live='polite' className='text-[15px] text-muted-foreground'>
								{after !== null && <AfterText after={after} currency={currency} />}
							</p>
						</div>
					}
				/>
				<Button type='submit' pending={pending} className='w-full'>
					{pending ? "Saving payment" : "Save payment"}
				</Button>
			</form>
		</section>
	);
}

function AfterText({ after, currency }: { after: number; currency: Currency }) {
	const s = balanceState(after);
	if (s === "settled") return <>After this, you are <strong className='font-semibold text-foreground'>all settled</strong>.</>;
	return (
		<>
			After this, {s === "owed" ? "they owe you" : "you owe them"}{" "}
			<strong className={s === "owed" ? "money font-semibold text-owed" : "money font-semibold text-owe"}>{formatMoney(after, currency)}</strong>.
		</>
	);
}
