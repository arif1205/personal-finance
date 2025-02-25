"use client";

import { LoanSummaryCard } from "@/components/dashboard/loan-summary-card";
import { api } from "@/lib/fetch-wrapper";
import Link from "next/link";
import { useEffect, useState } from "react";

interface Loan {
	id: string;
	title: string;
	currentBalance: number;
	lastTransaction?: {
		date: string;
		amount: number;
	};
}

export default function DashboardPage() {
	const [recentLoans, setRecentLoans] = useState<Loan[]>([]);
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		const fetchRecentLoans = async () => {
			try {
				// const response = await api.get("/loans/recent");
				// if (response.success) {
				// 	setRecentLoans(response.data.loans);
				// }

				setRecentLoans([
					{
						id: "1",
						title: "Loan 1",
						currentBalance: 1000,
					},
					{
						id: "2",
						title: "Loan 2",
						currentBalance: -2000,
					},
					{
						id: "3",
						title: "Loan 3",
						currentBalance: 3000,
					},
				]);
			} catch (error) {
				console.error("Failed to fetch recent loans:", error);
			} finally {
				setIsLoading(false);
			}
		};

		fetchRecentLoans();
	}, []);

	return (
		<div className='space-y-6'>
			<div className='flex flex-1 flex-col gap-4 p-4'>
				<h2 className='text-lg font-semibold'>Recent Loans</h2>
				<div className='grid auto-rows-min gap-4 md:grid-cols-4 lg:grid-cols-5'>
					{isLoading ? (
						// Loading skeletons
						Array(3)
							.fill(0)
							.map((_, i) => (
								<div
									key={i}
									className='aspect-video animate-pulse rounded-xl bg-muted/50'
								/>
							))
					) : recentLoans.length > 0 ? (
						// Show recent loans
						recentLoans.map((loan) => (
							<Link href={`/loans/${loan.id}`} key={loan.id}>
								<LoanSummaryCard
									title={loan.title}
									amount={loan.currentBalance}
									lastTransaction={loan.lastTransaction}
								/>
							</Link>
						))
					) : (
						// No loans placeholder
						<div className='col-span-3 flex aspect-video items-center justify-center rounded-xl bg-muted/50'>
							<p className='text-muted-foreground'>No recent loan activity</p>
						</div>
					)}
				</div>
				<div className='min-h-[50vh] flex-1 rounded-xl bg-muted/100 md:min-h-min' />
			</div>
		</div>
	);
}
