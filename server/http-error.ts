import type { Response } from "express";
import { ZodError } from "zod";

/** An error with an HTTP status and a message that is safe to show the user. */
export class HttpError extends Error {
  constructor(public status: number, message: string, public code?: string) {
    super(message);
    this.name = "HttpError";
  }
}

/**
 * Sends a JSON error for a caught exception. HttpError and ZodError carry user-safe messages;
 * anything else is logged and reported with the generic fallback so provider responses,
 * stack traces and keys never reach the client.
 */
export function sendError(res: Response, error: unknown, fallback: string, logLabel?: string): void {
  if (error instanceof HttpError) {
    res.status(error.status).json({ error: error.message, ...(error.code && { code: error.code }) });
    return;
  }
  if (error instanceof ZodError) {
    res.status(400).json({ error: "Invalid input", details: error.errors.map((e) => ({ path: e.path, message: e.message })) });
    return;
  }
  console.error(logLabel ? `[${logLabel}]` : "[error]", error);
  res.status(500).json({ error: fallback });
}

export const OPENAI_NOT_CONFIGURED = "OPENAI_NOT_CONFIGURED";

/** Returns the server's OpenAI key or throws a 503 the UI can show as "feature not configured". */
export function requireOpenAiKey(): string {
  const key = process.env.OPENAI_API_KEY;
  if (!key) {
    throw new HttpError(
      503,
      "AI features are not configured on this server (OPENAI_API_KEY is not set).",
      OPENAI_NOT_CONFIGURED,
    );
  }
  return key;
}
