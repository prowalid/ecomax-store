import { describe, expect, it } from "vitest";
import localFileStorageModule from "../../../server/src/infrastructure/storage/LocalFileStorage";

const { LocalFileStorage } = localFileStorageModule as any;

describe("LocalFileStorage", () => {
  it("builds managed public URLs and resolves file paths", () => {
    const storage = new LocalFileStorage({
      uploadsDir: "/tmp/uploads",
      publicPrefix: "/uploads",
      now: () => 1000,
      random: () => 0.5,
    });

    const filename = storage.generateStoredFilename("image.png");

    expect(filename).toBe("1000-500000000.png");
    expect(storage.buildPublicUrl(filename)).toBe("/uploads/1000-500000000.png");
    expect(storage.resolvePathFromUrl("/uploads/1000-500000000.png")).toBe(
      "/tmp/uploads/1000-500000000.png"
    );
  });

  it("rejects URLs outside the managed prefix", () => {
    const storage = new LocalFileStorage({
      uploadsDir: "/tmp/uploads",
    });

    expect(storage.normalizeManagedUrl("https://cdn.example.com/a.png")).toBeNull();
    expect(storage.resolvePathFromUrl("/other/a.png")).toBeNull();
  });
});
