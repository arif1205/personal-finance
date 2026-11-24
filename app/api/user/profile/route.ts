import { authedRoute } from "@/lib/api";
import { db } from "@/lib/db";
import { Hash } from "@/lib/hash";
import { Currency } from "@prisma/client";
import { z } from "zod";

const profileSchema = z.object({
	name: z.string().trim().min(2, "Enter at least 2 characters.").max(80, "Keep your name under 80 characters."),
	currency: z.nativeEnum(Currency, { message: "Choose a currency." }),
});

const passwordSchema = z.object({
	currentPassword: z.string().min(1, "Enter your current password."),
	newPassword: z.string().min(8, "Use at least 8 characters.").max(128, "Keep it under 128 characters."),
});

export const PATCH = authedRoute(async ({ userId, req }) => {
	const body = await req.json();
	if ("newPassword" in body) {
		const { currentPassword, newPassword } = passwordSchema.parse(body);
		const user = await db.user.findUniqueOrThrow({ where: { id: userId }, select: { password: true } });
		if (!(await Hash.compare(currentPassword, user.password))) {
			throw new z.ZodError([{ code: "custom", path: ["currentPassword"], message: "Your current password is not correct." }]);
		}
		await db.user.update({ where: { id: userId }, data: { password: await Hash.hash(newPassword) } });
		return;
	}
	await db.user.update({ where: { id: userId }, data: profileSchema.parse(body) });
});
