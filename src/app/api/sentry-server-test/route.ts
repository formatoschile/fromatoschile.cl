import { connection } from "next/server";

export async function GET() {
  await connection();
  throw new Error("Sentry backend smoke test (pre-launch) — delete me");
}
