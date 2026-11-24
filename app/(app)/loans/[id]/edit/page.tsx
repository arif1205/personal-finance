import { db } from "@/lib/db";
import { requireUser } from "@/lib/session";
import { ChevronLeft } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { EditLoanForm } from "./edit-loan-form";

export const metadata: Metadata = { title: "Edit loan" };

export default async function EditLoanPage({ params }: { params: Promise<{ id: string }> }) {
	const { id } = await params;
	const user = await requireUser();
	const loan = await db.loan.findFirst({
		where: { id, userId: user.id },
		select: { id: true, title: true, description: true, balance: true, _count: { select: { transactions: true } } },
	});
	if (!loan) notFound();

	return (
		<div className='space-y-6'>
			<div>
				<Link href={`/loans/${id}`} className='-ml-2 inline-flex h-11 max-w-full items-center gap-1 rounded-md px-2 text-[15px] font-medium text-muted-foreground hover:text-foreground'>
					<ChevronLeft aria-hidden className='size-5 shrink-0' />
					<span className='truncate'>{loan.title}</span>
				</Link>
				<h1 className='mt-2 text-3xl font-semibold tracking-tight'>Edit loan</h1>
			</div>
			<EditLoanForm loan={{ id: loan.id, title: loan.title, description: loan.description ?? "", balance: loan.balance, payments: loan._count.transactions }} currency={user.currency} />
		</div>
	);
}
