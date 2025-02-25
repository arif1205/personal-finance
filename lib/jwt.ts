import * as jose from "jose";

if (!process.env.JWT_SECRET) {
	throw new Error("JWT_SECRET is not defined in environment variables");
}

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET);
const JWT_EXPIRES_IN = "7d"; // Token expires in 7 days

export interface JWTPayload extends jose.JWTPayload {
	userId: string;
	email: string;
	name?: string | null;
}

export class JWT {
	static async sign(payload: JWTPayload): Promise<string> {
		try {
			return await new jose.SignJWT({ ...payload })
				.setProtectedHeader({ alg: "HS256" })
				.setExpirationTime(JWT_EXPIRES_IN)
				.setIssuedAt()
				.sign(JWT_SECRET);
		} catch (error) {
			throw new Error("Failed to sign JWT");
		}
	}

	static async verify(token: string): Promise<JWTPayload> {
		try {
			const { payload } = await jose.jwtVerify(token, JWT_SECRET);
			return payload as JWTPayload;
		} catch (error) {
			throw new Error("Invalid token");
		}
	}

	static decode(token: string): JWTPayload | null {
		try {
			return jose.decodeJwt(token) as JWTPayload;
		} catch (error) {
			return null;
		}
	}
}
