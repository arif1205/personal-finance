import { AuthenticatedRequest, withAuth } from "@/lib/auth";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(req: AuthenticatedRequest) {
	try {
		const user = await withAuth(req);

		if (user instanceof NextResponse) {
			return user;
		}

		// Get recent loans based on latest transaction or update
		const recentLoans = await db.loan.findMany({
			where: {
				userId: user.user.id,
			},
			orderBy: [
				{
					updatedAt: "desc",
				},
			],
			include: {
				transactions: {
					orderBy: {
						date: "desc",
					},
					take: 1,
				},
				user: true,
			},
			take: 4,
		});

		return NextResponse.json({
			success: true,
			data: {
				loans: recentLoans,
			},
		});
	} catch (error) {
		console.error("Error fetching recent loans:", error);
		return NextResponse.json(
			{
				success: false,
				message: "Failed to fetch recent loans",
			},
			{ status: 500 }
		);
	}
}
