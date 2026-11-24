"use client";

import { LoanList, LoanRow } from "@/components/app/loan-row";
import { Input } from "@/components/ui/field";
import type { LoanListItem } from "@/lib/loans";
import { balanceState, type BalanceState } from "@/lib/money";
import type { Currency } from "@prisma/client";
import { Search } from "lucide-react";
import { useMemo, useState } from "react";

const filters: { value: BalanceState | "all"; label: string }[] = [
	{ value: "all", label: "All" },
	{ value: "owed", label: "Owe you" },
	{ value: "owe", label: "You owe" },
	{ value: "settled", label: "Settled" },
];

export function LoanBrowser({ loans, currency }: { loans: LoanListItem[]; currency: Currency }) {
	const [query, setQuery] = useState("");
	const [filter, setFilter] = useState<BalanceState | "all">("all");

	const counts = useMemo(() => {
		const c = { all: loans.length, owed: 0, owe: 0, settled: 0 };
		loans.forEach((l) => c[balanceState(l.balance)]++);
		return c;
	}, [loans]);

	const q = query.trim().toLocaleLowerCase();
	const shown = loans.filter((l) => (filter === "all" || balanceState(l.balance) === filter) && (!q || l.title.toLocaleLowerCase().includes(q)));

	return (
		<div className='space-y-4'>
			<div className='relative'>
				<label htmlFor='loan-search' className='sr-only'>
					Search loans by name
				</label>
				<Search aria-hidden className='pointer-events-none absolute left-3.5 top-1/2 size-5 -translate-y-1/2 text-muted-foreground' />
				<Input id='loan-search' type='search' placeholder='Search by name' value={query} onChange={(e) => setQuery(e.target.value)} className='pl-11' autoComplete='off' />
			</div>

			<fieldset>
				<legend className='sr-only'>Show</legend>
				<div className='grid grid-cols-4 gap-1 rounded-xl bg-muted p-1'>
					{filters.map((f) => (
						<label
							key={f.value}
							className='flex min-h-12 cursor-pointer flex-col items-center justify-center rounded-lg px-1 py-1.5 text-center text-sm font-medium leading-tight text-muted-foreground transition-colors has-[:checked]:bg-card has-[:checked]:text-foreground has-[:checked]:shadow-sm has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ring sm:flex-row sm:gap-1.5 sm:text-[15px]'>
							<input type='radio' name='filter' value={f.value} checked={filter === f.value} onChange={() => setFilter(f.value)} className='sr-only' />
							{f.label}
							<span className='money text-xs font-normal sm:text-sm'>{counts[f.value]}</span>
						</label>
					))}
				</div>
			</fieldset>

			<p aria-live='polite' className='sr-only'>
				{shown.length} {shown.length === 1 ? "loan" : "loans"} shown
			</p>

			{shown.length > 0 ? (
				<LoanList label='Loans'>
					{shown.map((loan) => (
						<LoanRow key={loan.id} {...loan} currency={currency} />
					))}
				</LoanList>
			) : (
				<div className='rounded-xl border border-dashed px-6 py-10 text-center'>
					<p className='font-medium'>No loans match</p>
					<p className='mt-1 text-muted-foreground'>{q ? "Try a shorter name, or clear the search." : "Nothing in this group yet."}</p>
				</div>
			)}
		</div>
	);
}
