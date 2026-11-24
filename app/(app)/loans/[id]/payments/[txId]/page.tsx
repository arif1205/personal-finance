import { db } from "@/lib/db";
import { getTimeZone, requireUser } from "@/lib/session";
import { ChevronLeft } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { EditPayment } from "./edit-payment";

export const metadata: Metadata = { title: "Edit payment" };

export default async function EditPaymentPage({ params }: { params: Promise<{ id: string; txId: string }> }) {
	const { id, txId } = await params;
	const [user, tz] = await Promise.all([requireUser(), getTimeZone()]);
	const tx = await db.transaction.findFirst({
		where: { id: txId, loanId: id, loan: { userId: user.id } },
		include: { loan: { select: { title: true } } },
	});
	if (!tx) notFound();

	return (
		<div className='space-y-6'>
			<div>
				<Link href={`/loans/${id}`} className='-ml-2 inline-flex h-11 max-w-full items-center gap-1 rounded-md px-2 text-[15px] font-medium text-muted-foreground hover:text-foreground'>
					<ChevronLeft aria-hidden className='size-5 shrink-0' />
					<span className='truncate'>{tx.loan.title}</span>
				</Link>
				<h1 className='mt-2 text-3xl font-semibold tracking-tight'>Edit payment</h1>
			</div>
			<EditPayment
				loanId={id}
				txId={tx.id}
				currency={user.currency}
				initial={{
					type: tx.type,
					amount: String(tx.amount),
					date: new Intl.DateTimeFormat("en-CA", { timeZone: tz }).format(tx.date),
					method: tx.method,
					description: tx.description ?? "",
					methodDetails: tx.methodDetails ?? "",
					transactionId: tx.transactionId ?? "",
				}}
			/>
		</div>
	);
}
