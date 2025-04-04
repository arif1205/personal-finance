"use client";

import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { DeleteAlert } from "@/components/ui/delete-alert";
import { api } from "@/lib/fetch-wrapper";
import { Loan, LoanResponse } from "@/types";
import { format } from "date-fns";
import {
	ArrowDownIcon,
	ArrowLeftIcon,
	ArrowUpIcon,
	PencilIcon,
	PlusIcon,
} from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function LoanDetailsPage() {
	const params = useParams();
	const router = useRouter();
	const [loan, setLoan] = useState<Loan | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [isDeleting, setIsDeleting] = useState(false);

	useEffect(() => {
		const fetchLoan = async () => {
			try {
				setIsLoading(true);

				const response = await api.get<LoanResponse>(`/loans/${params.title}`);
				console.log(response);

				if (response.success) {
					setLoan(response.data.loan);
				}
			} catch (error) {
				console.log(error);
				setError(
					error instanceof Error
						? error.message
						: "Failed to fetch loan details"
				);
			} finally {
				setIsLoading(false);
			}
		};

		if (params.title) {
			fetchLoan();
		}
	}, [params.title]);

	const handleDelete = async () => {
		try {
			setIsDeleting(true);
			const response = await api.delete<{ success: boolean; message: string }>(
				`/loans/${params.title}`
			);

			if (!response.success) {
				throw new Error(response.message);
			}

			toast.success("Loan deleted successfully");
			router.push("/loans");
		} catch (error) {
			toast.error(
				error instanceof Error ? error.message : "Failed to delete loan"
			);
			setIsDeleting(false);
		}
	};

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

				<div className='flex items-center gap-2'>
					<DeleteAlert
						title='Delete Loan'
						description={
							<>
								Are you sure you want to delete <strong>{loan.title}</strong>?
								This action cannot be undone and will delete all associated
								transactions.
								{loan.balance !== 0 && (
									<p className='mt-2 font-medium text-destructive'>
										Warning: This loan has an outstanding balance of{" "}
										{loan.balance.toLocaleString("en-US", {
											style: "currency",
											currency: loan.user?.currency || "BDT",
										})}
									</p>
								)}
							</>
						}
						deleteText='Delete Loan'
						isDeleting={isDeleting}
						onDelete={handleDelete}
					/>

					<Button variant='outline' asChild>
						<Link href={`/loans/${loan.title}/edit`} className='gap-2'>
							<PencilIcon className='h-4 w-4' />
							Edit Loan
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
								currency: loan.user?.currency || "BDT",
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
										className='flex items-center rounded-lg border p-4 flex-wrap gap-4'>
										<div className='flex items-center gap-3 grow'>
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
													Method: {transaction.method}
													{transaction.methodDetails &&
														` (${transaction.methodDetails})`}
												</p>
												{transaction.description && (
													<p className='text-sm text-muted-foreground'>
														Details: {transaction.description}
													</p>
												)}
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
										<div className='flex items-center gap-4 basis-[250px]'>
											<p
												className={`font-medium ${
													transaction.type === "CREDIT"
														? "text-emerald-500"
														: "text-red-500"
												}`}>
												{transaction.type === "CREDIT" ? "+" : "-"}{" "}
												{transaction.amount.toLocaleString("en-US", {
													style: "currency",
													currency: loan.user?.currency || "BDT",
												})}
											</p>
											<div className='flex items-center gap-2'>
												<Button variant='default' size='icon' asChild>
													<Link
														href={`/loans/${loan.title}/transaction/${transaction.id}/edit`}
														className='text-muted-foreground hover:text-foreground'>
														<PencilIcon className='h-4 w-4' />
													</Link>
												</Button>
												<DeleteAlert
													title='Delete Transaction'
													description={
														<>
															Are you sure you want to delete this transaction?
															This action cannot be undone.
															<p className='mt-2 font-medium text-destructive'>
																Warning: This will{" "}
																{transaction.type === "CREDIT"
																	? "decrease"
																	: "increase"}{" "}
																the loan balance by{" "}
																{transaction.amount.toLocaleString("en-US", {
																	style: "currency",
																	currency: loan.user?.currency || "BDT",
																})}
															</p>
														</>
													}
													deleteText='Delete Transaction'
													onDelete={async () => {
														try {
															const response = await api.delete<{
																success: boolean;
																message: string;
															}>(
																`/loans/${loan.title}/transaction/${transaction.id}`
															);

															if (!response.success) {
																throw new Error(response.message);
															}

															toast.success("Transaction deleted successfully");
															router.refresh();
														} catch (error) {
															toast.error(
																error instanceof Error
																	? error.message
																	: "Failed to delete transaction"
															);
														}
													}}
												/>
											</div>
										</div>
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
