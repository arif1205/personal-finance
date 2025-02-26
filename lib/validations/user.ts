import { z } from "zod";

export const updateProfileSchema = z
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

export type UpdateProfileRequest = z.infer<typeof updateProfileSchema>;
