import { TransactionType } from "@prisma/client";
import { TransactionMethod } from "@prisma/client";
import { z } from "zod";

export const transactionSchema = z.object({
	amount: z.number().positive(),
	type: z.nativeEnum(TransactionType),
	date: z.string().datetime(),
	description: z.string().optional().nullable(),
	method: z.nativeEnum(TransactionMethod),
	methodDetails: z.string().optional().nullable(),
	transactionId: z.string().optional().nullable(),
});

export type TransactionFormValues = z.infer<typeof transactionSchema>;
