"use client";

import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/field";
import { api } from "@/lib/fetch-wrapper";
import { Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { revalidateApp } from "@/lib/revalidate";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

// Only same-origin paths, so a crafted ?from= link can't send people to another site after sign-in.
function safeRedirect(from: string | null) {
	if (!from) return "/";
	try {
		const url = new URL(from, window.location.origin);
		const path = url.pathname + url.search + url.hash;
		// "//host" or "/\\host" would be read as another site even after the origin check.
		return url.origin === window.location.origin && !/^\/[\/\\]/.test(path) ? path : "/";
	} catch {
		return "/";
	}
}

export function AuthForm({ mode }: { mode: "login" | "register" }) {
	const router = useRouter();
	const from = useSearchParams().get("from");
	const [values, setValues] = useState({ name: "", email: "", password: "" });
	const [errors, setErrors] = useState<Partial<Record<keyof typeof values | "form", string>>>({});
	const [showPassword, setShowPassword] = useState(false);
	const [pending, setPending] = useState(false);
	const register = mode === "register";

	const set = (key: keyof typeof values) => (e: React.ChangeEvent<HTMLInputElement>) => {
		setValues((v) => ({ ...v, [key]: e.target.value }));
		setErrors((er) => ({ ...er, [key]: undefined, form: undefined }));
	};

	const submit = async (e: React.FormEvent) => {
		e.preventDefault();
		const next: typeof errors = {};
		if (register && values.name.trim().length < 2) next.name = "Enter at least 2 characters.";
		if (!/^\S+@\S+\.\S+$/.test(values.email.trim())) next.email = "Enter a valid email, like name@example.com.";
		if (register ? values.password.length < 8 : !values.password) next.password = register ? "Use at least 8 characters." : "Enter your password.";
		setErrors(next);
		const first = Object.keys(next)[0];
		if (first) return document.getElementById(first)?.focus();

		setPending(true);
		try {
			await api.post(register ? "/auth/register" : "/auth/login", values);
			await revalidateApp();
			router.replace(safeRedirect(from));
		} catch (err) {
			setErrors({ form: err instanceof Error ? err.message : "Something went wrong. Try again." });
			setPending(false);
		}
	};

	const switchHref = `${register ? "/login" : "/register"}${from ? `?from=${encodeURIComponent(from)}` : ""}`;

	return (
		<>
			<h1 className='text-3xl font-semibold tracking-tight'>{register ? "Create your account" : "Sign in"}</h1>
			<p className='mt-2 text-muted-foreground'>{register ? "Track who owes you and who you owe." : "Welcome back. Pick up where you left off."}</p>

			<form onSubmit={submit} noValidate className='mt-8 space-y-5'>
				{errors.form && (
					<p role='alert' className='rounded-lg border border-danger/40 bg-danger/10 px-4 py-3 text-[15px] font-medium text-danger'>
						{errors.form}
					</p>
				)}
				{register && (
					<Field id='name' label='Your name' error={errors.name}>
						{(a11y) => <Input {...a11y} autoComplete='name' value={values.name} onChange={set("name")} disabled={pending} />}
					</Field>
				)}
				<Field id='email' label='Email' error={errors.email}>
					{(a11y) => <Input {...a11y} type='email' inputMode='email' autoComplete='email' autoCapitalize='none' spellCheck={false} value={values.email} onChange={set("email")} disabled={pending} />}
				</Field>
				<Field id='password' label='Password' hint={register ? "At least 8 characters." : undefined} error={errors.password}>
					{(a11y) => (
						<div className='relative'>
							<Input
								{...a11y}
								type={showPassword ? "text" : "password"}
								autoComplete={register ? "new-password" : "current-password"}
								value={values.password}
								onChange={set("password")}
								disabled={pending}
								className='pr-12'
							/>
							<button
								type='button'
								onClick={() => setShowPassword((s) => !s)}
								aria-label={showPassword ? "Hide password" : "Show password"}
								aria-pressed={showPassword}
								className='absolute right-0.5 top-1/2 flex size-11 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground hover:text-foreground'>
								{showPassword ? <EyeOff aria-hidden className='size-5' /> : <Eye aria-hidden className='size-5' />}
							</button>
						</div>
					)}
				</Field>
				<Button type='submit' pending={pending} className='w-full'>
					{register ? "Create account" : "Sign in"}
				</Button>
			</form>

			<p className='mt-8 text-center text-[15px] text-muted-foreground'>
				{register ? "Already have an account?" : "New here?"}{" "}
				<Link href={switchHref} className='inline-block py-2 font-medium text-primary underline underline-offset-4'>
					{register ? "Sign in" : "Create an account"}
				</Link>
			</p>
		</>
	);
}
