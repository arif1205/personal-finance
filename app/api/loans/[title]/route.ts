import { AuthenticatedRequest, withAuth } from "@/lib/auth";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(
	req: AuthenticatedRequest,
	{ params }: { params: Promise<{ title: string }> }
) {
	try {
		const user = await withAuth(req);

		if (user instanceof NextResponse) {
			return user;
		}

		// Await the params before using its properties
		const { title } = await params;

		const loan = await db.loan.findUnique({
			where: {
				title: title,
				userId: user.user.id,
			},
			include: {
				transactions: {
					orderBy: {
						date: "desc",
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
