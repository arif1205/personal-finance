import { errorResponse, successResponse } from "@/lib/api-response";
import { Auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { Hash } from "@/lib/hash";
import { registerSchema } from "@/lib/validations/auth";
import { NextResponse } from "next/server";
import { z } from "zod";

export async function POST(req: Request) {
	try {
		const { name, email, password } = registerSchema.parse(await req.json());
		if (await db.user.findUnique({ where: { email }, select: { id: true } })) {
			return NextResponse.json(errorResponse("An account with this email already exists. Sign in instead."), { status: 409 });
		}
		const user = await db.user.create({ data: { name, email, password: await Hash.hash(password) } });
		const response = NextResponse.json(successResponse(null, "Account created"), { status: 201 });
		await Auth.createSession({ userId: user.id, email: user.email, name: user.name }, response);
		return response;
	} catch (error) {
		if (error instanceof z.ZodError) {
			return NextResponse.json(errorResponse(error.errors[0].message), { status: 400 });
		}
		console.error("Registration error:", error);
		return NextResponse.json(errorResponse("We couldn't create your account. Try again."), { status: 500 });
	}
}
