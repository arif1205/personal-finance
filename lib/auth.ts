import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { JWT, JWTPayload } from "./jwt";

export class Auth {
	private static readonly TOKEN_NAME = "token";

	/**
	 * Create a session by setting the JWT token in cookies
	 */
	static async createSession(
		payload: JWTPayload,
		response: NextResponse
	): Promise<void> {
		try {
			const token = await JWT.sign(payload);

			response.cookies.set({
				name: this.TOKEN_NAME,
				value: token,
				httpOnly: true,
				secure: process.env.NODE_ENV === "production",
				sameSite: "lax",
				maxAge: 60 * 60 * 24 * 7, // 7 days
				path: "/",
			});
		} catch (error) {
			throw error;
		}
	}

	/**
	 * Destroy the session by clearing the JWT token
	 */
	static destroySession(response: NextResponse): void {
		response.cookies.set({
			name: this.TOKEN_NAME,
			value: "",
			expires: new Date(0),
			path: "/",
		});
	}

	/**
	 * Get the current session user from the request
	 */
	static async getCurrentUser(
		request: NextRequest
	): Promise<JWTPayload | null> {
		try {
			const token = request.cookies.get(this.TOKEN_NAME)?.value;
			if (!token) {
				return null;
			}

			const user = await JWT.verify(token);
			return user;
		} catch (error) {
			return null;
		}
	}

	/**
	 * Check if the request has a valid session
	 */
	static async isAuthenticated(request: NextRequest): Promise<boolean> {
		const user = await this.getCurrentUser(request);
		return user !== null;
	}

	/**
	 * Get the current user from server components
	 */
	static async getServerUser(): Promise<JWTPayload | null> {
		try {
			const cookieStore = await cookies();
			const token = cookieStore.get(this.TOKEN_NAME)?.value;

			if (!token) {
				return null;
			}

			const user = await JWT.verify(token);
			return user;
		} catch (error) {
			return null;
		}
	}

	/**
	 * Create a response with error status and message
	 */
	static createAuthError(
		message: string = "Unauthorized",
		status: number = 401
	): NextResponse {
		return NextResponse.json({ success: false, message }, { status });
	}

	/**
	 * Middleware to protect API routes
	 */
	static async protectAPI(request: NextRequest): Promise<NextResponse | null> {
		const isAuthenticated = await this.isAuthenticated(request);
		if (!isAuthenticated) {
			return this.createAuthError();
		}
		return null;
	}

	/**
	 * Get authorization header token
	 */
	static getBearerToken(request: NextRequest): string | null {
		const authHeader = request.headers.get("authorization");
		if (!authHeader?.startsWith("Bearer ")) return null;
		return authHeader.split(" ")[1];
	}
}
