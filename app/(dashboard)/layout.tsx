import { ReactNode } from "react";

interface DashboardLayoutProps {
	children: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
	return (
		<div className='min-h-screen bg-gray-100'>
			{/* Header */}
			<header className='sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60'>
				<div className='container flex h-14 max-w-screen-2xl items-center'>
					<div className='mr-4 flex'>
						<a className='mr-6 flex items-center space-x-2' href='/'>
							<span className='font-bold inline-block'>Personal Finance</span>
						</a>
					</div>
				</div>
			</header>

			<div className='flex min-h-[calc(100vh-3.5rem)]'>
				{/* Sidebar */}
				<aside className='w-64 border-r bg-white'>
					<nav className='flex flex-col gap-2 p-4'>
						<a
							href='/dashboard'
							className='flex items-center gap-2 rounded-lg px-3 py-2 text-gray-500 transition-all hover:text-gray-900 hover:bg-gray-100'>
							Dashboard
						</a>
						<a
							href='/dashboard/loans'
							className='flex items-center gap-2 rounded-lg px-3 py-2 text-gray-500 transition-all hover:text-gray-900 hover:bg-gray-100'>
							Loans
						</a>
						<a
							href='/dashboard/transactions'
							className='flex items-center gap-2 rounded-lg px-3 py-2 text-gray-500 transition-all hover:text-gray-900 hover:bg-gray-100'>
							Transactions
						</a>
					</nav>
				</aside>

				{/* Main Content */}
				<main className='flex-1 p-6'>{children}</main>
			</div>
		</div>
	);
}
