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
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/lib/fetch-wrapper";
import {
	CreateLoanFormValues,
	createLoanSchema,
} from "@/lib/validations/loans";
import { useFormik } from "formik";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { toFormikValidationSchema } from "zod-formik-adapter";

export default function CreateLoanPage() {
	const router = useRouter();

	const formik = useFormik<CreateLoanFormValues>({
		initialValues: {
			title: "",
			description: "",
			initialBalance: 0,
			type: "LEND",
			transactionDetails: {
				date: new Date().toISOString(),
				method: "CASH",
				methodDetails: "",
				transactionId: "",
				description: "",
			},
		},
		validationSchema: toFormikValidationSchema(createLoanSchema),
		onSubmit: async (values) => {
			try {
				const response = await api.post<{
					success: boolean;
					message: string;
					data: { title: string };
				}>("/loans", values);

				if (!response.success) {
					throw new Error(response.message);
				}

				toast.success("Loan created successfully");
				router.push("/loans/" + response.data.title);
			} catch (error) {
				toast.error(
					error instanceof Error ? error.message : "Failed to create loan"
				);
			}
		},
	});

	return (
		<div className='container max-w-2xl'>
			<Card>
				<CardHeader>
					<CardTitle>Create New Loan</CardTitle>
					<CardDescription>
						Enter the details of your new loan or credit
					</CardDescription>
				</CardHeader>
				<form onSubmit={formik.handleSubmit} noValidate>
					<CardContent className='space-y-6'>
						{/* Basic Loan Information */}
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

							<div className='grid gap-4 md:grid-cols-2'>
								<div className='space-y-2'>
									<Label htmlFor='type'>Loan Type</Label>
									<Select
										name='type'
										defaultValue={formik.values.type}
										onValueChange={(value) =>
											formik.setFieldValue("type", value)
										}
										disabled={formik.isSubmitting}>
										<SelectTrigger>
											<SelectValue placeholder='Select loan type' />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value='LEND'>I am giving</SelectItem>
											<SelectItem value='BORROW'>I am taking</SelectItem>
										</SelectContent>
									</Select>
								</div>

								<div className='space-y-2'>
									<Label htmlFor='initialBalance'>Amount</Label>
									<Input
										id='initialBalance'
										name='initialBalance'
										type='number'
										min='0'
										step='0.01'
										placeholder='0.00'
										disabled={formik.isSubmitting}
										onChange={(e) =>
											formik.setFieldValue(
												"initialBalance",
												parseFloat(e.target.value) || 0
											)
										}
										onBlur={formik.handleBlur}
										value={formik.values.initialBalance}
										className={
											formik.touched.initialBalance &&
											formik.errors.initialBalance
												? "border-destructive"
												: ""
										}
									/>
									{formik.touched.initialBalance &&
										formik.errors.initialBalance && (
											<p className='text-sm text-destructive'>
												{formik.errors.initialBalance}
											</p>
										)}
								</div>
							</div>
						</div>

						{/* Transaction Details */}
						<div className='space-y-4'>
							<h3 className='font-medium'>Transaction Details</h3>

							<div className='grid gap-4 md:grid-cols-2'>
								<div className='space-y-2'>
									<Label>Transaction Date</Label>
									<DatePicker
										date={
											formik.values.transactionDetails.date
												? new Date(formik.values.transactionDetails.date)
												: new Date()
										}
										onChange={(newDate: Date | undefined) => {
											formik.setFieldValue(
												"transactionDetails.date",
												newDate
													? newDate.toISOString()
													: new Date().toISOString()
											);
										}}
										disabled={formik.isSubmitting}
									/>
									{formik.touched.transactionDetails?.date &&
										formik.errors.transactionDetails?.date && (
											<p className='text-sm text-destructive'>
												{formik.errors.transactionDetails.date}
											</p>
										)}
								</div>

								<div className='space-y-2'>
									<Label htmlFor='transactionDetails.method'>
										Payment Method
									</Label>
									<Select
										name='transactionDetails.method'
										defaultValue={formik.values.transactionDetails.method}
										onValueChange={(value) =>
											formik.setFieldValue("transactionDetails.method", value)
										}
										disabled={formik.isSubmitting}>
										<SelectTrigger>
											<SelectValue placeholder='Select payment method' />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value='CASH'>Cash</SelectItem>
											<SelectItem value='BANK_TRANSFER'>
												Bank Transfer
											</SelectItem>
											<SelectItem value='CHECK'>Check</SelectItem>
											<SelectItem value='CREDIT_CARD'>Credit Card</SelectItem>
											<SelectItem value='DEBIT_CARD'>Debit Card</SelectItem>
											<SelectItem value='MOBILE_BANKING'>
												Mobile Banking
											</SelectItem>
											<SelectItem value='OTHER'>Other</SelectItem>
										</SelectContent>
									</Select>
								</div>
							</div>

							<div className='space-y-2'>
								<Label htmlFor='transactionDetails.description'>
									Transaction Description (Optional)
								</Label>
								<Textarea
									id='transactionDetails.description'
									name='transactionDetails.description'
									placeholder='Describe the purpose or details of this transaction'
									disabled={formik.isSubmitting}
									onChange={formik.handleChange}
									onBlur={formik.handleBlur}
									value={formik.values.transactionDetails.description || ""}
								/>
							</div>

							<div className='space-y-2'>
								<Label htmlFor='transactionDetails.methodDetails'>
									Payment Details (Optional)
								</Label>
								<Input
									id='transactionDetails.methodDetails'
									name='transactionDetails.methodDetails'
									placeholder='e.g., Bank name, account number, etc.'
									disabled={formik.isSubmitting}
									onChange={formik.handleChange}
									onBlur={formik.handleBlur}
									value={formik.values.transactionDetails.methodDetails || ""}
								/>
							</div>

							<div className='space-y-2'>
								<Label htmlFor='transactionDetails.transactionId'>
									Transaction ID (Optional)
								</Label>
								<Input
									id='transactionDetails.transactionId'
									name='transactionDetails.transactionId'
									placeholder='e.g., Check number, transaction reference'
									disabled={formik.isSubmitting}
									onChange={formik.handleChange}
									onBlur={formik.handleBlur}
									value={formik.values.transactionDetails.transactionId || ""}
								/>
							</div>
						</div>
					</CardContent>

					<CardFooter>
						<Button
							type='submit'
							className='w-full'
							disabled={
								formik.isSubmitting || !formik.isValid || !formik.dirty
							}>
							{formik.isSubmitting ? (
								<span className='flex items-center gap-2'>
									<span className='h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent' />
									Creating loan...
								</span>
							) : (
								"Create Loan"
							)}
						</Button>
					</CardFooter>
				</form>
			</Card>
		</div>
	);
}
