"use client";
import { ChangePasswordForm } from "@/components/profile/change-password-form";
import { UpdateProfileForm } from "@/components/profile/update-profile-form";

export default function ProfilePage() {
	return (
		<div className='container space-y-6'>
			<h1 className='text-2xl font-semibold tracking-tight'>
				Profile Settings
			</h1>
			<div className='grid gap-4 md:grid-cols-2'>
				<UpdateProfileForm />
				<ChangePasswordForm />
			</div>
		</div>
	);
}
