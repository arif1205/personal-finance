"use client";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { ThemeProviderProps } from "next-themes"; // Changed to import from the main module

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
	return (
		<NextThemesProvider
			attribute='class'
			defaultTheme='dark'
			enableSystem={true}
			{...props}>
			{children}
		</NextThemesProvider>
	);
}
