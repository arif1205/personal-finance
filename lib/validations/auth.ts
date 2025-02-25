import { z } from "zod";

export const loginSchema = z.object({
	email: z
		.string({
			required_error: "Email is required",
		})
		.email("Invalid email format"),
	password: z
		.string({
			required_error: "Password is required",
		})
		.min(6, "Password must be at least 6 characters"),
});

export type LoginRequest = z.infer<typeof loginSchema>;

type ValidationResult =
	| { isValid: true; data: LoginRequest; error?: never }
	| { isValid: false; error: string; data?: never };

export function validateLoginRequest(data: unknown): ValidationResult {
	const result = loginSchema.safeParse(data);

	if (!result.success) {
		return {
			isValid: false,
			error: result.error.errors[0].message,
		};
	}

	return {
		isValid: true,
		data: result.data,
	};
}
