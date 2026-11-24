import { Nav } from "@/components/app/nav";
import { requireUser } from "@/lib/session";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
	await requireUser();
	return (
		<>
			<a href='#main' className='sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-card focus:px-4 focus:py-3'>
				Skip to content
			</a>
			<Nav />
			<main id='main' className='mx-auto w-full max-w-2xl px-4 pb-32 pt-6 sm:px-6 md:pb-16 md:pt-10'>
				{children}
			</main>
		</>
	);
}
