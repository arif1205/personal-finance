import { authedRoute } from "@/lib/api";
import { db } from "@/lib/db";
import { balanceDelta, fromDateInput } from "@/lib/money";
import { createLoanSchema } from "@/lib/validations/loans";

export const POST = authedRoute(async ({ userId, req }) => {
	const { title, description, transaction } = createLoanSchema.parse(await req.json());
	const loan = await db.loan.create({
		data: {
			title,
			description,
			userId,
			balance: balanceDelta(transaction.type, transaction.amount),
			transactions: { create: { ...transaction, date: fromDateInput(transaction.date) } },
		},
		select: { id: true },
	});
	return { id: loan.id };
});
