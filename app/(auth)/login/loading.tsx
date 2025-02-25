import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function LoginLoading() {
	return (
		<Card>
			<CardHeader>
				<div className='h-6 w-24 animate-pulse rounded-md bg-gray-200' />
				<div className='h-4 w-48 mt-2 animate-pulse rounded-md bg-gray-200' />
			</CardHeader>
			<CardContent className='space-y-4'>
				<div className='space-y-2'>
					<div className='h-4 w-12 animate-pulse rounded-md bg-gray-200' />
					<div className='h-10 w-full animate-pulse rounded-md bg-gray-200' />
				</div>
				<div className='space-y-2'>
					<div className='h-4 w-16 animate-pulse rounded-md bg-gray-200' />
					<div className='h-10 w-full animate-pulse rounded-md bg-gray-200' />
				</div>
				<div className='h-10 w-full animate-pulse rounded-md bg-gray-300' />
			</CardContent>
		</Card>
	);
}
