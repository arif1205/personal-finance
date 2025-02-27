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
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/lib/fetch-wrapper";
import { EditLoanFormValues, editLoanSchema } from "@/lib/validations/loans";
import { useFormik } from "formik";
import { ArrowLeftIcon } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { toFormikValidationSchema } from "zod-formik-adapter";

interface LoanResponse {
	success: boolean;
	data: {
		loan: {
			title: string;
			description: string | null;
		};
	};
}

export default function EditLoanPage() {
	const params = useParams();
	const router = useRouter();
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	const formik = useFormik<EditLoanFormValues>({
		initialValues: {
			title: "",
			description: "",
		},
		validationSchema: toFormikValidationSchema(editLoanSchema),
		onSubmit: async (values) => {
			try {
				const response = await api.patch<{
					success: boolean;
					message: string;
					data: { title: string };
				}>(`/loans/${params.title}`, values);

				if (!response.success) {
					throw new Error(response.message);
				}

				toast.success("Loan updated successfully");
				router.push(`/loans/${response.data.title}`);
			} catch (error) {
				toast.error(
					error instanceof Error ? error.message : "Failed to update loan"
				);
			}
		},
	});

	useEffect(() => {
		const fetchLoan = async () => {
			try {
				setIsLoading(true);
				const response = await api.get<LoanResponse>(`/loans/${params.title}`);

				if (response.success) {
					formik.setValues({
						title: response.data.loan.title,
						description: response.data.loan.description || "",
					});
				}
			} catch (error) {
				setError(
					error instanceof Error
						? error.message
						: "Failed to fetch loan details"
				);
			} finally {
				setIsLoading(false);
			}
		};

		if (params.title) {
			fetchLoan();
		}
	}, [params.title]);

	if (isLoading) {
		return (
			<div className='space-y-4'>
				<div className='h-8 w-32 animate-pulse rounded bg-muted' />
				<Card className='animate-pulse'>
					<CardHeader className='space-y-2'>
						<div className='h-6 w-1/4 rounded bg-muted' />
						<div className='h-4 w-1/3 rounded bg-muted' />
					</CardHeader>
					<CardContent className='space-y-4'>
						<div className='h-12 w-1/2 rounded bg-muted' />
					</CardContent>
				</Card>
			</div>
		);
	}

	if (error) {
		return (
			<div className='flex flex-col items-center justify-center gap-4 py-12'>
				<p className='text-lg text-muted-foreground'>{error}</p>
				<Button variant='outline' onClick={() => router.back()}>
					Go Back
				</Button>
			</div>
		);
	}

	return (
		<div className='space-y-6'>
			<Button variant='ghost' asChild className='gap-2'>
				<Link href={`/loans/${params.title}`}>
					<ArrowLeftIcon className='h-4 w-4' />
					Back to Loan Details
				</Link>
			</Button>

			<Card>
				<CardHeader>
					<CardTitle>Edit Loan</CardTitle>
					<CardDescription>Update your loan information</CardDescription>
				</CardHeader>
				<form onSubmit={formik.handleSubmit} noValidate>
					<CardContent className='space-y-6'>
						<div className='space-y-4'>
							<div className='space-y-2'>
								<Label htmlFor='title'>Loan Title</Label>
								<Input
									id='title'
									name='title'
									placeholder='e.g., House Rent Loan'
									disabled={formik.isSubmitting}
									onChange={formik.handleChange}
									onBlur={formik.handleBlur}
									value={formik.values.title}
									className={
										formik.touched.title && formik.errors.title
											? "border-destructive"
											: ""
									}
								/>
								{formik.touched.title && formik.errors.title && (
									<p className='text-sm text-destructive'>
										{formik.errors.title}
									</p>
								)}
							</div>

							<div className='space-y-2'>
								<Label htmlFor='description'>Description (Optional)</Label>
								<Textarea
									id='description'
									name='description'
									placeholder='Add any additional details about the loan'
									disabled={formik.isSubmitting}
									onChange={formik.handleChange}
									onBlur={formik.handleBlur}
									value={formik.values.description || ""}
								/>
							</div>
						</div>
					</CardContent>

					<CardFooter className='flex gap-2 justify-end'>
						<Button
							type='button'
							variant='outline'
							onClick={() => router.back()}
							disabled={formik.isSubmitting}>
							Cancel
						</Button>
						<Button
							type='submit'
							disabled={
								formik.isSubmitting || !formik.isValid || !formik.dirty
							}>
							{formik.isSubmitting ? (
								<span className='flex items-center gap-2'>
									<span className='h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent' />
									Updating...
								</span>
							) : (
								"Update Loan"
							)}
						</Button>
					</CardFooter>
				</form>
			</Card>
		</div>
	);
}
