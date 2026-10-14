import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient, InvoiceStatus } from "../src/generated/prisma/client.js";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

const daysFromNow = (d: number) => {
  const date = new Date();
  date.setDate(date.getDate() + d);
  return date;
};

async function main() {
  const user = await prisma.user.upsert({
    where: { email: "demo@armada.test" },
    update: {},
    create: { name: "Demo User", email: "demo@armada.test" },
  });

  // Make the seed re-runnable: wipe this user's data first
  await prisma.client.deleteMany({ where: { userId: user.id } });

  const clients = [
    {
      name: "Ali Raza", email: "ali@techwave.pk", company: "TechWave",
      invoices: [
        { title: "Website redesign", amount: 1200, dueDate: daysFromNow(14), status: InvoiceStatus.draft },
        { title: "SEO audit", amount: 450, dueDate: daysFromNow(7), status: InvoiceStatus.sent },
      ],
    },
    {
      name: "Sara Khan", email: "sara@bloomstudio.com", company: "Bloom Studio",
      invoices: [
        { title: "Brand identity", amount: 2500, dueDate: daysFromNow(-20), status: InvoiceStatus.paid },
        { title: "Social media kit", amount: 600, dueDate: daysFromNow(-5), status: InvoiceStatus.overdue },
      ],
    },
    {
      name: "Usman Tariq", email: "usman@greenleaf.io", company: "GreenLeaf",
      invoices: [
        { title: "Mobile app MVP", amount: 5400, dueDate: daysFromNow(30), status: InvoiceStatus.sent },
        { title: "Maintenance (Q3)", amount: 800, dueDate: daysFromNow(-2), status: InvoiceStatus.sent },
      ],
    },
  ];

  for (const { invoices, ...client } of clients) {
    await prisma.client.create({
      data: { ...client, userId: user.id, invoices: { create: invoices } },
    });
  }

  console.log(`Seeded ${clients.length} clients with invoices for ${user.email}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());