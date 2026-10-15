import { runOverdueInvoicesJob } from "../../src/jobs/overdue-invoices.job.js";

/**
 * Netlify Scheduled Function: marks past-due "sent" invoices as overdue every hour.
 * (On a long-running server the same job runs in-process via node-cron; see server.ts.)
 */
export default async function handler(): Promise<Response> {
  const count = await runOverdueInvoicesJob();
  return Response.json({ marked: count });
}

export const config = {
  schedule: "@hourly",
};
