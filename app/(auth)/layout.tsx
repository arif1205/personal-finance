import { ReactNode } from "react";

interface AuthLayoutProps {
	children: ReactNode;
}

export default function AuthLayout({ children }: AuthLayoutProps) {
	return (
		<div className='min-h-screen flex items-center justify-center bg-background'>
			<div className='w-full max-w-md p-4 space-y-4'>
				<div className='text-center space-y-2'>
					<h1 className='text-3xl font-bold tracking-tight'>
						Personal Finance
					</h1>
					<p className='text-muted-foreground'>Track your finances with ease</p>
				</div>
				{children}
			</div>
		</div>
	);
}
