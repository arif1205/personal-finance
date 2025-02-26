"use client";

import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { api } from "@/lib/fetch-wrapper";
import { LoanStatus, TransactionMethod, TransactionType } from "@prisma/client";
import { format } from "date-fns";
import {
	ArrowLeftIcon,
	ArrowUpIcon,
	ArrowDownIcon,
	PlusIcon,
} from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface Transaction {
	id: string;
	amount: number;
	type: TransactionType;
	date: string;
	description?: string | null;
	method: TransactionMethod;
	methodDetails?: string | null;
	transactionId?: string | null;
}

interface Loan {
	id: string;
	title: string;
	description: string | null;
	balance: number;
	status: LoanStatus;
	createdAt: string;
	updatedAt: string;
	transactions: Transaction[];
}

interface LoanResponse {
	success: boolean;
	data: {
		loan: Loan;
	};
}

export default function LoanDetailsPage() {
	const params = useParams();
	const router = useRouter();
	const [loan, setLoan] = useState<Loan | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		const fetchLoan = async () => {
			try {
				setIsLoading(true);

				const response = await api.get<LoanResponse>(`/loans/${params.title}`);
				if (response.success) {
					setLoan(response.data.loan);
				}
			} catch (error) {
				setError("Failed to fetch loan details");
			} finally {
				setIsLoading(false);
			}
		};

		if (params.title) {
			fetchLoan();
		}
	}, [params.title]);

	if (isLoading) {
		return (
			<div className='space-y-4'>
				<div className='h-8 w-32 animate-pulse rounded bg-muted' />
				<Card className='animate-pulse'>
					<CardHeader className='space-y-2'>
						<div className='h-6 w-1/4 rounded bg-muted' />
						<div className='h-4 w-1/3 rounded bg-muted' />
					</CardHeader>
					<CardContent className='space-y-4'>
						<div className='h-12 w-1/2 rounded bg-muted' />
						<div className='space-y-2'>
							{Array(3)
								.fill(0)
								.map((_, i) => (
									<div key={i} className='h-16 w-full rounded bg-muted' />
								))}
						</div>
					</CardContent>
				</Card>
			</div>
		);
	}

	if (error || !loan) {
		return (
			<div className='flex flex-col items-center justify-center gap-4 py-12'>
				<p className='text-lg text-muted-foreground'>
					{error || "Loan not found"}
				</p>
				<Button variant='outline' onClick={() => router.back()}>
					Go Back
				</Button>
			</div>
		);
	}

	return (
		<div className='space-y-6'>
			<div className='flex items-center justify-between'>
				<Button variant='ghost' asChild className='gap-2'>
					<Link href='/loans'>
						<ArrowLeftIcon className='h-4 w-4' />
						Back to Loans
					</Link>
				</Button>

				<Button asChild>
					<Link
						href={`/loans/${loan.title}/create-transaction`}
						className='gap-2'>
						<PlusIcon className='h-4 w-4' />
						Add Transaction
					</Link>
				</Button>
			</div>

			<Card>
				<CardHeader>
					<CardTitle>{loan.title}</CardTitle>
					{loan.description && (
						<CardDescription>{loan.description}</CardDescription>
					)}
				</CardHeader>

				<CardContent className='space-y-6'>
					<div className='flex flex-col gap-1'>
						<p className='text-sm text-muted-foreground'>Current Balance</p>
						<p
							className={`text-2xl font-semibold ${
								loan.balance > 0
									? "text-emerald-500"
									: loan.balance < 0
									? "text-red-500"
									: ""
							}`}>
							{loan.balance.toLocaleString("en-US", {
								style: "currency",
								currency: "BDT",
							})}
						</p>
						<p className='text-sm text-muted-foreground'>
							Created on {format(new Date(loan.createdAt), "PPP")}
						</p>
					</div>

					<div className='space-y-4'>
						<h3 className='font-semibold'>Transaction History</h3>
						{loan.transactions.length > 0 ? (
							<div className='space-y-3'>
								{loan.transactions.map((transaction) => (
									<div
										key={transaction.id}
										className='flex items-center justify-between rounded-lg border p-4'>
										<div className='flex items-center gap-3'>
											<div
												className={`rounded-full p-2 ${
													transaction.type === "CREDIT"
														? "bg-emerald-500/10 text-emerald-500"
														: "bg-red-500/10 text-red-500"
												}`}>
												{transaction.type === "CREDIT" ? (
													<ArrowUpIcon className='h-4 w-4' />
												) : (
													<ArrowDownIcon className='h-4 w-4' />
												)}
											</div>
											<div>
												<p className='font-medium'>
													{transaction.type === "CREDIT"
														? "Payment Given"
														: "Payment Received"}
												</p>
												<p className='text-sm text-muted-foreground'>
													via {transaction.method}
													{transaction.methodDetails &&
														` (${transaction.methodDetails})`}
												</p>
												{transaction.transactionId && (
													<p className='text-sm text-muted-foreground'>
														Transaction ID: {transaction.transactionId}
													</p>
												)}
												<p className='text-sm text-muted-foreground'>
													Date: {format(new Date(transaction.date), "PPP")}
												</p>
											</div>
										</div>
										<p
											className={`font-medium ${
												transaction.type === "CREDIT"
													? "text-emerald-500"
													: "text-red-500"
											}`}>
											{transaction.type === "CREDIT" ? "+" : "-"}{" "}
											{transaction.amount.toLocaleString("en-US", {
												style: "currency",
												currency: "BDT",
											})}
										</p>
									</div>
								))}
							</div>
						) : (
							<p className='text-center text-muted-foreground py-8'>
								No transactions yet
							</p>
						)}
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
