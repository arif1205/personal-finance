import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

const unique = () => `${Date.now()}${Math.random().toString(36).slice(2, 7)}`;

async function signUp(page: Page) {
	const email = `e2e-${unique()}@example.com`;
	await page.goto("/register");
	await page.getByLabel("Your name").fill("Test Person");
	await page.getByLabel("Email").fill(email);
	await page.getByLabel("Password", { exact: true }).fill("password123");
	await page.getByRole("button", { name: "Create account" }).click();
	await expect(page).toHaveURL("/");
	return email;
}

async function addLoan(page: Page, name: string, amount: string, kind: "I lent money" | "I borrowed money" = "I lent money") {
	await page.goto("/loans/new");
	await page.getByLabel("Who is it with?").fill(name);
	await page.getByText(kind, { exact: true }).click();
	await page.getByLabel("Amount").fill(amount);
	await page.getByRole("button", { name: "Add loan" }).click();
	await expect(page.getByRole("heading", { level: 1, name })).toBeVisible();
}

async function expectAccessibleAndFits(page: Page) {
	await expect(page).toHaveTitle(/Personal Finance/);
	const { violations } = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"]).analyze();
	expect(violations.map((v) => `${v.id}: ${v.nodes[0]?.target}`)).toEqual([]);
	const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
	expect(overflow, "page should not scroll sideways").toBeLessThanOrEqual(0);
}

test("new account sees an empty state, not an error", async ({ page }) => {
	await signUp(page);
	await expect(page.getByRole("heading", { name: "Nothing to track yet" })).toBeVisible();
	await expectAccessibleAndFits(page);
	await page.goto("/loans");
	await expect(page.locator("main").getByText("No loans yet")).toBeVisible();
});

test("sign-in errors are shown in words, and ?from only redirects on-site", async ({ page }) => {
	await page.goto("/login?from=//evil.example.com");
	await page.getByLabel("Email").fill("nobody@example.com");
	await page.getByLabel("Password", { exact: true }).fill("wrong-password");
	await page.getByRole("button", { name: "Sign in" }).click();
	await expect(page.locator("main p[role=alert]")).toContainText("don't match");

	const email = await signUp(page);
	await page.getByRole("link", { name: "Profile" }).first().click();
	await page.getByRole("button", { name: "Sign out" }).click();
	await expect(page).toHaveURL(/\/login/);
	await page.goto(`/login?from=${encodeURIComponent("/\\evil.example.com")}`);
	await page.getByLabel("Email").fill(email.toUpperCase());
	await page.getByLabel("Password", { exact: true }).fill("password123");
	await page.getByRole("button", { name: "Sign in" }).click();
	await expect(page).toHaveURL("/");
});

test("record, edit and delete payments keeps the balance right", async ({ page }) => {
	await signUp(page);
	const name = `Rahim / Shop #2 ?x=1 & 100% ${unique()}`;
	await addLoan(page, name, "10,000");
	await expect(page.getByText("Owes you", { exact: true })).toBeVisible();
	await expect(page.locator("main")).toContainText("৳10,000");
	await expectAccessibleAndFits(page);

	const amount = page.getByLabel("Amount");
	for (const [input, message] of [
		["", "Enter an amount."],
		["abc", "Use numbers only"],
		["0", "more than zero"],
		["1.234", "up to 2 decimals"],
		["-5", "Use numbers only"],
		["9999999999999", "too large"],
	]) {
		await amount.fill(input);
		await page.getByRole("button", { name: "Save payment" }).click();
		await expect(page.locator("#pay-amount-error")).toContainText(message);
		await expect(amount).toBeFocused();
	}

	await amount.fill("2500.50");
	await expect(page.getByText("After this, they owe you")).toContainText("৳7,499.50");
	await page.getByRole("button", { name: "Save payment" }).click();
	await expect(page.locator("main")).toContainText("৳7,499.50");
	await expect(page.getByRole("heading", { name: /History/ })).toContainText("(2)");

	await page.getByRole("button", { name: /Fill full amount/ }).click();
	await expect(page.getByText("all settled")).toBeVisible();
	await page.getByRole("button", { name: "Save payment" }).click();
	await expect(page.getByText("All settled", { exact: true })).toBeVisible();

	await page.getByRole("link", { name: /You got ৳2,500.50/ }).click();
	await expect(page.getByRole("heading", { name: "Edit payment" })).toBeVisible();
	await expectAccessibleAndFits(page);
	await page.getByLabel("Amount").fill("3000");
	await page.getByRole("button", { name: "Save changes" }).click();
	await expect(page.getByText("You owe them")).toBeVisible();
	await expect(page.locator("main")).toContainText("৳499.50");

	await page.getByRole("link", { name: /You got ৳3,000/ }).click();
	await expect(page.getByRole("heading", { name: "Edit payment" })).toBeVisible();
	await page.getByRole("button", { name: "Delete payment" }).click();
	await page.getByRole("alertdialog").getByRole("button", { name: "Delete payment" }).click();
	await expect(page.getByRole("heading", { name: /History/ })).toContainText("(2)");
	await expect(page.getByText("Owes you", { exact: true })).toBeVisible();
	await expect(page.locator("main")).toContainText("৳2,500.50");
});

