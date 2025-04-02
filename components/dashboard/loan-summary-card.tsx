"use client";

import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
	CardDescription,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { Currency, TransactionType } from "@prisma/client";

interface LoanSummaryCardProps {
	title: string;
	balance: number;
	createdAt: string;
	lastTransaction?: {
		date: string;
		amount: number;
		type: TransactionType;
	};
	className?: string;
	currency: Currency;
}

export function LoanSummaryCard({
	title,
	balance,
	createdAt,
	lastTransaction,
	className,
	currency,
}: LoanSummaryCardProps) {
	return (
		<Card
			className={cn(
				"transition-all hover:scale-[1.02]",
				balance > 0
					? "bg-emerald-500/5 hover:bg-emerald-500/10 border-emerald-500/20"
					: balance < 0
					? "bg-red-500/5 hover:bg-red-500/10 border-red-500/20"
					: "",
				className
			)}>
			<CardHeader>
				<CardTitle className='text-xl line-clamp-1'>{title}</CardTitle>
				<CardDescription>
					Created {format(new Date(createdAt), "PPP")}
				</CardDescription>
			</CardHeader>
			<CardContent>
				<div className='space-y-2'>
					<div
						className={cn("text-2xl font-bold", {
							"text-emerald-500": balance > 0,
							"text-red-500": balance < 0,
						})}>
						{balance.toLocaleString("en-US", {
							style: "currency",
							currency: currency || "BDT",
						})}
					</div>
					{lastTransaction && (
						<p className='text-sm text-muted-foreground'>
							Last transaction: {format(new Date(lastTransaction.date), "PP")}
						</p>
					)}
				</div>
			</CardContent>
		</Card>
	);
}
