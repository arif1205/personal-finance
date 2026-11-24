import { TimezoneSync } from "@/components/app/timezone-sync";
import type { Metadata, Viewport } from "next";
import { ThemeProvider } from "next-themes";
import { Instrument_Sans } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";

const sans = Instrument_Sans({ subsets: ["latin"], variable: "--font-sans", display: "swap" });

export const metadata: Metadata = {
	title: { default: "Personal Finance", template: "%s | Personal Finance" },
	description: "Keep track of money you lend and borrow.",
};

export const viewport: Viewport = {
	width: "device-width",
	initialScale: 1,
	viewportFit: "cover",
	themeColor: [
		{ media: "(prefers-color-scheme: light)", color: "#F3F5F4" },
		{ media: "(prefers-color-scheme: dark)", color: "#0E1413" },
	],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
	return (
		<html lang='en' suppressHydrationWarning className={sans.variable}>
			<body className='min-h-dvh font-sans'>
				<ThemeProvider attribute='class' defaultTheme='system' enableSystem disableTransitionOnChange>
					{children}
					<Toaster position='top-center' closeButton toastOptions={{ className: "!rounded-xl !text-[15px] !font-sans" }} />
					<TimezoneSync />
				</ThemeProvider>
			</body>
		</html>
	);
}
