import * as bcrypt from "bcryptjs";

export class Hash {
	private static readonly SALT_ROUNDS = 10;

	/**
	 * Hash a plain text password
	 * @param password - The plain text password to hash
	 * @returns Promise<string> - The hashed password
	 */
	static async hash(password: string): Promise<string> {
		try {
			const salt = await bcrypt.genSalt(this.SALT_ROUNDS);
			return await bcrypt.hash(password, salt);
		} catch (error) {
			throw new Error("Error hashing password");
		}
	}

	/**
	 * Compare a plain text password with a hashed password
	 * @param password - The plain text password to compare
	 * @param hashedPassword - The hashed password to compare against
	 * @returns Promise<boolean> - True if passwords match, false otherwise
	 */
	static async compare(
		password: string,
		hashedPassword: string
	): Promise<boolean> {
		try {
			return await bcrypt.compare(password, hashedPassword);
		} catch (error) {
			throw new Error("Error comparing passwords");
		}
	}

	/**
	 * Generate a salt
	 * @param rounds - Number of rounds to use (default: 10)
	 * @returns Promise<string> - The generated salt
	 */
	static async generateSalt(
		rounds: number = this.SALT_ROUNDS
	): Promise<string> {
		try {
			return await bcrypt.genSalt(rounds);
		} catch (error) {
			throw new Error("Error generating salt");
		}
	}

	/**
	 * Hash data with a specific salt
	 * @param data - The data to hash
	 * @param salt - The salt to use
	 * @returns Promise<string> - The hashed data
	 */
	static async hashWithSalt(data: string, salt: string): Promise<string> {
		try {
			return await bcrypt.hash(data, salt);
		} catch (error) {
			throw new Error("Error hashing with salt");
		}
	}

	/**
	 * Check if a string is already hashed
	 * @param str - The string to check
	 * @returns boolean - True if the string is hashed, false otherwise
	 */
	static isHashed(str: string): boolean {
		const bcryptRegex = /^\$2[ayb]\$[0-9]{2}\$[A-Za-z0-9./]{53}$/;
		return bcryptRegex.test(str);
	}
}
