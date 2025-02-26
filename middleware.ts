import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { Auth } from "@/lib/auth";

// Add paths that don't require authentication
const publicPaths = ["/login", "/register"];

export async function middleware(request: NextRequest) {
	// Check if the path is public
	const isPublicPath = publicPaths.some((path) =>
		request.nextUrl.pathname.startsWith(path)
	);

	const isAuthenticated = await Auth.isAuthenticated(request);

	// Redirect authenticated users away from login page
	if (isPublicPath && isAuthenticated) {
		return NextResponse.redirect(new URL("/dashboard", request.url));
	}

	// Redirect unauthenticated users to login
	if (!isPublicPath && !isAuthenticated) {
		const loginUrl = new URL("/login", request.url);
		loginUrl.searchParams.set("from", request.nextUrl.pathname);
		return NextResponse.redirect(loginUrl);
	}

	return NextResponse.next();
}

// Configure which routes to run middleware on
export const config = {
	matcher: [
		/*
		 * Match all request paths except:
		 * - api routes
		 * - _next/static (static files)
		 * - _next/image (image optimization files)
		 * - favicon.ico (favicon file)
		 * - public files (public folder)
		 */
		"/((?!api|_next/static|_next/image|favicon.ico|public).*)",
	],
};
