"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api } from "@/lib/fetch-wrapper";
import {
	ChangePasswordRequest,
	changePasswordSchema,
} from "@/lib/validations/user";
import { useFormik } from "formik";
import { toast } from "sonner";
import { toFormikValidationSchema } from "zod-formik-adapter";

interface PasswordResponse {
	success: boolean;
	message?: string;
}

export function ChangePasswordForm() {
	const formik = useFormik<ChangePasswordRequest>({
		initialValues: {
			currentPassword: "",
			newPassword: "",
			confirmPassword: "",
		},
		validationSchema: toFormikValidationSchema(changePasswordSchema),
		onSubmit: async (values) => {
			try {
				const response = await api.patch<PasswordResponse>(
					"/user/password",
					values
				);

				if (response.success) {
					toast.success("Password updated successfully");
					formik.resetForm();
				} else {
					throw new Error(response.message || "Failed to update password");
				}
			} catch (error) {
				toast.error(
					error instanceof Error ? error.message : "Failed to update password"
				);
			}
		},
	});

	return (
		<Card>
			<CardHeader>
				<CardTitle>Change Password</CardTitle>
			</CardHeader>
			<form onSubmit={formik.handleSubmit} noValidate>
				<CardContent className='space-y-4'>
					<div className='space-y-2'>
						<Label htmlFor='currentPassword'>Current Password</Label>
						<Input
							id='currentPassword'
							name='currentPassword'
							type='password'
							placeholder='Enter current password'
							disabled={formik.isSubmitting}
							onChange={formik.handleChange}
							onBlur={formik.handleBlur}
							value={formik.values.currentPassword}
							className={
								formik.touched.currentPassword && formik.errors.currentPassword
									? "border-destructive"
									: ""
							}
						/>
						{formik.touched.currentPassword &&
							formik.errors.currentPassword && (
								<p className='text-sm text-destructive'>
									{formik.errors.currentPassword}
								</p>
							)}
					</div>

					<div className='space-y-2'>
						<Label htmlFor='newPassword'>New Password</Label>
						<Input
							id='newPassword'
							name='newPassword'
							type='password'
							placeholder='Enter new password'
							disabled={formik.isSubmitting}
							onChange={formik.handleChange}
							onBlur={formik.handleBlur}
							value={formik.values.newPassword}
							className={
								formik.touched.newPassword && formik.errors.newPassword
									? "border-destructive"
									: ""
							}
						/>
						{formik.touched.newPassword && formik.errors.newPassword && (
							<p className='text-sm text-destructive'>
								{formik.errors.newPassword}
							</p>
						)}
						<p className='text-sm text-muted-foreground'>
							Must be at least 6 characters
						</p>
					</div>

					<div className='space-y-2'>
						<Label htmlFor='confirmPassword'>Confirm New Password</Label>
						<Input
							id='confirmPassword'
							name='confirmPassword'
							type='password'
							placeholder='Confirm new password'
							disabled={formik.isSubmitting}
							onChange={formik.handleChange}
							onBlur={formik.handleBlur}
							value={formik.values.confirmPassword}
							className={
								formik.touched.confirmPassword && formik.errors.confirmPassword
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

					<Button
						type='submit'
						className='w-full'
						disabled={formik.isSubmitting || !formik.isValid || !formik.dirty}>
						{formik.isSubmitting ? (
							<span className='flex items-center gap-2'>
								<span className='h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent' />
								Updating...
							</span>
						) : (
							"Change Password"
						)}
					</Button>
				</CardContent>
			</form>
		</Card>
	);
}
