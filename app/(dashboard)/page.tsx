"use client";

import { LoanSummaryCard } from "@/components/dashboard/loan-summary-card";
import { Button } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/card";
import { api } from "@/lib/fetch-wrapper";
import { Loan } from "@/types";
import { ArrowRightIcon } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

interface RecentLoansResponse {
	success: boolean;
	data: {
		loans: Loan[];
	};
}

export default function DashboardPage() {
	const [loans, setLoans] = useState<Loan[]>([]);
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		const fetchRecentLoans = async () => {
			try {
				setIsLoading(true);
				const response = await api.get<RecentLoansResponse>("/loans/recent");
				if (response.success) {
					setLoans(response.data.loans);
				}
			} catch (error) {
				console.error(error);
			} finally {
				setIsLoading(false);
			}
		};

		fetchRecentLoans();
	}, []);

	return (
		<div className='space-y-6'>
			<div className='space-y-4'>
				<div className='flex items-center justify-between'>
					<h2 className='text-xl font-bold'>Recent Loans</h2>
					{loans.length > 0 && (
						<Button variant='ghost' asChild>
							<Link href='/loans' className='flex items-center gap-2'>
								View all
								<ArrowRightIcon className='h-4 w-4' />
							</Link>
						</Button>
					)}
				</div>

				<div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
					{isLoading ? (
						Array(4)
							.fill(0)
							.map((_, i) => (
								<Card key={i} className='animate-pulse'>
									<CardHeader className='space-y-2'>
										<div className='h-4 w-1/2 rounded bg-muted'></div>
										<div className='h-3 w-1/3 rounded bg-muted'></div>
									</CardHeader>
									<div className='p-6'>
										<div className='h-8 w-3/4 rounded bg-muted'></div>
									</div>
								</Card>
							))
					) : loans.length > 0 ? (
						loans.map((loan) => (
							<Link key={loan.id} href={`/loans/${loan.title}`}>
								<LoanSummaryCard
									title={loan.title}
									balance={loan.balance}
									createdAt={loan.createdAt}
									lastTransaction={loan.transactions[0]}
									currency={loan.user?.currency || "BDT"}
								/>
							</Link>
						))
					) : (
						<div className='col-span-full flex w-full items-center justify-center rounded-xl bg-muted/50 py-8'>
							<p className='text-muted-foreground'>No recent loan activity</p>
						</div>
					)}
				</div>
			</div>
		</div>
	);
}
