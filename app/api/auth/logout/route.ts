import { successResponse } from "@/lib/api-response";
import { Auth } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

export async function POST() {
	const response = NextResponse.json(successResponse(null, "Signed out"));
	Auth.destroySession(response);
	return response;
}

// Used when a valid token points at a deleted account; clearing it avoids a login redirect loop.
export async function GET(request: NextRequest) {
	const response = NextResponse.redirect(new URL("/login", request.url));
	Auth.destroySession(response);
	return response;
}
