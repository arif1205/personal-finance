"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DatePicker } from "@/components/ui/date-picker";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { api } from "@/lib/fetch-wrapper";
import {
	TransactionFormValues,
	transactionSchema,
} from "@/lib/validations/transaction";
import {
	Transaction,
	TransactionMethod,
	TransactionType,
} from "@prisma/client";
import { useFormik } from "formik";
import { ArrowLeftIcon } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { toFormikValidationSchema } from "zod-formik-adapter";

interface TransactionResponse {
	success: boolean;
	message: string;
	data: {
		transaction: Transaction;
	};
}

export default function EditTransactionPage() {
	const params = useParams();
	const router = useRouter();
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	const formik = useFormik<TransactionFormValues>({
		initialValues: {
			amount: 0,
			type: TransactionType.CREDIT,
			date: new Date().toISOString(),
			description: "",
			method: TransactionMethod.CASH,
			methodDetails: "",
			transactionId: "",
		},
		validationSchema: toFormikValidationSchema(transactionSchema),
		onSubmit: async (values) => {
			try {
				const formattedValues = {
					...values,
					date: new Date(values.date).toISOString(),
				};

				const response = await api.patch<TransactionResponse>(
					`/loans/${params.title}/transaction/${params.id}`,
					formattedValues
				);

				if (!response.success) {
					throw new Error(response.message);
				}

				toast.success("Transaction updated successfully");
				router.push(`/loans/${params.title}`);
				router.refresh();
			} catch (error) {
				toast.error(
					error instanceof Error
						? error.message
						: "Failed to update transaction"
				);
			}
		},
	});

	useEffect(() => {
		const fetchTransaction = async () => {
			try {
				setIsLoading(true);
				const response = await api.get<TransactionResponse>(
					`/loans/${params.title}/transaction/${params.id}`
				);

				if (!response.success) {
					throw new Error(response.message);
				}

				const transaction = response.data.transaction;
				formik.setValues({
					amount: transaction.amount,
					type: transaction.type,
					date: new Date(transaction.date).toISOString(),
					description: transaction.description || "",
					method: transaction.method,
					methodDetails: transaction.methodDetails || "",
					transactionId: transaction.transactionId || "",
				});
			} catch (error) {
				setError(
					error instanceof Error ? error.message : "Failed to fetch transaction"
				);
			} finally {
				setIsLoading(false);
			}
		};

		if (params.title && params.id) {
			fetchTransaction();
		}
	}, [params.title, params.id]);

	if (isLoading) {
		return (
			<div className='space-y-4'>
				<div className='h-8 w-32 animate-pulse rounded bg-muted' />
				<Card className='animate-pulse'>
					<CardHeader className='space-y-2'>
						<div className='h-6 w-1/4 rounded bg-muted' />
					</CardHeader>
					<CardContent className='space-y-4'>
						{Array(4)
							.fill(0)
							.map((_, i) => (
								<div key={i} className='h-12 w-full rounded bg-muted' />
							))}
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
		<div className='space-y-6 container max-w-2xl'>
			<Button variant='ghost' asChild className='gap-2'>
				<Link href={`/loans/${params.title}`}>
					<ArrowLeftIcon className='h-4 w-4' />
					Back to Loan
				</Link>
			</Button>

			<Card>
				<CardHeader>
					<CardTitle>
						Edit Transaction for {decodeURIComponent(params.title as string)}
					</CardTitle>
				</CardHeader>
				<CardContent>
					<form onSubmit={formik.handleSubmit} noValidate className='space-y-6'>
						<div className='space-y-4'>
							<div className='grid gap-4 md:grid-cols-2'>
								<div className='space-y-2'>
									<Label htmlFor='type'>Transaction Type</Label>
									<Select
										name='type'
										defaultValue={formik.values.type}
										onValueChange={(value) =>
											formik.setFieldValue("type", value)
										}
										disabled={formik.isSubmitting}>
										<SelectTrigger>
											<SelectValue placeholder='Select transaction type' />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value={TransactionType.CREDIT}>
												Payment Given
											</SelectItem>
											<SelectItem value={TransactionType.DEBIT}>
												Payment Received
											</SelectItem>
										</SelectContent>
									</Select>
									{formik.touched.type && formik.errors.type && (
										<p className='text-sm text-destructive'>
											{formik.errors.type}
										</p>
									)}
								</div>

								<div className='space-y-2'>
									<Label htmlFor='amount'>Amount</Label>
									<Input
										id='amount'
										name='amount'
										type='number'
										min='0'
										step='0.01'
										placeholder='0.00'
										disabled={formik.isSubmitting}
										onChange={(e) =>
											formik.setFieldValue(
												"amount",
												parseFloat(e.target.value) || 0
											)
										}
										onBlur={formik.handleBlur}
										value={formik.values.amount}
										className={
											formik.touched.amount && formik.errors.amount
												? "border-destructive"
												: ""
										}
									/>
									{formik.touched.amount && formik.errors.amount && (
										<p className='text-sm text-destructive'>
											{formik.errors.amount}
										</p>
									)}
								</div>
							</div>

							<div className='grid gap-4 md:grid-cols-2'>
								<div className='space-y-2'>
									<Label>Transaction Date</Label>
									<DatePicker
										date={
											formik.values.date
												? new Date(formik.values.date)
												: new Date()
										}
										onChange={(newDate: Date | undefined) => {
											formik.setFieldValue(
												"date",
												newDate
													? newDate.toISOString()
													: new Date().toISOString()
											);
										}}
										disabled={formik.isSubmitting}
									/>
									{formik.touched.date && formik.errors.date && (
										<p className='text-sm text-destructive'>
											{formik.errors.date}
										</p>
									)}
								</div>

								<div className='space-y-2'>
									<Label htmlFor='method'>Payment Method</Label>
									<Select
										name='method'
										defaultValue={formik.values.method}
										onValueChange={(value) =>
											formik.setFieldValue("method", value)
										}
										disabled={formik.isSubmitting}>
										<SelectTrigger>
											<SelectValue placeholder='Select payment method' />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value={TransactionMethod.CASH}>
												Cash
											</SelectItem>
											<SelectItem value={TransactionMethod.BANK_TRANSFER}>
												Bank Transfer
											</SelectItem>
											<SelectItem value={TransactionMethod.CHECK}>
												Check
											</SelectItem>
											<SelectItem value={TransactionMethod.CREDIT_CARD}>
												Credit Card
											</SelectItem>
											<SelectItem value={TransactionMethod.DEBIT_CARD}>
												Debit Card
											</SelectItem>
											<SelectItem value={TransactionMethod.MOBILE_BANKING}>
												Mobile Banking
											</SelectItem>
											<SelectItem value={TransactionMethod.OTHER}>
												Other
											</SelectItem>
										</SelectContent>
									</Select>
									{formik.touched.method && formik.errors.method && (
										<p className='text-sm text-destructive'>
											{formik.errors.method}
										</p>
									)}
								</div>
							</div>

							<div className='space-y-2'>
								<Label htmlFor='methodDetails'>
									Payment Details (Optional)
								</Label>
								<Input
									id='methodDetails'
									name='methodDetails'
									placeholder='e.g., Bank name, account number, etc.'
									disabled={formik.isSubmitting}
									onChange={formik.handleChange}
									onBlur={formik.handleBlur}
									value={formik.values.methodDetails || ""}
								/>
								<p className='text-sm text-muted-foreground'>
									Additional details about the payment method
								</p>
							</div>

							<div className='space-y-2'>
								<Label htmlFor='transactionId'>Transaction ID (Optional)</Label>
								<Input
									id='transactionId'
									name='transactionId'
									placeholder='e.g., Check number, transaction reference'
									disabled={formik.isSubmitting}
									onChange={formik.handleChange}
									onBlur={formik.handleBlur}
									value={formik.values.transactionId || ""}
								/>
								<p className='text-sm text-muted-foreground'>
									Reference number for this transaction
								</p>
							</div>

							<div className='space-y-2'>
								<Label htmlFor='description'>Description (Optional)</Label>
								<Input
									id='description'
									name='description'
									placeholder='Add any notes about this transaction'
									disabled={formik.isSubmitting}
									onChange={formik.handleChange}
									onBlur={formik.handleBlur}
									value={formik.values.description || ""}
								/>
								<p className='text-sm text-muted-foreground'>
									Additional notes about this transaction
								</p>
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
									Updating Transaction...
								</span>
							) : (
								"Update Transaction"
							)}
						</Button>
					</form>
				</CardContent>
			</Card>
		</div>
	);
}
