"use client";

import { Field, Input, Select, Textarea } from "@/components/ui/field";
import { methodLabel, parseAmount, toDateInput } from "@/lib/money";
import { cn } from "@/lib/utils";
import type { Currency, TransactionMethod, TransactionType } from "@prisma/client";
import { ChevronDown } from "lucide-react";
import { useState } from "react";

export type PaymentValues = {
	type: TransactionType;
	amount: string;
	date: string;
	method: TransactionMethod;
	description: string;
	methodDetails: string;
	transactionId: string;
};

type Errors = Partial<Record<keyof PaymentValues, string>>;

export function usePaymentForm(initial: Partial<PaymentValues> & { type: TransactionType }) {
	const blank: PaymentValues = { amount: "", date: toDateInput(new Date()), method: "CASH", description: "", methodDetails: "", transactionId: "", ...initial };
	const [values, setValues] = useState(blank);
	const [errors, setErrors] = useState<Errors>({});

	const set = <K extends keyof PaymentValues>(key: K, value: PaymentValues[K]) => {
		setValues((v) => ({ ...v, [key]: value }));
		setErrors((e) => ({ ...e, [key]: undefined }));
	};

	const amount = parseAmount(values.amount);

	/** Returns the API payload, or null after showing errors. */
	const validate = () => {
		const next: Errors = {};
		if (typeof amount === "string") next.amount = amount;
		if (!values.date) next.date = "Pick a date.";
		setErrors(next);
		if (Object.keys(next).length) {
			document.getElementById(`pay-${Object.keys(next)[0]}`)?.focus();
			return null;
		}
		return { ...values, amount: amount as number };
	};

	return { values, errors, set, amount: typeof amount === "number" ? amount : null, validate, reset: () => setValues({ ...blank, type: values.type }) };
}

export function currencySymbol(currency: Currency) {
	return new Intl.NumberFormat("en", { style: "currency", currency, currencyDisplay: "narrowSymbol" }).formatToParts(0).find((p) => p.type === "currency")?.value ?? currency;
}

interface PaymentFieldsProps {
	form: ReturnType<typeof usePaymentForm>;
	currency: Currency;
	typeLegend: string;
	typeOptions: { value: TransactionType; label: string }[];
	amountExtra?: React.ReactNode;
	disabled?: boolean;
}

export function PaymentFields({ form, currency, typeLegend, typeOptions, amountExtra, disabled }: PaymentFieldsProps) {
	const { values, errors, set } = form;
	const [moreOpen, setMoreOpen] = useState(Boolean(values.description || values.methodDetails || values.transactionId));
	const symbol = currencySymbol(currency);

	return (
		<div className='space-y-5'>
			<fieldset disabled={disabled}>
				<legend className='mb-2 text-[15px] font-medium'>{typeLegend}</legend>
				<div className='grid grid-cols-2 gap-1 rounded-xl bg-muted p-1'>
					{typeOptions.map((o) => (
						<label
							key={o.value}
							className='flex min-h-12 cursor-pointer items-center justify-center rounded-lg px-2 text-center text-[15px] font-medium leading-tight text-muted-foreground transition-colors has-[:checked]:bg-card has-[:checked]:text-foreground has-[:checked]:shadow-sm has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ring'>
							<input type='radio' name='pay-type' value={o.value} checked={values.type === o.value} onChange={() => set("type", o.value)} className='sr-only' />
							{o.label}
						</label>
					))}
				</div>
			</fieldset>

			<Field id='pay-amount' label='Amount' error={errors.amount}>
				{(a11y) => (
					<div className='relative'>
						<span aria-hidden className='pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-xl text-muted-foreground'>
							{symbol}
						</span>
						<Input
							{...a11y}
							inputMode='decimal'
							autoComplete='off'
							enterKeyHint='done'
							placeholder='0'
							value={values.amount}
							disabled={disabled}
							onChange={(e) => set("amount", e.target.value)}
							className='money h-14 pl-11 text-2xl font-semibold'
						/>
					</div>
				)}
			</Field>
			{amountExtra}

			<div className='grid grid-cols-2 gap-3'>
				<Field id='pay-date' label='Date' error={errors.date}>
					{(a11y) => <Input {...a11y} type='date' value={values.date} max='2100-12-31' disabled={disabled} onChange={(e) => set("date", e.target.value)} className='min-w-0' />}
				</Field>
				<Field id='pay-method' label='Paid by'>
					{(a11y) => (
						<Select {...a11y} value={values.method} disabled={disabled} onChange={(e) => set("method", e.target.value as TransactionMethod)}>
							{Object.entries(methodLabel).map(([value, label]) => (
								<option key={value} value={value}>
									{label}
								</option>
							))}
						</Select>
					)}
				</Field>
			</div>

			<div>
				<button
					type='button'
					aria-expanded={moreOpen}
					aria-controls='pay-more'
					onClick={() => setMoreOpen((o) => !o)}
					className='flex h-11 items-center gap-1.5 rounded-md text-[15px] font-medium text-primary'>
					<ChevronDown aria-hidden className={cn("size-[18px] transition-transform", moreOpen && "rotate-180")} />
					{moreOpen ? "Hide note and reference" : "Add a note or reference"}
				</button>
				<div id='pay-more' hidden={!moreOpen} className='space-y-4 pt-2'>
					<Field id='pay-description' label='Note' optional error={errors.description}>
						{(a11y) => <Textarea {...a11y} maxLength={500} value={values.description} disabled={disabled} onChange={(e) => set("description", e.target.value)} placeholder='What was it for?' />}
					</Field>
					<Field id='pay-methodDetails' label='Account or wallet' optional hint='For example, City Bank or bKash.'>
						{(a11y) => <Input {...a11y} maxLength={200} value={values.methodDetails} disabled={disabled} onChange={(e) => set("methodDetails", e.target.value)} />}
					</Field>
					<Field id='pay-transactionId' label='Reference number' optional hint='Cheque number or transaction ID.'>
						{(a11y) => <Input {...a11y} maxLength={100} value={values.transactionId} disabled={disabled} onChange={(e) => set("transactionId", e.target.value)} />}
					</Field>
				</div>
			</div>
		</div>
	);
}
