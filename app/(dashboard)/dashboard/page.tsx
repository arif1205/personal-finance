"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function DashboardPage() {
	return (
		<div className='space-y-6'>
			<h1 className='text-3xl font-bold'>Dashboard</h1>

			{/* Summary Cards */}
			<div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
				<Card>
					<CardHeader>
						<CardTitle>Total Loans</CardTitle>
					</CardHeader>
					<CardContent>
						<p className='text-2xl font-bold'>2</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle>Active Loans</CardTitle>
					</CardHeader>
					<CardContent>
						<p className='text-2xl font-bold'>1</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle>Total Balance</CardTitle>
					</CardHeader>
					<CardContent>
						<p className='text-2xl font-bold'>$25,000</p>
					</CardContent>
				</Card>
			</div>

			{/* Recent Transactions */}
			<Card>
				<CardHeader>
					<CardTitle>Recent Transactions</CardTitle>
				</CardHeader>
				<CardContent>
					<div className='space-y-4'>
						{/* We'll replace this with real data later */}
						<p className='text-sm text-gray-500'>No recent transactions</p>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
