import { z } from "zod";

const email = z.string({ required_error: "Enter your email." }).trim().toLowerCase().email("Enter a valid email, like name@example.com.");

export const loginSchema = z.object({
	email,
	password: z.string({ required_error: "Enter your password." }).min(1, "Enter your password."),
});

export const registerSchema = z.object({
	name: z.string().trim().min(2, "Enter at least 2 characters.").max(80, "Keep your name under 80 characters."),
	email,
	password: z.string().min(8, "Use at least 8 characters.").max(128, "Keep it under 128 characters."),
});

export type LoginRequest = z.infer<typeof loginSchema>;

export function validateLoginRequest(data: unknown) {
	const result = loginSchema.safeParse(data);
	return result.success
		? ({ isValid: true, data: result.data } as const)
		: ({ isValid: false, error: result.error.errors[0].message } as const);
}
