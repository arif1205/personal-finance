import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";
import { Auth } from "./auth";
import { db } from "./db";

export const requireUser = cache(async () => {
	const session = await Auth.getServerUser();
	const user = session
		? await db.user.findUnique({
				where: { id: session.userId },
				select: { id: true, name: true, email: true, currency: true },
		  })
		: null;
	if (!user) redirect(session ? "/api/auth/logout" : "/login");
	return user;
});

const FALLBACK_TZ = "Asia/Dhaka";

// The browser writes its timezone to a cookie (see TimezoneSync) so server-rendered dates match the viewer's calendar.
export const getTimeZone = cache(async () => {
	const tz = (await cookies()).get("tz")?.value;
	if (!tz) return FALLBACK_TZ;
	try {
		new Intl.DateTimeFormat("en", { timeZone: tz });
		return tz;
	} catch {
		return FALLBACK_TZ;
	}
});

export function formatDate(date: Date, timeZone: string, opts: Intl.DateTimeFormatOptions = { day: "numeric", month: "short", year: "numeric" }) {
	return new Intl.DateTimeFormat("en-GB", { timeZone, ...opts }).format(date);
}
