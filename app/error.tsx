"use client";

import { Button } from "@/components/ui/button";

export default function Error({ reset }: { error: Error; reset: () => void }) {
	return (
		<main className='mx-auto flex min-h-dvh max-w-md flex-col justify-center px-4'>
			<h1 className='text-3xl font-semibold tracking-tight'>This page didn&apos;t load</h1>
			<p className='mt-3 text-lg text-muted-foreground'>Your data is safe. Check your connection, then try again.</p>
			<Button onClick={reset} className='mt-8 w-full sm:w-auto'>
				Try again
			</Button>
		</main>
	);
}
