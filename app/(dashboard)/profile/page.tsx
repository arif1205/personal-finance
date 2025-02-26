"use client";

import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api } from "@/lib/fetch-wrapper";
import {
	UpdateProfileRequest,
	updateProfileSchema,
} from "@/lib/validations/user";
import { useFormik } from "formik";
import { useEffect } from "react";
import { toast } from "sonner";
import { toFormikValidationSchema } from "zod-formik-adapter";

interface ProfileResponse {
	success: boolean;
	message?: string;
	data?: {
		name: string;
	};
}

export default function ProfilePage() {
	const formik = useFormik<UpdateProfileRequest>({
		initialValues: {
			name: "",
			currentPassword: "",
			newPassword: "",
			confirmPassword: "",
		},
		validationSchema: toFormikValidationSchema(updateProfileSchema),
		onSubmit: async (values) => {
			try {
				const response = await api.patch<ProfileResponse>(
					"/user/profile",
					values
				);

				if (response.success) {
					toast.success("Profile updated successfully");
					// Reset password fields but keep the name
					formik.setValues({
						...formik.values,
						currentPassword: "",
						newPassword: "",
						confirmPassword: "",
					});
				} else {
					throw new Error(response.message || "Failed to update profile");
				}
			} catch (error) {
				toast.error(
					error instanceof Error ? error.message : "Failed to update profile"
				);
			}
		},
	});

	useEffect(() => {
		const fetchProfile = async () => {
			try {
				const response = await api.get<ProfileResponse>("/user/profile");
				if (response.success && response.data) {
					formik.setValues({
						name: response.data.name,
						currentPassword: "",
						newPassword: "",
						confirmPassword: "",
					});
				}
			} catch (error) {
				toast.error("Failed to fetch profile data");
			}
		};

		fetchProfile();
	}, []);

	return (
		<div className='container max-w-2xl'>
			<Card>
				<CardHeader>
					<CardTitle>Profile Settings</CardTitle>
					<CardDescription>
						Update your profile information and password
					</CardDescription>
				</CardHeader>
				<form onSubmit={formik.handleSubmit} noValidate>
					<CardContent className='space-y-6'>
						<div className='space-y-4'>
							<div className='space-y-2'>
								<Label htmlFor='name'>Name</Label>
								<Input
									id='name'
									name='name'
									placeholder='Your name'
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
									<p className='text-sm text-destructive'>
										{formik.errors.name}
									</p>
								)}
							</div>

							<div className='space-y-4'>
								<h3 className='text-lg font-medium'>Change Password</h3>
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
											formik.touched.currentPassword &&
											formik.errors.currentPassword
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
							</div>
						</div>

						<Button
							type='submit'
							className='w-full'
							disabled={
								formik.isSubmitting || !formik.isValid || !formik.dirty
							}>
							{formik.isSubmitting ? (
								<span className='flex items-center gap-2'>
									<span className='h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent' />
									Updating...
								</span>
							) : (
								"Update Profile"
							)}
						</Button>
					</CardContent>
				</form>
			</Card>
		</div>
	);
}
