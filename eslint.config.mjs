import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
	baseDirectory: __dirname,
});

const eslintConfig = [
	{
		ignores: ["**/node_modules/**", ".next/**"],
	},
	...compat.config({
		extends: ["next/core-web-vitals"],
		rules: {
			// Disable unused variables warnings
			"@typescript-eslint/no-unused-vars": "off",
			"no-unused-vars": "off",
			// Disable warning about unused eslint-disable comments
			"eslint-comments/no-unused-disable": "off",
			// Allow unused eslint-disable directives
			"unused-imports/no-unused-vars": "off",
		},
	}),
];

export default eslintConfig;
