import {
	Currency,
	LoanStatus,
	TransactionMethod,
	TransactionType,
	User,
} from "@prisma/client";

export interface ProfileResponse {
	success: boolean;
	message?: string;
	data?: {
		name: string;
		currency: Currency;
	};
}

export interface Transaction {
	id: string;
	amount: number;
	type: TransactionType;
	date: string;
	description?: string | null;
	method: TransactionMethod;
	methodDetails?: string | null;
	transactionId?: string | null;
}

export interface Loan {
	id: string;
	title: string;
	description: string | null;
	balance: number;
	status: LoanStatus;
	createdAt: string;
	updatedAt: string;
	transactions: Transaction[];
	user?: User;
}

export interface LoanResponse {
	success: boolean;
	data: {
		loan: Loan;
	};
}
