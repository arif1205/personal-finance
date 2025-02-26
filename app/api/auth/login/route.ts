import { errorResponse, successResponse } from "@/lib/api-response";
import { Auth } from "@/lib/auth";
import { Hash } from "@/lib/hash";
import { validateLoginRequest } from "@/lib/validations/auth";
import { PrismaClient } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
	try {
		const body = await req.json();

		// Validate request body using Zod
		const { isValid, error, data } = validateLoginRequest(body);

		if (!isValid) {
			return NextResponse.json(errorResponse(error || "Invalid request"), {
				status: 400,
			});
		}

		// Find user by email using validated data
		const user = await prisma.user.findUnique({
			where: { email: data.email },
			select: {
				id: true,
				email: true,
				name: true,
				password: true,
			},
		});

		if (!user) {
			return Auth.createAuthError("Invalid email or password");
		}

		// Verify password using validated data
		const isPasswordValid = await Hash.compare(data.password, user.password);
		if (!isPasswordValid) {
			return Auth.createAuthError("Invalid email or password");
		}

		// Remove password from response
		const { password, ...userWithoutPassword } = user;

		// Create the response
		const response = NextResponse.json(
			successResponse(
				{
					user: userWithoutPassword,
				},
				"Login successful"
			),
			{ status: 200 }
		);

		// Create session with JWT token
		Auth.createSession(
			{
				userId: user.id,
				email: user.email,
				name: user.name,
			},
			response
		);

		return response;
	} catch (error) {
		// Handle Zod validation errors specifically
		if (error instanceof ZodError) {
			return NextResponse.json(errorResponse(error.errors[0].message), {
				status: 400,
			});
		}

		return NextResponse.json(errorResponse("An error occurred during login"), {
			status: 500,
		});
	} finally {
		await prisma.$disconnect();
	}
}
