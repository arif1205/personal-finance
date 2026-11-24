import { AuthForm } from "@/components/app/auth-form";
import type { Metadata } from "next";
import { Suspense } from "react";

export const metadata: Metadata = { title: "Create account" };

export default function RegisterPage() {
	return (
		<Suspense>
			<AuthForm mode='register' />
		</Suspense>
	);
}
