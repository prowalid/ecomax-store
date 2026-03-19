import { describe, expect, it, vi } from "vitest";
import pageIntegrityServiceModule from "../../../server/src/infrastructure/services/PageIntegrityService";

const { PageIntegrityService } = pageIntegrityServiceModule as any;

describe("PageIntegrityService", () => {
  it("normalizes duplicate slugs and creates the unique index", async () => {
    const query = vi
      .fn()
      .mockResolvedValueOnce(undefined)
      .mockResolvedValueOnce({
        rows: [
          { id: "1", slug: "Landing Page" },
          { id: "2", slug: "landing-page" },
          { id: "3", slug: "Offers" },
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

    const service = new PageIntegrityService({ pool });
    await service.ensureUniqueNormalizedSlugs();

    expect(query).toHaveBeenCalledWith("BEGIN");
    expect(query).toHaveBeenCalledWith(
      "UPDATE pages SET slug = $1, updated_at = NOW() WHERE id = $2",
      ["landing-page", "1"]
    );
    expect(query).toHaveBeenCalledWith(
      "UPDATE pages SET slug = $1, updated_at = NOW() WHERE id = $2",
      ["landing-page-2", "2"]
    );
    expect(query).toHaveBeenCalledWith("CREATE UNIQUE INDEX IF NOT EXISTS idx_pages_slug_unique ON pages (slug)");
    expect(query).toHaveBeenCalledWith("COMMIT");
    expect(release).toHaveBeenCalled();
  });
});
