import { AuthenticatedRequest, withAuth } from "@/lib/auth";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { z } from "zod";
import { transactionSchema } from "@/lib/validations/transaction";
import { TransactionType } from "@prisma/client";

export async function POST(
	req: AuthenticatedRequest,
	{ params }: { params: Promise<{ title: string }> }
) {
	try {
		const user = await withAuth(req);

		if (user instanceof NextResponse) {
			return user;
		}

		const body = await req.json();
		const validatedData = transactionSchema.parse(body);

		// Await the params before using its properties
		const { title } = await params;

		// Start a transaction to ensure data consistency
		const result = await db.$transaction(async (tx) => {
			// First, verify the loan exists and belongs to the user
			const loan = await tx.loan.findUnique({
				where: {
					title: title,
					userId: user.user.id,
				},
			});

			if (!loan) {
				throw new Error("Loan not found");
			}

			// Calculate the balance change
			const balanceChange =
				validatedData.type === TransactionType.CREDIT
					? validatedData.amount
					: -validatedData.amount;

			// Create the transaction
			const transaction = await tx.transaction.create({
				data: {
					...validatedData,
					loanId: loan.id,
				},
			});

			// Update the loan balance
			const updatedLoan = await tx.loan.update({
				where: {
					id: loan.id,
				},
				data: {
					balance: {
						increment: balanceChange,
					},
					updatedAt: new Date(),
				},
				include: {
					transactions: {
						orderBy: {
							date: "desc",
						},
					},
				},
			});

			return { transaction, loan: updatedLoan };
		});

		return NextResponse.json({
			success: true,
			data: {
				transaction: result.transaction,
				loan: result.loan,
			},
		});
	} catch (error) {
		console.error("Error creating transaction:", error);

		if (error instanceof z.ZodError) {
			return NextResponse.json(
				{
					success: false,
					message: "Invalid transaction data",
					errors: error.errors,
				},
				{ status: 400 }
			);
		}

		if (error instanceof Error && error.message === "Loan not found") {
			return NextResponse.json(
				{
					success: false,
					message: "Loan not found",
				},
				{ status: 404 }
			);
		}

		return NextResponse.json(
			{
				success: false,
				message: "Failed to create transaction",
			},
			{ status: 500 }
		);
	}
}
