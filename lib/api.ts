import { Prisma } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { authenticateRequest } from "./auth";
import { db } from "./db";

export class NotFoundError extends Error {}

type Handler<P> = (ctx: { userId: string; req: NextRequest; params: P }) => Promise<unknown>;

/** Wraps an authenticated JSON route: auth check, then maps known failures to clear messages. */
export function authedRoute<P>(handler: Handler<P>) {
	return async (req: NextRequest, { params }: { params: Promise<P> }) => {
		const auth = await authenticateRequest(req);
		// The JWT outlives account changes, so confirm the account still exists and is active.
		const active = auth.success && (await db.user.count({ where: { id: auth.user.id, status: "ACTIVE" } }));
		if (!auth.success || !active) return fail("Your session has ended. Sign in again.", 401);
		try {
			const data = await handler({ userId: auth.user.id, req, params: await params });
			return NextResponse.json({ success: true, data: data ?? null });
		} catch (error) {
			if (error instanceof z.ZodError) return fail(error.errors[0]?.message ?? "Check the form and try again.", 400);
			if (error instanceof NotFoundError) return fail(error.message, 404);
			if (error instanceof SyntaxError) return fail("The request was not valid JSON.", 400);
			if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002")
				return fail("You already have a loan with this name. Use a different name.", 409);
			console.error(error);
			return fail("Something went wrong on our side. Try again.", 500);
		}
	};
}

function fail(message: string, status: number) {
	return NextResponse.json({ success: false, message }, { status });
}
