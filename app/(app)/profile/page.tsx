import { requireUser } from "@/lib/session";
import type { Metadata } from "next";
import { AccountForm, AppearanceForm, PasswordForm, SignOut } from "./profile-forms";

export const metadata: Metadata = { title: "Profile" };

export default async function ProfilePage() {
	const user = await requireUser();
	return (
		<div className='space-y-10'>
			<div>
				<h1 className='text-3xl font-semibold tracking-tight'>Profile</h1>
				<p className='mt-2 break-all text-muted-foreground'>Signed in as {user.email}</p>
			</div>
			<AccountForm name={user.name ?? ""} currency={user.currency} />
			<AppearanceForm />
			<PasswordForm />
			<SignOut />
		</div>
	);
}
