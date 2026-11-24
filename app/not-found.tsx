import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function NotFound() {
	return (
		<main className='mx-auto flex min-h-dvh max-w-md flex-col justify-center px-4'>
			<h1 className='text-3xl font-semibold tracking-tight'>This page isn&apos;t here</h1>
			<p className='mt-3 text-lg text-muted-foreground'>The loan or payment may have been deleted, or the link is wrong.</p>
			<Button asChild className='mt-8 w-full sm:w-auto'>
				<Link href='/loans'>Go to your loans</Link>
			</Button>
		</main>
	);
}
