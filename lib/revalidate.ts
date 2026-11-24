"use server";

import { revalidatePath } from "next/cache";

// Revalidating from a server action makes Next drop its client-side router cache, so pages
// prefetched before a change (loan list, loan detail) never show old balances afterwards.
export async function revalidateApp() {
	revalidatePath("/", "layout");
}
