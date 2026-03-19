import { describe, expect, it } from "vitest";
import sanitizeModule from "../../../server/src/presentation/middleware/sanitize";

const { createSanitizeBody } = sanitizeModule as any;

describe("sanitize middleware", () => {
  it("strips HTML from plain text fields recursively", async () => {
    const middleware = createSanitizeBody();
    const req: any = {
      body: {
        customer_name: "  <b>Ahmed</b>  ",
        note: "<img src=x onerror=alert(1)>hello",
        items: [
          {
            product_name: "<script>alert(1)</script>Shirt",
            selected_options: {
              color: "<b>Black</b>",
            },
          },
        ],
      },
    };

    await new Promise<void>((resolve, reject) => {
      middleware(req, {}, (error?: Error) => (error ? reject(error) : resolve()));
    });

    expect(req.body).toEqual({
      customer_name: "Ahmed",
      note: "hello",
      items: [
        {
          product_name: "alert(1)Shirt",
          selected_options: {
            color: "Black",
          },
        },
      ],
    });
  });

  it("preserves allowed HTML fields while removing dangerous tags and handlers", async () => {
    const middleware = createSanitizeBody({ allowHtmlPaths: ["content"] });
    const req: any = {
      body: {
        title: "  <b>Title</b>  ",
        content: `<p onclick="evil()">Hello</p><script>alert(1)</script><a href="javascript:evil()">link</a>`,
      },
    };

    await new Promise<void>((resolve, reject) => {
      middleware(req, {}, (error?: Error) => (error ? reject(error) : resolve()));
    });

    expect(req.body.title).toBe("Title");
    expect(req.body.content).toContain("<p>Hello</p>");
    expect(req.body.content).not.toContain("<script");
    expect(req.body.content).not.toContain("onclick=");
    expect(req.body.content).not.toContain("javascript:");
  });
});
