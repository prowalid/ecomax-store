import { describe, expect, it, vi } from "vitest";
import uploadCleanupServiceModule from "../../../server/src/infrastructure/services/UploadCleanupService";

const { UploadCleanupService } = uploadCleanupServiceModule as any;

describe("UploadCleanupService", () => {
  it("collects appearance upload URLs without duplicates", () => {
    const fileStorage = {
      isManagedUrl: vi.fn((value) => typeof value === "string" && value.startsWith("/uploads/")),
      normalizeManagedUrl: vi.fn((value) =>
        typeof value === "string" && value.startsWith("/uploads/") ? value.trim() : null
      ),
      resolvePathFromUrl: vi.fn(),
    };
    const service = new UploadCleanupService({
      pool: { query: vi.fn() },
      fsModule: { unlink: vi.fn() },
      fileStorage,
    });

    const urls = service.collectAppearanceUploadUrls({
      logo_url: "/uploads/logo.png",
      footer_logo_url: "/uploads/footer.png",
      favicon_url: "/uploads/logo.png",
      slides: [
        { image_url: "/uploads/slide-1.png" },
        { image_url: "/uploads/slide-1.png" },
      ],
    });

    expect(urls).toEqual([
      "/uploads/logo.png",
      "/uploads/footer.png",
      "/uploads/slide-1.png",
    ]);
  });

  it("deletes only uploads no longer referenced", async () => {
    const pool = {
      query: vi.fn().mockResolvedValue({ rows: [] }),
    };
    const fsModule = {
      unlink: vi.fn().mockResolvedValue(undefined),
    };
    const fileStorage = {
      isManagedUrl: vi.fn((value) => typeof value === "string" && value.startsWith("/uploads/")),
      normalizeManagedUrl: vi.fn((value) =>
        typeof value === "string" && value.startsWith("/uploads/") ? value.trim() : null
      ),
      resolvePathFromUrl: vi.fn((value) => `/tmp/${value.split("/").pop()}`),
    };
    const service = new UploadCleanupService({ pool, fsModule, fileStorage });

    await service.cleanupRemovedUploadUrls(
      ["/uploads/a.png", "/uploads/b.png"],
      ["/uploads/b.png"]
    );

    expect(fsModule.unlink).toHaveBeenCalledTimes(1);
    expect(fsModule.unlink.mock.calls[0][0]).toContain("/tmp/a.png");
  });
});
