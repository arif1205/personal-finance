import { db } from "@/lib/db";
import { amountSize, balanceDelta, balanceState, formatMoney, methodLabel, txLabel } from "@/lib/money";
import { formatDate, getTimeZone, requireUser } from "@/lib/session";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight, Pencil } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { RecordPayment } from "./record-payment";

type Props = { params: Promise<{ id: string }>; searchParams: Promise<{ all?: string }> };

const PAGE = 30;
const headline = { owed: "Owes you", owe: "You owe them", settled: "All settled" } as const;
const tone = { owed: "text-owed", owe: "text-owe", settled: "text-muted-foreground" } as const;

async function getLoan(id: string) {
	const user = await requireUser();
	const loan = await db.loan.findFirst({
		where: { id, userId: user.id },
		include: { transactions: { orderBy: [{ date: "asc" }, { createdAt: "asc" }] } },
	});
	if (!loan) notFound();
	return { user, loan };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
	const { loan } = await getLoan((await params).id);
	return { title: loan.title };
}

export default async function LoanPage({ params, searchParams }: Props) {
	const [{ user, loan }, { all }, tz] = await Promise.all([params.then((p) => getLoan(p.id)), searchParams, getTimeZone()]);
	const state = balanceState(loan.balance);

	let running = 0;
	const history = loan.transactions
		.map((t) => ({ ...t, after: (running += balanceDelta(t.type, t.amount)) }))
		.reverse();
	const shown = all ? history : history.slice(0, PAGE);

	const months: { label: string; items: typeof shown }[] = [];
	for (const t of shown) {
		const label = formatDate(t.date, tz, { month: "long", year: "numeric" });
		if (months.at(-1)?.label !== label) months.push({ label, items: [] });
		months.at(-1)!.items.push(t);
	}

	return (
		<div className='space-y-10'>
			<div>
				<Link href='/loans' className='-ml-2 inline-flex h-11 items-center gap-1 rounded-md px-2 text-[15px] font-medium text-muted-foreground hover:text-foreground'>
					<ChevronLeft aria-hidden className='size-5' />
					Loans
				</Link>
				<div className='mt-2 flex items-start justify-between gap-3'>
					<h1 className={cn("min-w-0 break-words font-semibold leading-tight tracking-tight", loan.title.length > 50 ? "text-xl sm:text-2xl" : "text-3xl")}>{loan.title}</h1>
					<Link
						href={`/loans/${loan.id}/edit`}
						aria-label='Edit loan name, note or delete loan'
						className='flex size-11 shrink-0 items-center justify-center rounded-lg border border-input/60 bg-card text-muted-foreground hover:text-foreground'>
						<Pencil aria-hidden className='size-[18px]' />
					</Link>
				</div>
				{loan.description && <p className='mt-2 line-clamp-4 whitespace-pre-line break-words leading-relaxed text-muted-foreground'>{loan.description}</p>}

				<div className='mt-6'>
					<p className='text-lg'>{headline[state]}</p>
					<p className={cn("money font-semibold tracking-tight", amountSize(formatMoney(loan.balance, user.currency)), tone[state])}>
						{formatMoney(loan.balance, user.currency)}
					</p>
				</div>
			</div>

			<RecordPayment loanId={loan.id} name={loan.title} balance={loan.balance} currency={user.currency} lastMethod={loan.transactions.at(-1)?.method} />

			<section aria-labelledby='history' className='space-y-4'>
				<h2 id='history' className='text-xl font-semibold'>
					History <span className='money font-normal text-muted-foreground'>({history.length})</span>
				</h2>
				{history.length === 0 ? (
					<p className='rounded-xl border border-dashed px-6 py-8 text-center text-muted-foreground'>No payments yet. Record the first one above.</p>
				) : (
					months.map((month) => (
						<div key={month.label}>
							<h3 className='mb-2 text-sm font-medium text-muted-foreground'>{month.label}</h3>
							<ul className='divide-y overflow-hidden rounded-xl border bg-card'>
								{month.items.map((t) => (
									<li key={t.id}>
										<Link
											href={`/loans/${loan.id}/payments/${t.id}`}
											className='flex items-start gap-3 px-4 py-3.5 transition-colors hover:bg-muted/60 active:bg-muted'>
											<div className='min-w-0 flex-1'>
												<p className='font-medium'>
													{txLabel[t.type]}{" "}
													<span className='money'>{formatMoney(t.amount, user.currency)}</span>
												</p>
												<p className='mt-0.5 text-sm text-muted-foreground'>
													{formatDate(t.date, tz, { day: "numeric", month: "short" })}, {methodLabel[t.method]}
													{t.methodDetails && ` (${t.methodDetails})`}
												</p>
												{t.description && <p className='mt-1 line-clamp-2 break-words text-sm'>{t.description}</p>}
												{t.transactionId && <p className='mt-0.5 break-words text-sm text-muted-foreground'>Ref {t.transactionId}</p>}
											</div>
											<div className='shrink-0 text-right'>
												<p className='text-xs text-muted-foreground'>Balance after</p>
												<p className={cn("money text-sm font-medium", tone[balanceState(t.after)])}>
													{balanceState(t.after) === "settled" ? "Settled" : formatMoney(t.after, user.currency)}
												</p>
											</div>
											<ChevronRight aria-hidden className='mt-2 size-5 shrink-0 text-muted-foreground/70' />
										</Link>
									</li>
								))}
							</ul>
						</div>
					))
				)}
				{!all && history.length > PAGE && (
					<Link href={`/loans/${loan.id}?all=1#history`} scroll={false} className='flex h-12 items-center justify-center rounded-lg border border-input/60 bg-card font-medium hover:bg-muted'>
						Show all {history.length} payments
					</Link>
				)}
			</section>
		</div>
	);
}
