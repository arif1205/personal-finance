import { AppSidebar } from "@/components/dashboard/layout/app-sidebar";
import ShowBreadCrumb from "@/components/dashboard/layout/show-breadcrumb";
import { UserMenu } from "@/components/dashboard/layout/user-menu";
import { Separator } from "@/components/ui/separator";
import {
	SidebarInset,
	SidebarProvider,
	SidebarTrigger,
} from "@/components/ui/sidebar";

export default function DashboardLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<SidebarProvider>
			<AppSidebar />
			<SidebarInset>
				<header className='flex h-16 shrink-0 items-center justify-between gap-2 border-b px-4'>
					<div className='flex items-center gap-2'>
						<SidebarTrigger className='-ml-1' />
						<Separator orientation='vertical' className='mr-2 h-4' />
						<ShowBreadCrumb />
					</div>
					<UserMenu />
				</header>
				<main className='flex flex-1 flex-col gap-4 p-4'>{children}</main>
			</SidebarInset>
		</SidebarProvider>
	);
}
