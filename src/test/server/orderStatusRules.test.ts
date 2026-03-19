import { describe, expect, it } from "vitest";
import orderStatusRules from "../../../server/src/domain/orders/orderStatusRules";

const {
  isValidStatusTransition,
  shouldIncrementCallAttempts,
  shouldRestoreStock,
  shouldConsumeStock,
} = orderStatusRules;

describe("orderStatusRules", () => {
  it("allows valid status transitions from the current production flow", () => {
    expect(isValidStatusTransition("new", "attempt")).toBe(true);
    expect(isValidStatusTransition("attempt", "confirmed")).toBe(true);
    expect(isValidStatusTransition("ready", "shipped")).toBe(true);
  });

  it("rejects invalid status transitions", () => {
    expect(isValidStatusTransition("new", "delivered")).toBe(false);
    expect(isValidStatusTransition("cancelled", "confirmed")).toBe(false);
    expect(isValidStatusTransition("returned", "shipped")).toBe(false);
  });

  it("increments call attempts only when moving into attempt", () => {
    expect(shouldIncrementCallAttempts("attempt")).toBe(true);
    expect(shouldIncrementCallAttempts("confirmed")).toBe(false);
  });

  it("detects stock restore vs consume transitions correctly", () => {
    expect(shouldRestoreStock("confirmed", "cancelled")).toBe(true);
    expect(shouldRestoreStock("shipped", "returned")).toBe(true);
    expect(shouldConsumeStock("cancelled", "confirmed")).toBe(true);
    expect(shouldConsumeStock("returned", "ready")).toBe(true);
    expect(shouldConsumeStock("new", "attempt")).toBe(false);
  });
});
