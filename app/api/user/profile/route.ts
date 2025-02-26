import { errorResponse, successResponse } from "@/lib/api-response";
import { AuthenticatedRequest, withAuth } from "@/lib/auth";
import { Hash } from "@/lib/hash";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { z } from "zod";

const updateProfileSchema = z
	.object({
		name: z.string().min(2, "Name must be at least 2 characters"),
		currentPassword: z.string().optional(),
		newPassword: z.string().optional(),
		confirmPassword: z.string().optional(),
	})
	.refine(
		(data) => {
			const hasCurrentPassword = !!data.currentPassword;
			const hasNewPassword = !!data.newPassword;
			const hasConfirmPassword = !!data.confirmPassword;

			if (hasCurrentPassword || hasNewPassword || hasConfirmPassword) {
				if (!hasCurrentPassword) return false;
				if (!hasNewPassword) return false;
				if (!hasConfirmPassword) return false;
				if (data.newPassword !== data.confirmPassword) return false;
				if (data.newPassword && data.newPassword.length < 6) return false;
			}

			return true;
		},
		{
			message:
				"Please fill all password fields and ensure new passwords match and are at least 6 characters",
		}
	);

export async function GET(req: AuthenticatedRequest) {
	try {
		const user = await withAuth(req);

		if (user instanceof NextResponse) {
			return user;
		}

		const dbUser = await db.user.findUnique({
			where: { id: user.user.id },
			select: {
				name: true,
				email: true,
			},
		});

		if (!dbUser) {
			return NextResponse.json(errorResponse("User not found"), {
				status: 404,
			});
		}

		return NextResponse.json(
			successResponse({
				name: dbUser.name,
				email: dbUser.email,
			}),
			{ status: 200 }
		);
	} catch (error) {
		console.error("Error fetching profile:", error);
		return NextResponse.json(errorResponse("Failed to fetch profile"), {
			status: 500,
		});
	}
}

export async function PATCH(req: AuthenticatedRequest) {
	try {
		const user = await withAuth(req);

		if (user instanceof NextResponse) {
			return user;
		}

		const body = await req.json();
		const validatedData = updateProfileSchema.parse(body);

		// If password is being updated, verify current password
		if (validatedData.currentPassword) {
			const dbUser = await db.user.findUnique({
				where: { id: user.user.id },
				select: { password: true },
			});

			if (!dbUser) {
				return NextResponse.json(errorResponse("User not found"), {
					status: 404,
				});
			}

			const isPasswordValid = await Hash.compare(
				validatedData.currentPassword,
				dbUser.password
			);

			if (!isPasswordValid) {
				return NextResponse.json(
					errorResponse("Current password is incorrect"),
					{ status: 400 }
				);
			}
		}

		// Update user profile
		const updateData: any = {
			name: validatedData.name,
		};

		// If new password is provided, hash it
		if (validatedData.newPassword) {
			updateData.password = await Hash.hash(validatedData.newPassword);
		}

		// Update the user
		await db.user.update({
			where: { id: user.user.id },
			data: updateData,
		});

		return NextResponse.json(
			successResponse(null, "Profile updated successfully"),
			{ status: 200 }
		);
	} catch (error) {
		if (error instanceof z.ZodError) {
			return NextResponse.json(errorResponse(error.errors[0].message), {
				status: 400,
			});
		}

		console.error("Error updating profile:", error);
		return NextResponse.json(errorResponse("Failed to update profile"), {
			status: 500,
		});
	}
}
