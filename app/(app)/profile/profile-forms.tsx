"use client";

import { Button } from "@/components/ui/button";
import { Field, Input, Select } from "@/components/ui/field";
import { api } from "@/lib/fetch-wrapper";
import { CURRENCIES } from "@/lib/money";
import type { Currency } from "@prisma/client";
import { useTheme } from "next-themes";
import { revalidateApp } from "@/lib/revalidate";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

const currencyName = new Intl.DisplayNames(["en"], { type: "currency" });

function Section({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
	return (
		<section aria-labelledby={id} className='rounded-2xl border bg-card p-4 shadow-sm sm:p-6'>
			<h2 id={id} className='mb-5 text-xl font-semibold'>
				{title}
			</h2>
			{children}
		</section>
	);
}

export function AccountForm({ name: initialName, currency: initialCurrency }: { name: string; currency: Currency }) {
	const router = useRouter();
	const [name, setName] = useState(initialName);
	const [currency, setCurrency] = useState(initialCurrency);
	const [error, setError] = useState<string>();
	const [pending, setPending] = useState(false);
	const unchanged = name === initialName && currency === initialCurrency;

	return (
		<Section id='account' title='Account'>
			<form
				noValidate
				className='space-y-5'
				onSubmit={async (e) => {
					e.preventDefault();
					if (name.trim().length < 2) return setError("Enter at least 2 characters.");
					setPending(true);
					try {
						await api.patch("/user/profile", { name, currency });
						toast.success("Profile saved");
						await revalidateApp();
					} catch (err) {
						toast.error(err instanceof Error ? err.message : "Profile not saved. Try again.");
					} finally {
						setPending(false);
					}
				}}>
				<Field id='name' label='Your name' error={error}>
					{(a11y) => (
						<Input
							{...a11y}
							value={name}
							autoComplete='name'
							maxLength={80}
							onChange={(e) => {
								setName(e.target.value);
								setError(undefined);
							}}
						/>
					)}
				</Field>
				<Field id='currency' label='Currency' hint='Amounts are shown in this currency. Existing numbers are not converted.'>
					{(a11y) => (
						<Select {...a11y} value={currency} onChange={(e) => setCurrency(e.target.value as Currency)}>
							{CURRENCIES.map((c) => (
								<option key={c} value={c}>
									{c}, {currencyName.of(c)}
								</option>
							))}
						</Select>
					)}
				</Field>
				<Button type='submit' pending={pending} disabled={unchanged} className='w-full sm:w-auto'>
					Save profile
				</Button>
			</form>
		</Section>
	);
}

export function AppearanceForm() {
	const { theme, setTheme } = useTheme();
	const [mounted, setMounted] = useState(false);
	useEffect(() => setMounted(true), []);

	return (
		<Section id='appearance' title='Appearance'>
			<fieldset>
				<legend className='mb-2 text-[15px] font-medium'>Theme</legend>
				<div className='grid grid-cols-3 gap-1 rounded-xl bg-muted p-1'>
					{[
						["system", "Automatic"],
						["light", "Light"],
						["dark", "Dark"],
					].map(([value, label]) => (
						<label
							key={value}
							className='flex min-h-12 cursor-pointer items-center justify-center rounded-lg text-[15px] font-medium text-muted-foreground transition-colors has-[:checked]:bg-card has-[:checked]:text-foreground has-[:checked]:shadow-sm has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ring'>
							<input type='radio' name='theme' value={value} checked={mounted && theme === value} onChange={() => setTheme(value)} className='sr-only' />
							{label}
						</label>
					))}
				</div>
				<p className='mt-2 text-sm text-muted-foreground'>Automatic follows your device setting.</p>
			</fieldset>
		</Section>
	);
}

export function PasswordForm() {
	const [current, setCurrent] = useState("");
	const [next, setNext] = useState("");
	const [errors, setErrors] = useState<{ current?: string; next?: string }>({});
	const [pending, setPending] = useState(false);

	return (
		<Section id='password' title='Password'>
			<form
				noValidate
				className='space-y-5'
				onSubmit={async (e) => {
					e.preventDefault();
					const errs = { current: current ? undefined : "Enter your current password.", next: next.length >= 8 ? undefined : "Use at least 8 characters." };
					setErrors(errs);
					if (errs.current || errs.next) return document.getElementById(errs.current ? "current-password" : "new-password")?.focus();
					setPending(true);
					try {
						await api.patch("/user/profile", { currentPassword: current, newPassword: next });
						toast.success("Password changed");
						setCurrent("");
						setNext("");
					} catch (err) {
						const message = err instanceof Error ? err.message : "Password not changed. Try again.";
						if (message.includes("current")) setErrors({ current: message });
						else toast.error(message);
					} finally {
						setPending(false);
					}
				}}>
				<Field id='current-password' label='Current password' error={errors.current}>
					{(a11y) => <Input {...a11y} type='password' autoComplete='current-password' value={current} onChange={(e) => setCurrent(e.target.value)} />}
				</Field>
				<Field id='new-password' label='New password' hint='At least 8 characters.' error={errors.next}>
					{(a11y) => <Input {...a11y} type='password' autoComplete='new-password' value={next} onChange={(e) => setNext(e.target.value)} />}
				</Field>
				<Button type='submit' pending={pending} className='w-full sm:w-auto'>
					Change password
				</Button>
			</form>
		</Section>
	);
}

export function SignOut() {
	const router = useRouter();
	const [pending, setPending] = useState(false);
	return (
		<Button
			variant='secondary'
			pending={pending}
			className='w-full'
			onClick={async () => {
				setPending(true);
				try {
					await api.post("/auth/logout");
					await revalidateApp();
					router.replace("/login");
				} catch {
					toast.error("Couldn't sign out. Check your connection and try again.");
					setPending(false);
				}
			}}>
			Sign out
		</Button>
	);
}
