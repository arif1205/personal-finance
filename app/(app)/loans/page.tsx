import { Button } from "@/components/ui/button";
import { listLoans } from "@/lib/loans";
import { requireUser } from "@/lib/session";
import { Plus } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { LoanBrowser } from "./loan-browser";

export const metadata: Metadata = { title: "Loans" };

export default async function LoansPage() {
	const user = await requireUser();
	const loans = await listLoans(user.id);

	return (
		<div className='space-y-6'>
			<div className='flex items-center justify-between gap-4'>
				<h1 className='text-3xl font-semibold tracking-tight'>Loans</h1>
				<Button asChild size='sm' className='hidden md:inline-flex'>
					<Link href='/loans/new'>
						<Plus aria-hidden />
						New loan
					</Link>
				</Button>
			</div>
			{loans.length === 0 ? (
				<div className='rounded-xl border border-dashed bg-card px-6 py-10 text-center'>
					<p className='text-lg font-medium'>No loans yet</p>
					<p className='mt-1 text-muted-foreground'>Add one when you lend or borrow money.</p>
					<Button asChild className='mt-6'>
						<Link href='/loans/new'>Add a loan</Link>
					</Button>
				</div>
			) : (
				<LoanBrowser loans={loans} currency={user.currency} />
			)}
		</div>
	);
}
