import { authedRoute, NotFoundError } from "@/lib/api";
import { db } from "@/lib/db";
import { balanceDelta, fromDateInput } from "@/lib/money";
import { transactionSchema } from "@/lib/validations/loans";
import type { Prisma } from "@prisma/client";

type Params = { id: string; txId: string };

async function ownedTransaction(tx: Prisma.TransactionClient, { id, txId }: Params, userId: string) {
	const found = await tx.transaction.findFirst({ where: { id: txId, loanId: id, loan: { userId } } });
	if (!found) throw new NotFoundError("This payment no longer exists.");
	return found;
}

// Balance changes by (new effect − old effect) so it stays equal to the sum of payments.
export const PATCH = authedRoute<Params>(async ({ userId, req, params }) => {
	const input = transactionSchema.parse(await req.json());
	await db.$transaction(async (tx) => {
		const old = await ownedTransaction(tx, params, userId);
		await tx.transaction.update({ where: { id: old.id }, data: { ...input, date: fromDateInput(input.date) } });
		await tx.loan.update({
			where: { id: params.id },
			data: { balance: { increment: balanceDelta(input.type, input.amount) - balanceDelta(old.type, old.amount) } },
		});
	});
});

export const DELETE = authedRoute<Params>(async ({ userId, params }) => {
	await db.$transaction(async (tx) => {
		const old = await ownedTransaction(tx, params, userId);
		await tx.transaction.delete({ where: { id: old.id } });
		await tx.loan.update({ where: { id: params.id }, data: { balance: { increment: -balanceDelta(old.type, old.amount) } } });
	});
});
