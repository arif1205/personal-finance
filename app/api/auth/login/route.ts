import { errorResponse, successResponse } from "@/lib/api-response";
import { Auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { Hash } from "@/lib/hash";
import { validateLoginRequest } from "@/lib/validations/auth";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
	try {
		const { isValid, error, data } = validateLoginRequest(await req.json());
		if (!isValid) return NextResponse.json(errorResponse(error), { status: 400 });

		const user = await db.user.findUnique({
			where: { email: data.email },
			select: { id: true, email: true, name: true, password: true, status: true },
		});
		if (!user || user.status !== "ACTIVE" || !(await Hash.compare(data.password, user.password))) {
			return Auth.createAuthError("That email and password don't match. Check them and try again.");
		}

		const response = NextResponse.json(successResponse({ name: user.name }, "Signed in"));
		await Auth.createSession({ userId: user.id, email: user.email, name: user.name }, response);
		return response;
	} catch (error) {
		console.error("Login error:", error);
		return NextResponse.json(errorResponse("We couldn't sign you in. Try again."), { status: 500 });
	}
}
