"use client";

import * as React from "react";

import {
	Sidebar,
	SidebarContent,
	SidebarGroup,
	SidebarGroupContent,
	SidebarGroupLabel,
	SidebarHeader,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	SidebarRail,
} from "@/components/ui/sidebar";
import Link from "next/link";
import { usePathname } from "next/navigation";

// This is sample data.
const data = {
	navMain: [
		{
			title: "Dashboard",
			items: [
				{
					title: "Home",
					url: "/",
				},
			],
		},
		{
			title: "Loans Management",
			items: [
				{
					title: "Loan List",
					url: "/loans",
				},
				{
					title: "Create New Loan",
					url: "/loans/create",
				},
			],
		},
	],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
	const pathname = usePathname();
	const isActive = (url: string) => pathname === url;

	return (
		<Sidebar {...props}>
			<SidebarHeader>
				<div className='flex flex-col gap-0.5 leading-none py-4'>
					<span className='font-semibold text-lg'>Personal Finance</span>
				</div>
			</SidebarHeader>
			<SidebarContent>
				{/* We create a SidebarGroup for each parent. */}
				{data.navMain.map((item) => (
					<SidebarGroup key={item.title}>
						<SidebarGroupLabel>{item.title}</SidebarGroupLabel>
						<SidebarGroupContent>
							<SidebarMenu>
								{item.items.map((item) => (
									<SidebarMenuItem key={item.title}>
										<SidebarMenuButton asChild isActive={isActive(item.url)}>
											<Link href={item.url}>{item.title}</Link>
										</SidebarMenuButton>
									</SidebarMenuItem>
								))}
							</SidebarMenu>
						</SidebarGroupContent>
					</SidebarGroup>
				))}
			</SidebarContent>
			<SidebarRail />
		</Sidebar>
	);
}
