"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

// Server components format dates in the timezone from this cookie, so keep it in step with the device.
export function TimezoneSync() {
	const router = useRouter();
	useEffect(() => {
		const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
		const current = document.cookie.match(/(?:^|; )tz=([^;]*)/)?.[1];
		if (tz && decodeURIComponent(current ?? "") !== tz) {
			document.cookie = `tz=${encodeURIComponent(tz)}; path=/; max-age=31536000; samesite=lax`;
			router.refresh();
		}
	}, [router]);
	return null;
}
