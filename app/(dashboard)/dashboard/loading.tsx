import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function DashboardLoading() {
	return (
		<div className='space-y-6'>
			<div className='h-8 w-36 animate-pulse rounded-md bg-gray-200' />

			<div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
				{[1, 2, 3].map((i) => (
					<Card key={i}>
						<CardHeader>
							<div className='h-6 w-24 animate-pulse rounded-md bg-gray-200' />
						</CardHeader>
						<CardContent>
							<div className='h-8 w-16 animate-pulse rounded-md bg-gray-200' />
						</CardContent>
					</Card>
				))}
			</div>

			<Card>
				<CardHeader>
					<div className='h-6 w-32 animate-pulse rounded-md bg-gray-200' />
				</CardHeader>
				<CardContent>
					<div className='space-y-4'>
						{[1, 2, 3].map((i) => (
							<div
								key={i}
								className='h-12 w-full animate-pulse rounded-md bg-gray-200'
							/>
						))}
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
