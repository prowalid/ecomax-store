import { describe, expect, it } from "vitest";
import productModule from "../../../server/src/domain/entities/Product";
import customerModule from "../../../server/src/domain/entities/Customer";
import orderModule from "../../../server/src/domain/entities/Order";
import moneyModule from "../../../server/src/domain/value-objects/Money";
import orderItemModule from "../../../server/src/domain/entities/OrderItem";
import userModule from "../../../server/src/domain/entities/User";
import categoryModule from "../../../server/src/domain/entities/Category";
import pageModule from "../../../server/src/domain/entities/Page";

const { Product } = productModule as any;
const { Customer } = customerModule as any;
const { Order } = orderModule as any;
const { Money } = moneyModule as any;
const { OrderItem } = orderItemModule as any;
const { User } = userModule as any;
const { Category } = categoryModule as any;
const { Page } = pageModule as any;

describe("domain entities", () => {
  it("normalizes and validates product data", () => {
    const product = new Product({
      id: "p1",
      name: "  Demo Product  ",
      price: "1200",
      stock: "5",
      custom_options: [],
    });

    expect(product.name).toBe("Demo Product");
    expect(product.price.toNumber()).toBe(1200);
    expect(product.stock).toBe(5);
    expect(product.toOrderItem({ quantity: 2, selected_options: {} }).toPersistence()).toMatchObject({
      product_name: "Demo Product",
      quantity: 2,
      unit_price: 1200,
      total: 2400,
    });
  });

  it("normalizes and validates customer data", () => {
    const customer = new Customer({
      name: " أحمد ",
      phone: "0555 00 00 00",
    });

    expect(customer.name).toBe("أحمد");
    expect(customer.phone).toBe("0555000000");
  });

  it("builds an order entity from validated order data", () => {
    const order = new Order({
      customer_name: "Ahmed",
      customer_phone: "0555 00 00 00",
      subtotal: 2400,
      shipping_cost: 300,
      total: 2700,
    });

    expect(order.customer_phone).toBe("0555000000");
    expect(order.total.toNumber()).toBe(2700);
  });

  it("plans order status transitions from the entity itself", () => {
    const order = new Order({
      requireCustomerIdentity: false,
      status: "new",
      call_attempts: 0,
      subtotal: 0,
      shipping_cost: 0,
      total: 0,
    });

    expect(order.transitionTo("attempt")).toEqual({
      status: "attempt",
      callAttempts: 1,
      stockDirection: 0,
    });
  });

  it("supports money arithmetic and order item totals", () => {
    const unitPrice = new Money(1200);
    const item = new OrderItem({
      product_id: "p1",
      product_name: "Demo Product",
      quantity: 2,
      unit_price: 1200,
    });

    expect(item.unit_price.toNumber()).toBe(1200);
    expect(item.total.toNumber()).toBe(2400);
    expect(unitPrice.add(new Money(300)).toNumber()).toBe(1500);
  });

  it("normalizes admin user identity", () => {
    const user = new User({
      name: " Admin ",
      phone: "0555 00 00 00",
    });

    expect(user.name).toBe("Admin");
    expect(user.phone).toBe("0555000000");
    expect(user.email).toBe("admin-0555000000@internal.etk");
  });

  it("normalizes category and page entities", () => {
    const category = new Category({
      name: " Men ",
      slug: " Men Collection ",
      sort_order: 2,
    });
    const page = new Page({
      title: " About Us ",
      slug: " About Us ",
      show_in: "footer",
    });

    expect(category.slug).toBe("men-collection");
    expect(page.slug).toBe("about-us");
    expect(page.show_in).toBe("footer");
  });
});
