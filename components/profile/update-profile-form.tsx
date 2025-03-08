"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api } from "@/lib/fetch-wrapper";
import { UpdateNameRequest, updateNameSchema } from "@/lib/validations/user";
import { Currency } from "@prisma/client";
import { useFormik } from "formik";
import { useEffect } from "react";
import { toast } from "sonner";
import { toFormikValidationSchema } from "zod-formik-adapter";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "../ui/select";

interface ProfileResponse {
	success: boolean;
	message?: string;
	data?: {
		name: string;
		currency: Currency;
	};
}

export function UpdateProfileForm() {
	const formik = useFormik<UpdateNameRequest>({
		initialValues: {
			name: "",
			currency: "BDT",
		},
		validationSchema: toFormikValidationSchema(updateNameSchema),
		onSubmit: async (values) => {
			try {
				const response = await api.patch<ProfileResponse>(
					"/user/profile",
					values
				);

				if (response.success) {
					toast.success("Profile updated successfully");
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
					formik.setFieldValue("name", response.data.name);
					formik.setFieldValue("currency", response.data.currency);
				}
			} catch (error) {
				toast.error("Failed to fetch profile data");
			}
		};

		fetchProfile();
	}, []);

	return (
		<Card className='flex flex-col'>
			<CardHeader>
				<CardTitle>Update Profile</CardTitle>
			</CardHeader>
			<form onSubmit={formik.handleSubmit} noValidate className='grow'>
				<CardContent className='space-y-4 h-full'>
					<div className='flex flex-col gap-4 h-full'>
						<div className='grow flex flex-col gap-4'>
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

							<div className='space-y-2'>
								<Label htmlFor='currency'>Currency</Label>
								<Select
									name='currency'
									value={formik.values.currency}
									onValueChange={(value) =>
										formik.setFieldValue("currency", value)
									}
									disabled={formik.isSubmitting}>
									<SelectTrigger>
										<SelectValue placeholder='Select currency' />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value='BDT'>BDT</SelectItem>
										<SelectItem value='USD'>USD</SelectItem>
										<SelectItem value='PKR'>PKR</SelectItem>
										<SelectItem value='INR'>INR</SelectItem>
										<SelectItem value='LKR'>LKR</SelectItem>
										<SelectItem value='EUR'>EUR</SelectItem>
										<SelectItem value='GBP'>GBP</SelectItem>
										<SelectItem value='NOK'>NOK</SelectItem>
										<SelectItem value='SEK'>SEK</SelectItem>
										<SelectItem value='DKK'>DKK</SelectItem>
									</SelectContent>
								</Select>
								{formik.touched.currency && formik.errors.currency && (
									<p className='text-sm text-destructive'>
										{formik.errors.currency}
									</p>
								)}
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
					</div>
				</CardContent>
			</form>
		</Card>
	);
}
