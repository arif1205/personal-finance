import { AuthenticatedRequest, withAuth } from "@/lib/auth";
import { db } from "@/lib/db";
import { editLoanSchema } from "@/lib/validations/loans";
import { NextResponse } from "next/server";
import { z } from "zod";

export async function GET(
	req: AuthenticatedRequest,
	{ params }: { params: Promise<{ title: string }> }
) {
	try {
		const user = await withAuth(req);

		if (user instanceof NextResponse) {
			return user;
		}

		const { title } = await params;

		const loan = await db.loan.findFirst({
			where: {
				title,
				userId: user.user.id,
			},
			select: {
				id: true,
				title: true,
				description: true,
				balance: true,
				status: true,
				createdAt: true,
				updatedAt: true,
				transactions: {
					orderBy: {
						date: "desc",
					},
				},
				user: true,
			},
		});

		console.log(loan, user.user, title);

		if (!loan) {
			return NextResponse.json(
				{
					success: false,
					message: "Loan not found",
				},
				{ status: 404 }
			);
		}

		return NextResponse.json({
			success: true,
			data: {
				loan,
			},
		});
	} catch (error) {
		console.error("Error fetching loan:", error);
		return NextResponse.json(
			{
				success: false,
				message: "Failed to fetch loan details",
			},
			{ status: 500 }
		);
	}
}

export async function PATCH(
	req: AuthenticatedRequest,
	{ params }: { params: Promise<{ title: string }> }
) {
	try {
		const user = await withAuth(req);

		if (user instanceof NextResponse) {
			return user;
		}

		const { title } = await params;

		// Get the current loan
		const currentLoan = await db.loan.findFirst({
			where: {
				title,
				userId: user.user.id,
			},
		});

		if (!currentLoan) {
			return NextResponse.json(
				{
					success: false,
					message: "Loan not found",
				},
				{ status: 404 }
			);
		}

		// Validate request body
		const body = await req.json();
		const validatedData = editLoanSchema.parse(body);

		// Check if new title is already taken (if title is being changed)
		if (
			validatedData.title !== currentLoan.title &&
			(await db.loan.findFirst({
				where: {
					title: validatedData.title,
					userId: user.user.id,
				},
			}))
		) {
			return NextResponse.json(
				{
					success: false,
					message: "A loan with this title already exists",
				},
				{ status: 400 }
			);
		}

		// Update loan
		const updatedLoan = await db.loan.update({
			where: {
				id: currentLoan.id,
			},
			data: {
				title: validatedData.title,
				description: validatedData.description,
			},
		});

		return NextResponse.json({
			success: true,
			message: "Loan updated successfully",
			data: {
				title: updatedLoan.title,
			},
		});
	} catch (error) {
		console.error("Error updating loan:", error);

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

		return NextResponse.json(
			{
				success: false,
				message: "Failed to update loan",
			},
			{ status: 500 }
		);
	}
}

export async function DELETE(
	req: AuthenticatedRequest,
	{ params }: { params: Promise<{ title: string }> }
) {
	try {
		const user = await withAuth(req);

		if (user instanceof NextResponse) {
			return user;
		}

		const { title } = await params;

		// Get the current loan
		const currentLoan = await db.loan.findFirst({
			where: {
				title,
				userId: user.user.id,
			},
		});

		if (!currentLoan) {
			return NextResponse.json(
				{
					success: false,
					message: "Loan not found",
				},
				{ status: 404 }
			);
		}

		// Delete loan (this will cascade delete all transactions)
		await db.loan.delete({
			where: {
				id: currentLoan.id,
			},
		});

		return NextResponse.json({
			success: true,
			message: "Loan deleted successfully",
		});
	} catch (error) {
		console.error("Error deleting loan:", error);
		return NextResponse.json(
			{
				success: false,
				message: "Failed to delete loan",
			},
			{ status: 500 }
		);
	}
}
