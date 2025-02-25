import { NextResponse } from "next/server";
import { Auth } from "@/lib/auth";
import { successResponse } from "@/lib/api-response";

export async function POST() {
	const response = NextResponse.json(
		successResponse(null, "Logged out successfully"),
		{ status: 200 }
	);

	Auth.destroySession(response);
	return response;
}
