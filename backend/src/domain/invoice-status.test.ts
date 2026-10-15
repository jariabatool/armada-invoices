import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  canTransition,
  InvoiceRuleError,
  isPastDue,
  resolveStatus,
  statusForNewInvoice,
  statusForUpdate,
} from "./invoice-status.js";

const NOW = new Date("2026-10-15T12:00:00Z");
const PAST = new Date("2026-10-10T00:00:00Z");
const TODAY = new Date("2026-10-15T00:00:00Z");
const FUTURE = new Date("2026-10-20T00:00:00Z");

describe("isPastDue", () => {
  it("is true only for dates before today", () => {
    assert.equal(isPastDue(PAST, NOW), true);
    assert.equal(isPastDue(TODAY, NOW), false);
    assert.equal(isPastDue(FUTURE, NOW), false);
  });
});

describe("canTransition", () => {
  it("follows the lifecycle", () => {
    assert.equal(canTransition("draft", "sent"), true);
    assert.equal(canTransition("draft", "paid"), false);
    assert.equal(canTransition("draft", "overdue"), false);
    assert.equal(canTransition("sent", "paid"), true);
    assert.equal(canTransition("sent", "draft"), true);
    assert.equal(canTransition("overdue", "paid"), true);
    assert.equal(canTransition("overdue", "draft"), false);
    assert.equal(canTransition("paid", "sent"), false);
  });

  it("allows keeping the same status", () => {
    assert.equal(canTransition("sent", "sent"), true);
  });
});

describe("resolveStatus", () => {
  it("stores sent with a past due date as overdue", () => {
    assert.equal(resolveStatus("sent", PAST, "draft", NOW), "overdue");
  });

  it("keeps sent when due today or later", () => {
    assert.equal(resolveStatus("sent", TODAY, "draft", NOW), "sent");
  });

  it("rejects overdue when the due date has not passed", () => {
    assert.throws(() => resolveStatus("overdue", FUTURE, "sent", NOW), InvoiceRuleError);
  });

  it("re-opens an overdue invoice as sent when its due date moves forward", () => {
    assert.equal(resolveStatus("overdue", FUTURE, "overdue", NOW), "sent");
  });

  it("rejects overdue → sent while still past due", () => {
    assert.throws(() => resolveStatus("sent", PAST, "overdue", NOW), InvoiceRuleError);
  });
});

describe("statusForNewInvoice", () => {
  it("allows draft and sent", () => {
    assert.equal(statusForNewInvoice("draft", PAST, NOW), "draft");
    assert.equal(statusForNewInvoice("sent", FUTURE, NOW), "sent");
    assert.equal(statusForNewInvoice("sent", PAST, NOW), "overdue");
  });

  it("keeps paid as paid, even when the due date has passed", () => {
    assert.equal(statusForNewInvoice("paid", PAST, NOW), "paid");
    assert.equal(statusForNewInvoice("paid", FUTURE, NOW), "paid");
  });

  it("rejects creating an invoice as overdue", () => {
    assert.throws(() => statusForNewInvoice("overdue", PAST, NOW), InvoiceRuleError);
  });
});

describe("statusForUpdate", () => {
  it("locks paid invoices", () => {
    assert.throws(() => statusForUpdate("paid", "paid", FUTURE, NOW), /locked/);
    assert.throws(() => statusForUpdate("paid", "sent", FUTURE, NOW), /locked/);
  });

  it("rejects transitions outside the lifecycle", () => {
    assert.throws(() => statusForUpdate("draft", "paid", FUTURE, NOW), /can't go from draft to paid/);
  });

  it("allows valid changes", () => {
    assert.equal(statusForUpdate("sent", "paid", PAST, NOW), "paid");
    assert.equal(statusForUpdate("sent", "overdue", PAST, NOW), "overdue");
    assert.equal(statusForUpdate("overdue", "sent", FUTURE, NOW), "sent");
  });
});
