"use client";

import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { api } from "@/lib/fetch-wrapper";
import { LogOutIcon, UserIcon } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface LogoutResponse {
	success: boolean;
	message?: string;
}

export function UserMenu() {
	const router = useRouter();

	const handleLogout = async () => {
		try {
			const response = await api.post<LogoutResponse>("/auth/logout");
			if (response.success) {
				toast.success("Logged out successfully");
				router.push("/login");
			} else {
				throw new Error(response.message || "Failed to logout");
			}
		} catch (error) {
			toast.error(error instanceof Error ? error.message : "Failed to logout");
		}
	};

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button variant='ghost' size='icon' className='h-9 w-9'>
					<UserIcon className='h-5 w-5' />
					<span className='sr-only'>Open user menu</span>
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align='end' className='w-56'>
				<DropdownMenuLabel>My Account</DropdownMenuLabel>
				<DropdownMenuSeparator />
				<DropdownMenuItem asChild>
					<Link href='/profile' className='flex items-center cursor-pointer'>
						<UserIcon className='mr-2 h-4 w-4' />
						Profile Settings
					</Link>
				</DropdownMenuItem>
				<DropdownMenuSeparator />
				<DropdownMenuItem
					className='text-destructive focus:bg-destructive focus:text-destructive-foreground cursor-pointer'
					onClick={handleLogout}>
					<LogOutIcon className='mr-2 h-4 w-4' />
					Log out
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
