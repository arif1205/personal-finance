"use client";

import { PaymentFields, usePaymentForm } from "@/components/app/payment-fields";
import { Button } from "@/components/ui/button";
import { Field, Input, Textarea } from "@/components/ui/field";
import { api } from "@/lib/fetch-wrapper";
import type { Currency } from "@prisma/client";
import { revalidateApp } from "@/lib/revalidate";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

export function NewLoanForm({ currency }: { currency: Currency }) {
	const router = useRouter();
	const form = usePaymentForm({ type: "CREDIT" });
	const [title, setTitle] = useState("");
	const [note, setNote] = useState("");
	const [titleError, setTitleError] = useState<string>();
	const [pending, setPending] = useState(false);

	const submit = async (e: React.FormEvent) => {
		e.preventDefault();
		const name = title.trim();
		const missingName = !name ? "Enter who this loan is with." : undefined;
		setTitleError(missingName);
		const payment = form.validate();
		if (missingName) {
			document.getElementById("loan-title")?.focus();
			return;
		}
		if (!payment) return;
		setPending(true);
		try {
			const { data } = await api.post<{ data: { id: string } }>("/loans", { title: name, description: note, transaction: payment });
			toast.success("Loan added");
			await revalidateApp();
			router.push(`/loans/${data.id}`);
		} catch (error) {
			const message = error instanceof Error ? error.message : "Loan not added. Try again.";
			if (message.includes("name")) setTitleError(message);
			toast.error(message);
			setPending(false);
		}
	};

	return (
		<form onSubmit={submit} noValidate className='space-y-6 rounded-2xl border bg-card p-4 shadow-sm sm:p-6'>
			<Field id='loan-title' label='Who is it with?' hint='A person, shop or bank.' error={titleError}>
				{(a11y) => (
					<Input
						{...a11y}
						value={title}
						maxLength={200}
						autoComplete='off'
						autoCapitalize='words'
						disabled={pending}
						onChange={(e) => {
							setTitle(e.target.value);
							setTitleError(undefined);
						}}
						placeholder='For example, Rahim'
					/>
				)}
			</Field>
			<PaymentFields
				form={form}
				currency={currency}
				disabled={pending}
				typeLegend='What happened?'
				typeOptions={[
					{ value: "CREDIT", label: "I lent money" },
					{ value: "DEBIT", label: "I borrowed money" },
				]}
			/>
			<Field id='loan-note' label='About this loan' optional hint='Shown at the top of the loan.'>
				{(a11y) => <Textarea {...a11y} value={note} maxLength={1000} disabled={pending} onChange={(e) => setNote(e.target.value)} placeholder='For example, pay back before Eid' />}
			</Field>
			<Button type='submit' pending={pending} className='w-full'>
				Add loan
			</Button>
		</form>
	);
}
