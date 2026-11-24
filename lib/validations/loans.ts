import { TransactionMethod, TransactionType } from "@prisma/client";
import { z } from "zod";
import { MAX_AMOUNT } from "@/lib/money";

const optionalText = (max: number) =>
	z
		.string()
		.trim()
		.max(max, `Keep this under ${max} characters.`)
		.optional()
		.nullable()
		.transform((v) => v || null);

export const transactionSchema = z.object({
	amount: z
		.number({ invalid_type_error: "Enter an amount." })
		.positive("Amount must be more than zero.")
		.lt(MAX_AMOUNT, "That amount is too large.")
		.refine((v) => Math.abs(v * 100 - Math.round(v * 100)) < 1e-6, "Use up to 2 decimals."),
	type: z.nativeEnum(TransactionType),
	date: z
		.string()
		.regex(/^\d{4}-\d{2}-\d{2}$/, "Pick a date.")
		.refine((v) => !Number.isNaN(Date.parse(v)), "Pick a valid date."),
	method: z.nativeEnum(TransactionMethod),
	description: optionalText(500),
	methodDetails: optionalText(200),
	transactionId: optionalText(100),
});

export const loanSchema = z.object({
	title: z.string().trim().min(1, "Enter a name.").max(200, "Keep the name under 200 characters."),
	description: optionalText(1000),
});

export const createLoanSchema = loanSchema.extend({ transaction: transactionSchema });

export type TransactionInput = z.input<typeof transactionSchema>;
