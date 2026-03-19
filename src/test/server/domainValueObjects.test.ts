import { describe, expect, it } from "vitest";
import slugModule from "../../../server/src/domain/value-objects/Slug";
import phoneModule from "../../../server/src/domain/value-objects/Phone";
import orderStatusModule from "../../../server/src/domain/value-objects/OrderStatus";

const { Slug } = slugModule as any;
const { Phone } = phoneModule as any;
const { OrderStatus } = orderStatusModule as any;

describe("domain value objects", () => {
  it("normalizes slugs consistently", () => {
    expect(new Slug(" Hello World! ").value).toBe("hello-world");
    expect(Slug.optional("")).toBeNull();
  });

  it("normalizes phone numbers", () => {
    expect(new Phone("0555 00 00 00").value).toBe("0555000000");
  });

  it("validates order status transitions through the value object", () => {
    const status = new OrderStatus("confirmed");
    expect(status.canTransitionTo("ready")).toBe(true);
    expect(() => status.assertTransition("delivered")).toThrow(
      /لا يمكن نقل الطلب/
    );
  });
});
