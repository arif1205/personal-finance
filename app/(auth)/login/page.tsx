import { AuthForm } from "@/components/app/auth-form";
import type { Metadata } from "next";
import { Suspense } from "react";

export const metadata: Metadata = { title: "Sign in" };

export default function LoginPage() {
	return (
		<Suspense>
			<AuthForm mode='login' />
		</Suspense>
	);
}
