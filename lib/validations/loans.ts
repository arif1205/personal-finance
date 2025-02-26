import { z } from "zod";

export const createLoanSchema = z.object({
	title: z.string().min(1, "Title is required").max(255, "Title is too long"),
	description: z.string().optional(),
	initialBalance: z.number().min(0, "Initial balance must be positive"),
	type: z.enum(["LEND", "BORROW"], {
		required_error: "Please select whether you're lending or borrowing",
	}),
	transactionDetails: z.object({
		date: z.string().min(1, "Transaction date is required"),
		method: z.enum([
			"CASH",
			"BANK_TRANSFER",
			"CHECK",
			"CREDIT_CARD",
			"DEBIT_CARD",
			"MOBILE_BANKING",
			"OTHER",
		]),
		methodDetails: z.string().optional(),
		transactionId: z.string().optional(),
	}),
});

export type CreateLoanFormValues = z.infer<typeof createLoanSchema>;
