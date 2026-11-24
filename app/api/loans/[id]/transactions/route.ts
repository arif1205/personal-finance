import { authedRoute, NotFoundError } from "@/lib/api";
import { db } from "@/lib/db";
import { balanceDelta, fromDateInput } from "@/lib/money";
import { transactionSchema } from "@/lib/validations/loans";

export const POST = authedRoute<{ id: string }>(async ({ userId, req, params }) => {
	const tx = transactionSchema.parse(await req.json());
	return db.$transaction(async (db) => {
		const loan = await db.loan.findFirst({ where: { id: params.id, userId }, select: { id: true } });
		if (!loan) throw new NotFoundError("This loan no longer exists.");
		await db.transaction.create({ data: { ...tx, date: fromDateInput(tx.date), loanId: loan.id } });
		const updated = await db.loan.update({
			where: { id: loan.id },
			data: { balance: { increment: balanceDelta(tx.type, tx.amount) } },
			select: { balance: true },
		});
		return { balance: updated.balance };
	});
});
