import { Currency } from "@prisma/client";
import { z } from "zod";

// Schema for updating profile name
export const updateNameSchema = z.object({
	name: z.string().min(2, "Name must be at least 2 characters"),
	currency: z.nativeEnum(Currency, {
		message: "Currency is required",
	}),
});

// Schema for changing password
export const changePasswordSchema = z
	.object({
		currentPassword: z.string().min(1, "Current password is required"),
		newPassword: z
			.string()
			.min(6, "New password must be at least 6 characters"),
		confirmPassword: z.string().min(1, "Please confirm your new password"),
	})
	.refine((data) => data.newPassword === data.confirmPassword, {
		message: "Passwords do not match",
		path: ["confirmPassword"],
	});

export type UpdateNameRequest = z.infer<typeof updateNameSchema>;
export type ChangePasswordRequest = z.infer<typeof changePasswordSchema>;
