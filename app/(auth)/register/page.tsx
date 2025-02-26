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
import { RegisterRequest, registerSchema } from "@/lib/validations/auth";
import { useFormik } from "formik";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { toFormikValidationSchema } from "zod-formik-adapter";

interface RegisterResponse {
	success: boolean;
	message?: string;
}

export default function RegisterPage() {
	const router = useRouter();
	const searchParams = useSearchParams();

	const formik = useFormik<RegisterRequest>({
		initialValues: {
			name: "",
			email: "",
			password: "",
			confirmPassword: "",
		},
		validationSchema: toFormikValidationSchema(registerSchema),
		onSubmit: async (values) => {
			try {
				const response = await api.post<RegisterResponse>("/auth/register", {
					name: values.name,
					email: values.email,
					password: values.password,
				});

				if (response.success) {
					toast.success("Registration successful");
					router.push(
						`/login${
							searchParams.get("from")
								? `?from=${searchParams.get("from")}`
								: ""
						}`
					);
				} else {
					throw new Error(response.message || "Failed to register");
				}
			} catch (error) {
				toast.error(
					error instanceof Error ? error.message : "Failed to register"
				);
			}
		},
	});

	return (
		<div className='container max-w-lg flex items-center justify-center'>
			<Card className='w-full'>
				<CardHeader className='space-y-1'>
					<CardTitle className='text-2xl text-center'>
						Create an account
					</CardTitle>
					<CardDescription className='text-center'>
						Enter your information to create your account
					</CardDescription>
				</CardHeader>
				<form onSubmit={formik.handleSubmit} noValidate>
					<CardContent className='space-y-4'>
						<div className='space-y-2'>
							<Label htmlFor='name'>Name</Label>
							<Input
								id='name'
								name='name'
								placeholder='John Doe'
								disabled={formik.isSubmitting}
								onChange={formik.handleChange}
								onBlur={formik.handleBlur}
								value={formik.values.name}
								className={
									formik.touched.name && formik.errors.name
										? "border-destructive"
										: ""
								}
							/>
							{formik.touched.name && formik.errors.name && (
								<p className='text-sm text-destructive'>{formik.errors.name}</p>
							)}
						</div>

						<div className='space-y-2'>
							<Label htmlFor='email'>Email</Label>
							<Input
								id='email'
								name='email'
								type='email'
								placeholder='john@example.com'
								disabled={formik.isSubmitting}
								onChange={formik.handleChange}
								onBlur={formik.handleBlur}
								value={formik.values.email}
								className={
									formik.touched.email && formik.errors.email
										? "border-destructive"
										: ""
								}
							/>
							{formik.touched.email && formik.errors.email && (
								<p className='text-sm text-destructive'>
									{formik.errors.email}
								</p>
							)}
						</div>

						<div className='space-y-2'>
							<Label htmlFor='password'>Password</Label>
							<Input
								id='password'
								name='password'
								type='password'
								placeholder='Enter your password'
								disabled={formik.isSubmitting}
								onChange={formik.handleChange}
								onBlur={formik.handleBlur}
								value={formik.values.password}
								className={
									formik.touched.password && formik.errors.password
										? "border-destructive"
										: ""
								}
							/>
							{formik.touched.password && formik.errors.password && (
								<p className='text-sm text-destructive'>
									{formik.errors.password}
								</p>
							)}
							<p className='text-sm text-muted-foreground'>
								Must be at least 6 characters
							</p>
						</div>

						<div className='space-y-2'>
							<Label htmlFor='confirmPassword'>Confirm Password</Label>
							<Input
								id='confirmPassword'
								name='confirmPassword'
								type='password'
								placeholder='Confirm your password'
								disabled={formik.isSubmitting}
								onChange={formik.handleChange}
								onBlur={formik.handleBlur}
								value={formik.values.confirmPassword}
								className={
									formik.touched.confirmPassword &&
									formik.errors.confirmPassword
										? "border-destructive"
										: ""
								}
							/>
							{formik.touched.confirmPassword &&
								formik.errors.confirmPassword && (
									<p className='text-sm text-destructive'>
										{formik.errors.confirmPassword}
									</p>
								)}
						</div>
					</CardContent>

					<CardFooter className='flex flex-col space-y-4'>
						<Button
							type='submit'
							className='w-full'
							disabled={
								formik.isSubmitting || !formik.isValid || !formik.dirty
							}>
							{formik.isSubmitting ? (
								<span className='flex items-center gap-2'>
									<span className='h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent' />
									Creating account...
								</span>
							) : (
								"Create account"
							)}
						</Button>
						<p className='text-sm text-center text-muted-foreground'>
							Already have an account?{" "}
							<Link
								href={`/login${
									searchParams.get("from")
										? `?from=${searchParams.get("from")}`
										: ""
								}`}
								className='text-primary underline-offset-4 hover:underline'>
								Login here
							</Link>
						</p>
					</CardFooter>
				</form>
			</Card>
		</div>
	);
}
