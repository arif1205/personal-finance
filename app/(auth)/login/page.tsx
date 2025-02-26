"use client";

import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api } from "@/lib/fetch-wrapper";
import { useFormik } from "formik";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { toFormikValidationSchema } from "zod-formik-adapter";

const loginSchema = z.object({
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

type LoginFormValues = z.infer<typeof loginSchema>;

interface LoginResponse {
	success: boolean;
	message: string;
	data?: {
		user: {
			id: string;
			email: string;
			name: string | null;
		};
	};
}

export default function LoginPage() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const [isSubmitting, setIsSubmitting] = useState(false);

	const formik = useFormik<LoginFormValues>({
		initialValues: {
			email: "",
			password: "",
		},
		validationSchema: toFormikValidationSchema(loginSchema),
		onSubmit: async (values, { resetForm }) => {
			try {
				setIsSubmitting(true);
				const data = await api.post<LoginResponse>("/auth/login", values);

				if (!data.success) {
					throw new Error(data.message);
				}

				toast.success("Logged in successfully");
				resetForm();
				const redirectTo = searchParams.get("from") || "/";
				router.push(redirectTo);
			} catch (error) {
				toast.error(error instanceof Error ? error.message : "Login failed");
			} finally {
				setIsSubmitting(false);
			}
		},
	});

	return (
		<Card className='w-full'>
			<CardHeader className='space-y-1'>
				<CardTitle className='text-2xl text-center'>Login</CardTitle>
				<CardDescription className='text-center'>
					Enter your credentials to access your account
				</CardDescription>
			</CardHeader>
			<form onSubmit={formik.handleSubmit} noValidate>
				<CardContent className='space-y-4'>
					<div className='space-y-2'>
						<Label htmlFor='email'>Email</Label>
						<Input
							id='email'
							name='email'
							type='email'
							placeholder='name@example.com'
							disabled={isSubmitting}
							onChange={formik.handleChange}
							onBlur={formik.handleBlur}
							value={formik.values.email}
							className={`w-full ${
								formik.touched.email && formik.errors.email
									? "border-red-500"
									: ""
							}`}
						/>
						{formik.touched.email && formik.errors.email && (
							<div className='mt-1 text-sm text-red-500'>
								{formik.errors.email}
							</div>
						)}
					</div>
					<div className='space-y-2'>
						<Label htmlFor='password'>Password</Label>
						<Input
							id='password'
							name='password'
							placeholder='********'
							type='password'
							disabled={isSubmitting}
							onChange={formik.handleChange}
							onBlur={formik.handleBlur}
							value={formik.values.password}
							className={`w-full ${
								formik.touched.password && formik.errors.password
									? "border-red-500"
									: ""
							}`}
						/>
						{formik.touched.password && formik.errors.password && (
							<div className='mt-1 text-sm text-red-500'>
								{formik.errors.password}
							</div>
						)}
					</div>
				</CardContent>
				<CardFooter>
					<Button
						type='submit'
						className='w-full'
						disabled={isSubmitting || !formik.isValid || !formik.dirty}>
						{isSubmitting ? (
							<span className='flex items-center gap-2'>
								<span className='h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent' />
								Signing in...
							</span>
						) : (
							"Sign in"
						)}
					</Button>
				</CardFooter>
			</form>
		</Card>
	);
}
