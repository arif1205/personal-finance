export default function AuthLayout({ children }: { children: React.ReactNode }) {
	return (
		<main className='mx-auto flex min-h-dvh w-full max-w-md flex-col justify-center px-4 py-10 sm:px-6'>
			<p className='mb-10 text-lg font-semibold tracking-tight'>Personal Finance</p>
			{children}
		</main>
	);
}
