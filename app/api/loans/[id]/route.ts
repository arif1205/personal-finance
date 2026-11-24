import { authedRoute, NotFoundError } from "@/lib/api";
import { db } from "@/lib/db";
import { loanSchema } from "@/lib/validations/loans";

type Params = { id: string };

async function ownedLoan(id: string, userId: string) {
	const loan = await db.loan.findFirst({ where: { id, userId }, select: { id: true } });
	if (!loan) throw new NotFoundError("This loan no longer exists.");
	return loan;
}

export const PATCH = authedRoute<Params>(async ({ userId, req, params }) => {
	const data = loanSchema.parse(await req.json());
	await ownedLoan(params.id, userId);
	await db.loan.update({ where: { id: params.id }, data });
	return { id: params.id };
});

export const DELETE = authedRoute<Params>(async ({ userId, params }) => {
	await ownedLoan(params.id, userId);
	await db.loan.delete({ where: { id: params.id } });
});
