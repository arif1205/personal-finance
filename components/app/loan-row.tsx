import { balanceState, formatMoney, shortBalanceLabel } from "@/lib/money";
import { cn } from "@/lib/utils";
import type { Currency } from "@prisma/client";
import { ChevronRight } from "lucide-react";
import Link from "next/link";

const tone = { owed: "text-owed", owe: "text-owe", settled: "text-muted-foreground" } as const;

export function LoanRow({ id, title, balance, activity, currency }: { id: string; title: string; balance: number; activity: string; currency: Currency }) {
	const state = balanceState(balance);
	return (
		<li>
			<Link href={`/loans/${id}`} className='flex min-h-[4.5rem] items-center gap-3 px-4 py-3 transition-colors hover:bg-muted/60 active:bg-muted'>
				<div className='min-w-0 flex-1'>
					<p className='line-clamp-2 break-words font-medium leading-snug'>{title}</p>
					<p className='mt-0.5 text-sm text-muted-foreground'>{activity}</p>
				</div>
				<div className='shrink-0 text-right'>
					<p className={cn("money font-semibold", tone[state])}>{state === "settled" ? "Settled" : formatMoney(balance, currency)}</p>
					{state !== "settled" && <p className='text-sm text-muted-foreground'>{shortBalanceLabel[state]}</p>}
				</div>
				<ChevronRight aria-hidden className='size-5 shrink-0 text-muted-foreground/70' />
			</Link>
		</li>
	);
}

export function LoanList({ children, label }: { children: React.ReactNode; label: string }) {
	return (
		<ul aria-label={label} className='divide-y overflow-hidden rounded-xl border bg-card'>
			{children}
		</ul>
	);
}
