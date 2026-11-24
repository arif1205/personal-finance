import { db } from "./db";
import { formatDate, getTimeZone } from "./session";

export type LoanListItem = { id: string; title: string; balance: number; activity: string };

/** Loans newest-activity first, with a ready-to-show "last activity" line. */
export async function listLoans(userId: string): Promise<LoanListItem[]> {
	const [loans, tz] = await Promise.all([
		db.loan.findMany({
			where: { userId },
			orderBy: { updatedAt: "desc" },
			select: {
				id: true,
				title: true,
				balance: true,
				transactions: { orderBy: { date: "desc" }, take: 1, select: { date: true } },
			},
		}),
		getTimeZone(),
	]);
	return loans.map(({ transactions, ...loan }) => ({
		...loan,
		activity: transactions[0] ? `Last payment ${formatDate(transactions[0].date, tz)}` : "No payments yet",
	}));
}
