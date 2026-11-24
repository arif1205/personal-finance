import { LoanList, LoanRow } from "@/components/app/loan-row";
import { Button } from "@/components/ui/button";
import { listLoans } from "@/lib/loans";
import { amountSize, balanceState, formatMoney } from "@/lib/money";
import { cn } from "@/lib/utils";
import { requireUser } from "@/lib/session";
import Link from "next/link";

export default async function HomePage() {
	const user = await requireUser();
	const loans = await listLoans(user.id);
	const open = loans.filter((l) => balanceState(l.balance) !== "settled");
	const owedToYou = open.filter((l) => l.balance > 0).reduce((s, l) => s + l.balance, 0);
	const youOwe = open.filter((l) => l.balance < 0).reduce((s, l) => s - l.balance, 0);

	if (loans.length === 0) {
		return (
			<section className='py-10'>
				<h1 className='text-3xl font-semibold tracking-tight'>Nothing to track yet</h1>
				<p className='mt-3 max-w-md text-lg leading-relaxed text-muted-foreground'>
					Add a loan when you lend money to someone or borrow from them. Each payment after that updates what is left.
				</p>
				<Button asChild className='mt-8 w-full sm:w-auto'>
					<Link href='/loans/new'>Add your first loan</Link>
				</Button>
			</section>
		);
	}

	return (
		<div className='space-y-10'>
			<section aria-labelledby='totals'>
				<h1 id='totals' className='sr-only'>
					Overview
				</h1>
				<p className='text-[15px] text-muted-foreground'>{open.length === 0 ? "Every loan is settled" : `${open.length} open ${open.length === 1 ? "loan" : "loans"}`}</p>
				<dl className='mt-3 space-y-3'>
					<div>
						<dt className='text-lg'>People owe you</dt>
						<dd className={cn("money font-semibold tracking-tight text-owed", amountSize(formatMoney(owedToYou, user.currency)))}>{formatMoney(owedToYou, user.currency)}</dd>
					</div>
					<div>
						<dt className='text-lg'>You owe</dt>
						<dd className={cn("money font-semibold tracking-tight text-owe", amountSize(formatMoney(youOwe, user.currency)))}>{formatMoney(youOwe, user.currency)}</dd>
					</div>
				</dl>
			</section>

			<section aria-labelledby='recent' className='space-y-3'>
				<div className='flex items-baseline justify-between gap-4'>
					<h2 id='recent' className='text-xl font-semibold'>
						Recent activity
					</h2>
					<Link href='/loans' className='rounded-md py-2 text-[15px] font-medium text-primary underline-offset-4 hover:underline'>
						All loans ({loans.length})
					</Link>
				</div>
				<p className='text-[15px] text-muted-foreground'>Choose a loan to record a payment.</p>
				<LoanList label='Recently updated loans'>
					{loans.slice(0, 5).map((loan) => (
						<LoanRow key={loan.id} {...loan} currency={user.currency} />
					))}
				</LoanList>
			</section>
		</div>
	);
}