test("names are unique per person, not across everyone", async ({ page, browser }) => {
	await signUp(page);
	const name = `Shared name ${unique()}`;
	await addLoan(page, name, "100");
	await page.goto("/loans/new");
	await expect(page.getByRole("heading", { name: "New loan" })).toBeVisible();
	await page.getByLabel("Who is it with?").fill(name);
	await page.getByLabel("Amount").fill("5");
	await page.getByRole("button", { name: "Add loan" }).click();
	await expect(page.locator("#loan-title-error")).toContainText("already have a loan with this name");

	const other = await browser.newPage();
	await signUp(other);
	await addLoan(other, name, "7", "I borrowed money");
	await expect(other.getByText("You owe them")).toBeVisible();
	await other.close();
});

test("search and filters narrow the list", async ({ page }) => {
	await signUp(page);
	await addLoan(page, "Alpha lender", "100");
	await addLoan(page, "Beta borrower", "50", "I borrowed money");
	await page.goto("/loans");
	await expectAccessibleAndFits(page);
	await page.getByText("You owe", { exact: false }).first().click();
	await expect(page.getByRole("link", { name: /Beta borrower/ })).toBeVisible();
	await expect(page.getByRole("link", { name: /Alpha lender/ })).toHaveCount(0);
	await page.getByText("All", { exact: false }).first().click();
	await page.getByLabel("Search loans by name").fill("alp");
	await expect(page.getByRole("link", { name: /Alpha lender/ })).toBeVisible();
	await expect(page.getByRole("link", { name: /Beta borrower/ })).toHaveCount(0);
	await page.getByLabel("Search loans by name").fill("zzz");
	await expect(page.getByText("No loans match")).toBeVisible();
});

test("edit and delete a loan", async ({ page }) => {
	await signUp(page);
	await addLoan(page, "Old name", "300");
	await page.getByRole("link", { name: "Edit loan name, note or delete loan" }).click();
	await expect(page.getByRole("heading", { name: "Edit loan" })).toBeVisible();
	await page.getByLabel("Who is it with?").fill("New name <b>x</b>");
	await page.getByRole("button", { name: "Save changes" }).click();
	await expect(page.getByRole("heading", { level: 1, name: "New name <b>x</b>" })).toBeVisible();
	await page.getByRole("link", { name: "Edit loan name, note or delete loan" }).click();
	await expect(page.getByRole("heading", { name: "Edit loan" })).toBeVisible();
	await expectAccessibleAndFits(page);
	await page.getByRole("button", { name: "Delete loan" }).click();
	await expect(page.getByRole("alertdialog")).toContainText("they still owe you");
	await page.getByRole("alertdialog").getByRole("button", { name: "Delete loan" }).click();
	await expect(page).toHaveURL("/loans");
	await expect(page.locator("main").getByText("No loans yet")).toBeVisible();
});

test("profile: currency and password", async ({ page }) => {
	await signUp(page);
	await addLoan(page, "Currency check", "1234.5");
	await page.goto("/profile");
	await expectAccessibleAndFits(page);
	await page.getByLabel("Currency").selectOption("USD");
	await page.getByRole("button", { name: "Save profile" }).click();
	await expect(page.getByText("Profile saved")).toBeVisible();
	await page.goto("/");
	await expect(page.locator("main")).toContainText("$1,234.50");

	await page.goto("/profile");
	await page.getByLabel("Current password").fill("not-it");
	await page.getByLabel("New password").fill("newpassword1");
	await page.getByRole("button", { name: "Change password" }).click();
	await expect(page.locator("#current-password-error")).toContainText("not correct");
});

test("API rejects bad and cross-account requests", async ({ page, request }) => {
	expect((await request.post("/api/loans", { data: {} })).status()).toBe(401);

	await signUp(page);
	await addLoan(page, "Private loan", "10");
	const loanId = page.url().split("/").pop()!;
	const api = page.request;
	expect((await api.post("/api/loans", { data: "{not json", headers: { "content-type": "application/json" } })).status()).toBe(400);
	expect((await api.post(`/api/loans/${loanId}/transactions`, { data: { amount: -1, type: "CREDIT", date: "2026-01-01", method: "CASH" } })).status()).toBe(400);
	expect((await api.post(`/api/loans/${loanId}/transactions`, { data: { amount: 1, type: "CREDIT", date: "not-a-date", method: "CASH" } })).status()).toBe(400);

	const stranger = await page.context().browser()!.newPage();
	await signUp(stranger);
	expect((await stranger.request.delete(`/api/loans/${loanId}`)).status()).toBe(404);
	expect((await stranger.request.post(`/api/loans/${loanId}/transactions`, { data: { amount: 1, type: "CREDIT", date: "2026-01-01", method: "CASH" } })).status()).toBe(404);
	await stranger.goto(`/loans/${loanId}`);
	await expect(stranger.getByRole("heading", { name: "This page isn't here" })).toBeVisible();
	await stranger.close();
});
