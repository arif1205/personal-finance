import { Auth } from "@/lib/auth";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const publicPaths = ["/login", "/register"];

// Page-level redirect only; every API route and server page checks the session itself.
export async function middleware(request: NextRequest) {
	const { pathname, search } = request.nextUrl;
	const isPublic = publicPaths.some((p) => pathname === p || pathname.startsWith(`${p}/`));
	const signedIn = await Auth.isAuthenticated(request);

	if (isPublic && signedIn) return NextResponse.redirect(new URL("/", request.url));
	if (!isPublic && !signedIn) {
		const login = new URL("/login", request.url);
		if (pathname !== "/") login.searchParams.set("from", pathname + search);
		return NextResponse.redirect(login);
	}
	return NextResponse.next();
}

export const config = {
	matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|svg|ico|webmanifest|txt)$).*)"],
};
