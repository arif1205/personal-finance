import type { Currency, TransactionMethod, TransactionType } from "@prisma/client";

// Balances are floats summed over many payments; treat sub-paisa drift as zero.
const EPSILON = 0.005;
export const MAX_AMOUNT = 1_000_000_000_000;

export type BalanceState = "owed" | "owe" | "settled";

export function balanceState(balance: number): BalanceState {
	if (Math.abs(balance) < EPSILON) return "settled";
	return balance > 0 ? "owed" : "owe";
}

// South Asian currencies read naturally with lakh grouping (12,50,000).
const LAKH_CURRENCIES = new Set<Currency>(["BDT", "INR", "PKR", "LKR"]);

export function formatMoney(amount: number, currency: Currency) {
	const value = Math.abs(amount) < EPSILON ? 0 : Math.abs(amount);
	const whole = Math.abs(value - Math.round(value)) < EPSILON;
	return new Intl.NumberFormat(LAKH_CURRENCIES.has(currency) ? "en-IN" : "en-US", {
		style: "currency",
		currency,
		currencyDisplay: "narrowSymbol",
		minimumFractionDigits: whole ? 0 : 2,
		maximumFractionDigits: 2,
	}).format(value);
}

/** Smaller type for longer figures so big balances stay on one line on phones. */
export function amountSize(text: string) {
	if (text.length > 14) return "text-[1.75rem] sm:text-4xl";
	if (text.length > 10) return "text-[2.125rem] sm:text-5xl";
	return "text-5xl";
}

export const shortBalanceLabel: Record<BalanceState, string> = {
	owed: "Owes you",
	owe: "You owe",
	settled: "Settled",
};

// CREDIT raises the balance (money went out to them); DEBIT lowers it.
export const txLabel: Record<TransactionType, string> = {
	CREDIT: "You gave",
	DEBIT: "You got",
};

export const methodLabel: Record<TransactionMethod, string> = {
	CASH: "Cash",
	BANK_TRANSFER: "Bank transfer",
	MOBILE_BANKING: "Mobile banking",
	CHECK: "Cheque",
	CREDIT_CARD: "Credit card",
	DEBIT_CARD: "Debit card",
	OTHER: "Other",
};

export const CURRENCIES: Currency[] = ["BDT", "USD", "EUR", "GBP", "INR", "PKR", "LKR", "NOK", "SEK", "DKK"];

/** Parses user-typed amounts like "12,500.5". Returns a number or an error message. */
export function parseAmount(input: string): number | string {
	const cleaned = input.replace(/[,\s]/g, "");
	if (!cleaned) return "Enter an amount.";
	if (!/^\d+(\.\d{1,2})?$/.test(cleaned)) return "Use numbers only, with up to 2 decimals.";
	const value = Number(cleaned);
	if (value <= 0) return "Amount must be more than zero.";
	if (value >= MAX_AMOUNT) return "That amount is too large.";
	return value;
}

export function balanceDelta(type: TransactionType, amount: number) {
	return type === "CREDIT" ? amount : -amount;
}

/** "2026-11-24" from a Date, in the viewer's local calendar. */
export function toDateInput(date: Date) {
	const local = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
	return local.toISOString().slice(0, 10);
}

// Stored at noon UTC so the calendar day survives any viewer timezone within ±11h.
export function fromDateInput(value: string) {
	return new Date(`${value}T12:00:00.000Z`);
}
