import { AuthenticatedRequest, withAuth } from "@/lib/auth";
import { db } from "@/lib/db";
import { createLoanSchema } from "@/lib/validations/loans";
import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import { z } from "zod";

// GET /api/loans - Get all loans for the authenticated user
export async function GET(req: AuthenticatedRequest) {
	try {
		const user = await withAuth(req);

		if (user instanceof NextResponse) {
			return user;
		}

		// Get query parameters for pagination
		const searchParams = req.nextUrl.searchParams;
		const status = searchParams.get("status") || undefined;

		// Build where clause
		const where: Prisma.LoanWhereInput = {
			userId: user.user.id,
			...(status && { status: status as "RUNNING" | "CLOSED" }),
		};

		// Get loans with pagination
		const [loans] = await Promise.all([
			db.loan.findMany({
				where,
				orderBy: {
					updatedAt: "desc",
				},
				include: {
					transactions: {
						orderBy: {
							date: "desc",
						},
						take: 1,
					},
					user: true,
				},
			}),
			db.loan.count({ where }),
		]);

		return NextResponse.json({
			success: true,
			data: {
				loans,
			},
		});
	} catch (error) {
		console.error("Error fetching loans:", error);
		return NextResponse.json(
			{
				success: false,
				message: "Failed to fetch loans",
			},
			{ status: 500 }
		);
	}
}

// POST /api/loans - Create a new loan
export async function POST(req: AuthenticatedRequest) {
	try {
		const user = await withAuth(req);

		if (user instanceof NextResponse) {
			return user;
		}

		const body = await req.json();

		const validatedData = createLoanSchema.parse(body);

		// Calculate the actual balance based on type
		const balance =
			validatedData.type === "LEND"
				? validatedData.initialBalance
				: -validatedData.initialBalance;

		// Create loan and initial transaction in a transaction
		const result = await db.$transaction(
			async (tx: Prisma.TransactionClient) => {
				const loan = await tx.loan.create({
					data: {
						title: validatedData.title,
						description: validatedData.description,
						balance,
						userId: user.user.id,
						transactions: {
							create: {
								amount: validatedData.initialBalance,
								type: validatedData.type === "LEND" ? "CREDIT" : "DEBIT",
								date: new Date(validatedData.transactionDetails.date),
								method: validatedData.transactionDetails.method,
								methodDetails: validatedData.transactionDetails.methodDetails,
								transactionId: validatedData.transactionDetails.transactionId,
								description: validatedData.transactionDetails.description,
							},
						},
					},
					include: {
						transactions: true,
						user: true,
					},
				});

				return loan;
			}
		);

		return NextResponse.json({
			success: true,
			message: "Loan created successfully",
			data: {
				title: result.title,
			},
		});
	} catch (error) {
		console.error("Error creating loan:", error);

		if (error instanceof z.ZodError) {
			return NextResponse.json(
				{
					success: false,
					message: "Invalid request data",
					errors: error.errors,
				},
				{ status: 400 }
			);
		}

		if (error instanceof Prisma.PrismaClientKnownRequestError) {
			return NextResponse.json(
				{
					success: false,
					message: "Database error occurred",
					code: error.code,
				},
				{ status: 500 }
			);
		}

		return NextResponse.json(
			{
				success: false,
				message: "Failed to create loan",
			},
			{ status: 500 }
		);
	}
}
