"use client";

import { cn } from "@/lib/utils";
import { HandCoins, House, Plus, UserRound } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [
	{ href: "/", label: "Home", icon: House, match: (p: string) => p === "/" },
	{ href: "/loans", label: "Loans", icon: HandCoins, match: (p: string) => p === "/loans" || (p.startsWith("/loans/") && p !== "/loans/new") },
	{ href: "/loans/new", label: "New loan", icon: Plus, match: (p: string) => p === "/loans/new" },
	{ href: "/profile", label: "Profile", icon: UserRound, match: (p: string) => p === "/profile" },
];

export function Nav() {
	const pathname = usePathname();
	return (
		<>
			<header className='sticky top-0 z-40 hidden border-b bg-background/90 backdrop-blur md:block'>
				<nav aria-label='Main' className='mx-auto flex h-16 max-w-3xl items-center gap-1 px-6'>
					<Link href='/' className='mr-auto rounded-md text-lg font-semibold tracking-tight'>
						Personal Finance
					</Link>
					{items.map(({ href, label, icon: Icon, match }) => (
						<Link
							key={href}
							href={href}
							aria-current={match(pathname) ? "page" : undefined}
							className={cn(
								"flex h-10 items-center gap-2 rounded-lg px-3 text-[15px] font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
								"aria-[current=page]:bg-muted aria-[current=page]:text-foreground"
							)}>
							<Icon aria-hidden className='size-[18px]' />
							{label}
						</Link>
					))}
				</nav>
			</header>

			<nav aria-label='Main' className='pb-safe fixed inset-x-0 bottom-0 z-40 border-t bg-card/95 backdrop-blur md:hidden'>
				<ul className='mx-auto grid max-w-md grid-cols-4'>
					{items.map(({ href, label, icon: Icon, match }) => (
						<li key={href}>
							<Link
								href={href}
								aria-current={match(pathname) ? "page" : undefined}
								className='group flex h-16 flex-col items-center justify-center gap-1 text-xs font-medium text-muted-foreground aria-[current=page]:text-foreground'>
								<span className='flex h-8 w-14 items-center justify-center rounded-full transition-colors group-aria-[current=page]:bg-primary/15'>
									<Icon aria-hidden className='size-[22px]' />
								</span>
								{label}
							</Link>
						</li>
					))}
				</ul>
			</nav>
		</>
	);
}
