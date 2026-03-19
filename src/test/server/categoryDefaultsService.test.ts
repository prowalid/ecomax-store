import { describe, expect, it, vi } from "vitest";
import categoryDefaultsServiceModule from "../../../server/src/infrastructure/services/CategoryDefaultsService";

const { CategoryDefaultsService } = categoryDefaultsServiceModule as any;

describe("CategoryDefaultsService", () => {
  it("seeds default images for the first empty categories once", async () => {
    const query = vi
      .fn()
      .mockResolvedValueOnce(undefined)
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({
        rows: [
          { id: "c1", image_url: null },
          { id: "c2", image_url: "https://existing.example.com/image.png" },
          { id: "c3", image_url: null },
        ],
      })
      .mockResolvedValueOnce(undefined)
      .mockResolvedValueOnce(undefined)
      .mockResolvedValueOnce(undefined)
      .mockResolvedValueOnce(undefined);

    const release = vi.fn();
    const pool = {
      connect: vi.fn().mockResolvedValue({
        query,
        release,
      }),
    };

    const service = new CategoryDefaultsService({ pool });
    await service.ensureDefaultCategoryImages();

    expect(query).toHaveBeenCalledWith("BEGIN");
    expect(query).toHaveBeenCalledWith(
      "UPDATE categories SET image_url = $1 WHERE id = $2",
      [expect.stringContaining("photo-1498049794561-7780e7231661"), "c1"]
    );
    expect(query).toHaveBeenCalledWith(
      "UPDATE categories SET image_url = $1 WHERE id = $2",
      [expect.stringContaining("photo-1566576912321-d58ddd7a6088"), "c3"]
    );
    expect(query).toHaveBeenCalledWith(
      expect.stringContaining("INSERT INTO store_settings"),
      [JSON.stringify({ seeded: true })]
    );
    expect(query).toHaveBeenCalledWith("COMMIT");
    expect(release).toHaveBeenCalled();
  });
});
