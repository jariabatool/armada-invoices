import cron from "node-cron";
import { prisma } from "../lib/prisma.js";
import { InvoiceStatus } from "../generated/prisma/client.js";

/**
 * Marks every `sent` invoice whose due date has passed as `overdue`,
 * and logs a reminder line per invoice.
 * Returns how many invoices were updated.
 */
export async function markOverdueInvoices(now = new Date()): Promise<number> {
  // dueDate is a calendar date: anything due before today (UTC) is overdue
  const today = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  const where = { status: InvoiceStatus.sent, dueDate: { lt: today } };

  const due = await prisma.invoice.findMany({
    where,
    select: {
      id: true,
      title: true,
      amount: true,
      dueDate: true,
      client: { select: { name: true, email: true } },
    },
  });
  if (due.length === 0) return 0;

  // Only touch invoices still `sent` (guards against a status change in between)
  const { count } = await prisma.invoice.updateMany({
    where: { ...where, id: { in: due.map((i) => i.id) } },
    data: { status: InvoiceStatus.overdue },
  });

  for (const inv of due) {
    console.log(
      `[overdue-job] Reminder: "${inv.title}" (${inv.amount.toFixed(2)}) for ${inv.client.name} <${inv.client.email}> ` +
        `was due ${inv.dueDate.toISOString().slice(0, 10)} — marked overdue`,
    );
  }
  return count;
}

async function run() {
  try {
    const count = await markOverdueInvoices();
    console.log(`[overdue-job] ${new Date().toISOString()} — ${count} invoice(s) marked overdue`);
  } catch (err) {
    console.error("[overdue-job] failed:", err);
  }
}

/**
 * Schedule from OVERDUE_CRON (default: every hour at minute 0). Set OVERDUE_CRON=off to disable.
 * Also runs once at startup, so invoices are caught up after a free-tier server wakes from sleep.
 */
export function startOverdueJob() {
  const schedule = process.env.OVERDUE_CRON ?? "0 * * * *";
  if (schedule === "off") return console.log("[overdue-job] disabled");
  if (!cron.validate(schedule)) throw new Error(`Invalid OVERDUE_CRON: "${schedule}"`);

  cron.schedule(schedule, run, { name: "overdue-invoices", noOverlap: true });
  console.log(`[overdue-job] scheduled "${schedule}" (UTC)`);
  void run();
}
