"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { ArrowDownIcon, ArrowUpIcon } from "lucide-react";

interface LoanSummaryCardProps {
	title: string;
	amount: number;
	lastTransaction?: {
		date: string;
		amount: number;
	};
	className?: string;
}

export function LoanSummaryCard({
	title,
	amount,
	lastTransaction,
	className,
}: LoanSummaryCardProps) {
	const isLender = amount > 0;

	return (
		<Card className={cn("overflow-hidden", className)}>
			<CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
				<CardTitle className='text-sm font-medium'>{title}</CardTitle>
				<div
					className={cn(
						"flex items-center rounded-full px-2 py-1 text-xs font-semibold",
						isLender
							? "bg-emerald-500/10 text-emerald-500"
							: "bg-red-500/10 text-red-500"
					)}>
					{isLender ? (
						<ArrowUpIcon className='mr-1 h-3 w-3' />
					) : (
						<ArrowDownIcon className='mr-1 h-3 w-3' />
					)}
					{isLender ? "Lender" : "Borrower"}
				</div>
			</CardHeader>
			<CardContent>
				<div className='text-2xl font-bold'>
					{amount.toLocaleString("en-US", {
						style: "currency",
						currency: "BDT",
					})}
				</div>
				{lastTransaction && (
					<p className='text-xs text-muted-foreground mt-1'>
						Last transaction:{" "}
						{new Date(lastTransaction.date).toLocaleDateString()} (
						{lastTransaction.amount.toLocaleString("en-US", {
							style: "currency",
							currency: "BDT",
							signDisplay: "always",
						})}
						)
					</p>
				)}
			</CardContent>
		</Card>
	);
}
