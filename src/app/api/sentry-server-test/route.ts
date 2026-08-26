import * as Sentry from "@sentry/nextjs";
import { connection } from "next/server";

export async function GET() {
  await connection();

  try {
    throw new Error("Sentry backend flush test (pre-launch) — delete me");
  } catch (error) {
    Sentry.captureException(error);
    await Sentry.flush(2000);
    return new Response("captured and flushed", { status: 500 });
  }
}
