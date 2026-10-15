import cron from "node-cron";
import { env } from "../config/env.js";
import { markOverdueInvoices } from "../services/invoices.service.js";
import { formatIsoDate } from "../utils/date.js";

const LOG_PREFIX = "[overdue-job]";

/** One run: mark overdue invoices and log a reminder for each. Never throws. */
export async function runOverdueInvoicesJob(now: Date = new Date()): Promise<number> {
  try {
    const invoices = await markOverdueInvoices(now);
    for (const invoice of invoices) {
      console.log(
        `${LOG_PREFIX} Reminder: "${invoice.title}" (${invoice.amount.toFixed(2)}) for ` +
          `${invoice.client.name} <${invoice.client.email}> was due ${formatIsoDate(invoice.dueDate)} — marked overdue`,
      );
    }
    console.log(`${LOG_PREFIX} ${now.toISOString()} — ${invoices.length} invoice(s) marked overdue`);
    return invoices.length;
  } catch (err) {
    console.error(`${LOG_PREFIX} failed:`, err);
    return 0;
  }
}

/**
 * Schedules the job from OVERDUE_CRON (default hourly, UTC). "off" disables it.
 * Also runs once at startup so invoices catch up after a free-tier server wakes from sleep.
 */
export function startOverdueInvoicesJob(): void {
  const schedule = env.OVERDUE_CRON;
  if (schedule === "off") {
    console.log(`${LOG_PREFIX} disabled`);
    return;
  }
  if (!cron.validate(schedule)) {
    throw new Error(`Invalid OVERDUE_CRON expression: "${schedule}"`);
  }

  cron.schedule(schedule, () => runOverdueInvoicesJob(), { name: "overdue-invoices", noOverlap: true });
  console.log(`${LOG_PREFIX} scheduled "${schedule}" (UTC)`);
  void runOverdueInvoicesJob();
}
