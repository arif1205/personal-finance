import { defineConfig, devices } from "@playwright/test";

// Runs against a local build with a disposable database: `pnpm build && pnpm test:e2e`.
export default defineConfig({
	testDir: "tests/e2e",
	fullyParallel: true,
	reporter: "list",
	use: { baseURL: "http://localhost:3003", trace: "retain-on-failure" },
	projects: [
		{ name: "phone", use: { ...devices["iPhone 13"], browserName: "chromium" } },
		{ name: "desktop", use: { viewport: { width: 1280, height: 900 } } },
	],
	webServer: { command: "pnpm start", url: "http://localhost:3003/login", reuseExistingServer: true },
});
