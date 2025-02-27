import { AuthenticatedRequest, withAuth } from "@/lib/auth";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { z } from "zod";
import { transactionSchema } from "@/lib/validations/transaction";
import { TransactionType } from "@prisma/client";

export async function PATCH(
	req: AuthenticatedRequest,
	{ params }: { params: Promise<{ title: string; id: string }> }
) {
	try {
		const user = await withAuth(req);

		if (user instanceof NextResponse) {
			return user;
		}

		const body = await req.json();

		// Ensure date is in ISO format
		if (body.date && !(body.date instanceof Date)) {
			body.date = new Date(body.date).toISOString();
		}

		const validatedData = transactionSchema.parse(body);

		const { title, id } = await params;

		// Start a transaction to ensure data consistency
		const result = await db.$transaction(async (tx) => {
			// First, verify the loan exists and belongs to the user
			const loan = await tx.loan.findFirst({
				where: {
					title,
					userId: user.user.id,
				},
				include: {
					transactions: {
						where: {
							id,
						},
					},
				},
			});

			if (!loan) {
				throw new Error("Loan not found");
			}

			if (loan.transactions.length === 0) {
				throw new Error("Transaction not found");
			}

			const oldTransaction = loan.transactions[0];

			// Calculate the old balance impact
			const oldBalanceChange =
				oldTransaction.type === TransactionType.CREDIT
					? oldTransaction.amount
					: -oldTransaction.amount;

			// Calculate the new balance impact
			const newBalanceChange =
				validatedData.type === TransactionType.CREDIT
					? validatedData.amount
					: -validatedData.amount;

			// Update the transaction
			const transaction = await tx.transaction.update({
				where: {
					id,
				},
				data: {
					amount: validatedData.amount,
					type: validatedData.type,
					date: new Date(validatedData.date),
					description: validatedData.description,
					method: validatedData.method,
					methodDetails: validatedData.methodDetails,
					transactionId: validatedData.transactionId,
				},
			});

			// Update the loan balance by removing the old transaction's impact and adding the new one
			const updatedLoan = await tx.loan.update({
				where: {
					id: loan.id,
				},
				data: {
					balance: {
						increment: newBalanceChange - oldBalanceChange,
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

		if (error instanceof Error) {
			if (error.message === "Loan not found") {
				return NextResponse.json(
					{
						success: false,
						message: "Loan not found",
					},
					{ status: 404 }
				);
			}
			if (error.message === "Transaction not found") {
				return NextResponse.json(
					{
						success: false,
						message: "Transaction not found",
					},
					{ status: 404 }
				);
			}
		}

		return NextResponse.json(
			{
				success: false,
				message: "Failed to update transaction",
			},
			{ status: 500 }
		);
	}
}

export async function DELETE(
	req: AuthenticatedRequest,
	{ params }: { params: Promise<{ title: string; id: string }> }
) {
	try {
		const user = await withAuth(req);

		if (user instanceof NextResponse) {
			return user;
		}

		const { title, id } = await params;

		// Start a transaction to ensure data consistency
		const result = await db.$transaction(async (tx) => {
			// First, verify the loan exists and belongs to the user
			const loan = await tx.loan.findUnique({
				where: {
					title,
					userId: user.user.id,
				},
				include: {
					transactions: {
						where: {
							id,
						},
					},
				},
			});

			if (!loan) {
				throw new Error("Loan not found");
			}

			if (loan.transactions.length === 0) {
				throw new Error("Transaction not found");
			}

			const transaction = loan.transactions[0];

			// Calculate the balance impact
			const balanceChange =
				transaction.type === TransactionType.CREDIT
					? -transaction.amount
					: transaction.amount;

			// Delete the transaction
			await tx.transaction.delete({
				where: {
					id,
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

			return { loan: updatedLoan };
		});

		return NextResponse.json({
			success: true,
			data: {
				loan: result.loan,
			},
		});
	} catch (error) {
		console.error("Error deleting transaction:", error);

		if (error instanceof Error) {
			if (error.message === "Loan not found") {
				return NextResponse.json(
					{
						success: false,
						message: "Loan not found",
					},
					{ status: 404 }
				);
			}
			if (error.message === "Transaction not found") {
				return NextResponse.json(
					{
						success: false,
						message: "Transaction not found",
					},
					{ status: 404 }
				);
			}
		}

		return NextResponse.json(
			{
				success: false,
				message: "Failed to delete transaction",
			},
			{ status: 500 }
		);
	}
}

export async function GET(
	req: AuthenticatedRequest,
	{ params }: { params: Promise<{ title: string; id: string }> }
) {
	try {
		const user = await withAuth(req);

		if (user instanceof NextResponse) {
			return user;
		}

		const { title, id } = await params;

		// Find the loan and transaction
		const loan = await db.loan.findUnique({
			where: {
				title,
				userId: user.user.id,
			},
			include: {
				transactions: {
					where: {
						id,
					},
				},
			},
		});

		if (!loan) {
			return NextResponse.json(
				{
					success: false,
					message: "Loan not found",
				},
				{ status: 404 }
			);
		}

		if (loan.transactions.length === 0) {
			return NextResponse.json(
				{
					success: false,
					message: "Transaction not found",
				},
				{ status: 404 }
			);
		}

		return NextResponse.json({
			success: true,
			data: {
				transaction: loan.transactions[0],
			},
		});
	} catch (error) {
		console.error("Error fetching transaction:", error);

		return NextResponse.json(
			{
				success: false,
				message: "Failed to fetch transaction",
			},
			{ status: 500 }
		);
	}
}
