import { errorResponse, successResponse } from "@/lib/api-response";
import { db } from "@/lib/db";
import { Hash } from "@/lib/hash";
import { NextResponse } from "next/server";
import { z } from "zod";

const registerSchema = z.object({
	name: z.string().min(2, "Name must be at least 2 characters"),
	email: z.string().email("Please enter a valid email address"),
	password: z.string().min(6, "Password must be at least 6 characters"),
});

export async function POST(req: Request) {
	try {
		const body = await req.json();
		const validatedData = registerSchema.parse(body);

		// Check if email already exists
		const existingUser = await db.user.findUnique({
			where: { email: validatedData.email },
		});

		if (existingUser) {
			return NextResponse.json(errorResponse("Email already registered"), {
				status: 400,
			});
		}

		// Hash password
		const hashedPassword = await Hash.hash(validatedData.password);

		// Create user
		await db.user.create({
			data: {
				name: validatedData.name,
				email: validatedData.email,
				password: hashedPassword,
			},
		});

		return NextResponse.json(successResponse(null, "Registration successful"), {
			status: 201,
		});
	} catch (error) {
		if (error instanceof z.ZodError) {
			return NextResponse.json(errorResponse(error.errors[0].message), {
				status: 400,
			});
		}

		console.error("Registration error:", error);
		return NextResponse.json(errorResponse("Failed to register user"), {
			status: 500,
		});
	}
}
