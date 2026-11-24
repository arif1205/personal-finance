import { requireUser } from "@/lib/session";
import type { Metadata } from "next";
import { NewLoanForm } from "./new-loan-form";

export const metadata: Metadata = { title: "New loan" };

export default async function NewLoanPage() {
	const user = await requireUser();
	return (
		<div className='space-y-6'>
			<div>
				<h1 className='text-3xl font-semibold tracking-tight'>New loan</h1>
				<p className='mt-2 text-muted-foreground'>Start with the first payment. You can record more later.</p>
			</div>
			<NewLoanForm currency={user.currency} />
		</div>
	);
}
