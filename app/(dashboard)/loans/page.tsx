"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/fetch-wrapper";
import { LoanStatus, TransactionType } from "@prisma/client";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { PlusIcon } from "lucide-react";
import Link from "next/link";
import { LoanSummaryCard } from "@/components/dashboard/loan-summary-card";
import { Loan } from "@/types";

interface LoansResponse {
	success: boolean;
	data: {
		loans: Loan[];
	};
}

export default function LoansPage() {
	const [loans, setLoans] = useState<Loan[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		const fetchLoans = async () => {
			try {
				setIsLoading(true);
				const response = await api.get<LoansResponse>("/loans");
				if (response.success) {
					setLoans(response.data.loans);
				}
			} catch (err) {
				setError("Failed to fetch loans");
				console.error("Error fetching loans:", err);
			} finally {
				setIsLoading(false);
			}
		};

		fetchLoans();
	}, []);

	if (isLoading) {
		return (
			<div className='container py-8'>
				<div className='grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4'>
					{Array(6)
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
						))}
				</div>
			</div>
		);
	}

	if (error) {
		return (
			<div className='container py-8'>
				<Card className='bg-destructive/10'>
					<CardHeader>
						<CardTitle className='text-destructive'>Error</CardTitle>
						<CardDescription>{error}</CardDescription>
					</CardHeader>
				</Card>
			</div>
		);
	}

	return (
		<div className='container'>
			<div className='flex items-center justify-between mb-4'>
				<h1 className='text-xl font-bold'>Loans</h1>
				<Button asChild>
					<Link href='/loans/create'>
						<PlusIcon className='w-4 h-4 mr-2' />
						New Loan
					</Link>
				</Button>
			</div>

			{loans.length === 0 ? (
				<Card>
					<CardHeader>
						<CardTitle>No loans found</CardTitle>
						<CardDescription>
							Create your first loan to start tracking your lending and
							borrowing.
						</CardDescription>
					</CardHeader>
				</Card>
			) : (
				<div className='grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4'>
					{loans.map((loan) => (
						<Link key={loan.id} href={`/loans/${loan.title}`}>
							<LoanSummaryCard
								title={loan.title}
								balance={loan.balance}
								createdAt={loan.createdAt}
								lastTransaction={loan.transactions[0]}
								currency={loan.user?.currency || "BDT"}
							/>
						</Link>
					))}
				</div>
			)}
		</div>
	);
}
