"use client";
import {
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbList,
	BreadcrumbPage,
	BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { usePathname } from "next/navigation";
import { useMemo } from "react";
import React from "react";

const ShowBreadCrumb = () => {
	const pathname = usePathname();

	const breadcrumbs = useMemo(() => {
		// Remove any query parameters
		const cleanPath = pathname.split("?")[0];

		// Split the path into segments and remove empty ones
		const segments = cleanPath.split("/").filter((segment) => segment);

		// Generate breadcrumb items
		return segments.map((segment, index) => {
			// Create the URL for this breadcrumb
			const url = `/${segments.slice(0, index + 1).join("/")}`;

			// Decode the segment and format the text (capitalize and replace hyphens with spaces)
			const text = decodeURIComponent(segment)
				.split("-")
				.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
				.join(" ");

			return {
				text,
				url,
				isLast: index === segments.length - 1,
			};
		});
	}, [pathname]);

	return (
		<Breadcrumb>
			<BreadcrumbList>
				{/* Home link */}
				<BreadcrumbItem>
					<BreadcrumbLink href='/'>Personal Finance</BreadcrumbLink>
				</BreadcrumbItem>
				<BreadcrumbSeparator />

				{/* Dynamic breadcrumbs */}
				{breadcrumbs.map((breadcrumb, index) => (
					<React.Fragment key={breadcrumb.url}>
						<BreadcrumbItem>
							{breadcrumb.isLast ? (
								<BreadcrumbPage>
									{breadcrumb.url === "/" ? "Dashboard" : breadcrumb.text}
								</BreadcrumbPage>
							) : (
								<BreadcrumbLink href={breadcrumb.url}>
									{breadcrumb.text}
								</BreadcrumbLink>
							)}
						</BreadcrumbItem>
						{!breadcrumb.isLast && <BreadcrumbSeparator />}
					</React.Fragment>
				))}
				{breadcrumbs.length === 0 && (
					<BreadcrumbItem>
						<BreadcrumbLink href='/'>Dashboard</BreadcrumbLink>
					</BreadcrumbItem>
				)}
			</BreadcrumbList>
		</Breadcrumb>
	);
};

export default ShowBreadCrumb;
