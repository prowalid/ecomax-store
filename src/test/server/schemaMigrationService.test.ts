import { afterEach, describe, expect, it, vi } from "vitest";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import schemaMigrationServiceModule from "../../../server/src/infrastructure/services/SchemaMigrationService";
import ensureStartupSchemaModule from "../../../server/src/application/use-cases/system/EnsureStartupSchema";

const { SchemaMigrationService } = schemaMigrationServiceModule as any;
const { EnsureStartupSchemaUseCase } = ensureStartupSchemaModule as any;

describe("SchemaMigrationService", () => {
  const tempDirs: string[] = [];

  afterEach(async () => {
    await Promise.all(tempDirs.splice(0).map((dir) => rm(dir, { recursive: true, force: true })));
  });

  it("normalizes legacy appearance settings into the current shape", async () => {
    const query = vi
      .fn()
      .mockResolvedValueOnce({
        rows: [
          {
            value: {
              primary_color: "#0d6847",
              button_color: "#0d6847",
              bg_color: "#f4f5f7",
              store_name: "My Store",
            },
          },
        ],
      })
      .mockResolvedValueOnce(undefined);

    const service = new SchemaMigrationService({ pool: { query } });
    await service.ensureAppearanceSettingsShape();

    expect(query).toHaveBeenNthCalledWith(
      1,
      "SELECT value FROM store_settings WHERE key = 'appearance' LIMIT 1"
    );
    expect(query).toHaveBeenNthCalledWith(
      2,
      "UPDATE store_settings SET value = $1, updated_at = now() WHERE key = 'appearance'",
      [
        expect.objectContaining({
          accent_color: "#dc3545",
          button_color: "#dc3545",
          store_name: "ECOMAX",
        }),
      ]
    );
  });

  it("applies pending file-based migrations in order", async () => {
    const migrationsDir = await mkdtemp(join(tmpdir(), "etk-migrations-"));
    tempDirs.push(migrationsDir);

    await writeFile(join(migrationsDir, "001_first.up.sql"), "ALTER TABLE users ADD COLUMN IF NOT EXISTS nickname TEXT;");
    await writeFile(join(migrationsDir, "001_first.down.sql"), "ALTER TABLE users DROP COLUMN IF EXISTS nickname;");
    await writeFile(join(migrationsDir, "002_second.up.sql"), "CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at);");
    await writeFile(join(migrationsDir, "002_second.down.sql"), "DROP INDEX IF EXISTS idx_users_created_at;");

    const query = vi
      .fn()
      .mockResolvedValueOnce(undefined) // ensure table
      .mockResolvedValueOnce({ rows: [] }) // applied set
      .mockResolvedValueOnce(undefined) // begin 1
      .mockResolvedValueOnce(undefined) // sql 1
      .mockResolvedValueOnce(undefined) // insert 1
      .mockResolvedValueOnce(undefined) // commit 1
      .mockResolvedValueOnce(undefined) // begin 2
      .mockResolvedValueOnce(undefined) // sql 2
      .mockResolvedValueOnce(undefined) // insert 2
      .mockResolvedValueOnce(undefined); // commit 2

    const service = new SchemaMigrationService({
      pool: { query },
      migrationsDir,
    });

    await service.runPendingMigrations();

    expect(query).toHaveBeenNthCalledWith(
      1,
      expect.stringContaining("CREATE TABLE IF NOT EXISTS schema_migrations")
    );
    expect(query).toHaveBeenNthCalledWith(2, "SELECT name FROM schema_migrations ORDER BY name ASC");
    expect(query).toHaveBeenNthCalledWith(3, "BEGIN");
    expect(query).toHaveBeenNthCalledWith(4, "ALTER TABLE users ADD COLUMN IF NOT EXISTS nickname TEXT;");
    expect(query).toHaveBeenNthCalledWith(
      5,
      "INSERT INTO schema_migrations(name) VALUES ($1) ON CONFLICT (name) DO NOTHING",
      ["001_first"]
    );
    expect(query).toHaveBeenNthCalledWith(6, "COMMIT");
    expect(query).toHaveBeenNthCalledWith(7, "BEGIN");
    expect(query).toHaveBeenNthCalledWith(8, "CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at);");
    expect(query).toHaveBeenNthCalledWith(
      9,
      "INSERT INTO schema_migrations(name) VALUES ($1) ON CONFLICT (name) DO NOTHING",
      ["002_second"]
    );
    expect(query).toHaveBeenNthCalledWith(10, "COMMIT");
  });

  it("rolls back the most recently applied migration", async () => {
    const migrationsDir = await mkdtemp(join(tmpdir(), "etk-migrations-"));
    tempDirs.push(migrationsDir);
    await writeFile(join(migrationsDir, "002_second.down.sql"), "DROP INDEX IF EXISTS idx_users_created_at;");

    const query = vi
      .fn()
      .mockResolvedValueOnce(undefined) // ensure table
      .mockResolvedValueOnce({ rows: [{ name: "002_second" }] }) // last migration
      .mockResolvedValueOnce(undefined) // begin
      .mockResolvedValueOnce(undefined) // down sql
      .mockResolvedValueOnce(undefined) // delete
      .mockResolvedValueOnce(undefined); // commit

    const service = new SchemaMigrationService({
      pool: { query },
      migrationsDir,
    });

    const rolledBack = await service.rollbackLastMigration();

    expect(rolledBack).toBe("002_second");
    expect(query).toHaveBeenNthCalledWith(
      1,
      expect.stringContaining("CREATE TABLE IF NOT EXISTS schema_migrations")
    );
    expect(query).toHaveBeenNthCalledWith(2, "SELECT name FROM schema_migrations ORDER BY name DESC LIMIT 1");
    expect(query).toHaveBeenNthCalledWith(3, "BEGIN");
    expect(query).toHaveBeenNthCalledWith(4, "DROP INDEX IF EXISTS idx_users_created_at;");
    expect(query).toHaveBeenNthCalledWith(5, "DELETE FROM schema_migrations WHERE name = $1", ["002_second"]);
    expect(query).toHaveBeenNthCalledWith(6, "COMMIT");
  });

  it("runs pending migrations before appearance normalization through the use case", async () => {
    const schemaMigrationService = {
      runPendingMigrations: vi.fn().mockResolvedValue(undefined),
      ensureAppearanceSettingsShape: vi.fn().mockResolvedValue(undefined),
    };

    const useCase = new EnsureStartupSchemaUseCase({ schemaMigrationService });
    await useCase.execute();

    expect(schemaMigrationService.runPendingMigrations).toHaveBeenCalledTimes(1);
    expect(schemaMigrationService.ensureAppearanceSettingsShape).toHaveBeenCalledTimes(1);
  });
});
