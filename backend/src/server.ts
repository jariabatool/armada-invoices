import { env } from "./config/env.js";
import { createApp } from "./app.js";
import { startOverdueInvoicesJob } from "./jobs/overdue-invoices.job.js";

const app = createApp();

app.listen(env.PORT, () => {
  console.log(`API running on http://localhost:${env.PORT}`);
  startOverdueInvoicesJob();
});
