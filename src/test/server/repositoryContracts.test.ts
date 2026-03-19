import { describe, expect, it } from "vitest";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);

const { IAnalyticsRepository } = require("../../../server/src/domain/repositories/IAnalyticsRepository");
const { IAuthSessionRepository } = require("../../../server/src/domain/repositories/IAuthSessionRepository");
const { IBlacklistRepository } = require("../../../server/src/domain/repositories/IBlacklistRepository");
const { ICartRepository } = require("../../../server/src/domain/repositories/ICartRepository");
const { ICategoryRepository } = require("../../../server/src/domain/repositories/ICategoryRepository");
const { ICustomerRepository } = require("../../../server/src/domain/repositories/ICustomerRepository");
const { IOrderRepository } = require("../../../server/src/domain/repositories/IOrderRepository");
const { IPageRepository } = require("../../../server/src/domain/repositories/IPageRepository");
const { IProductRepository } = require("../../../server/src/domain/repositories/IProductRepository");
const { ISettingsRepository } = require("../../../server/src/domain/repositories/ISettingsRepository");
const { IUserRepository } = require("../../../server/src/domain/repositories/IUserRepository");

const { PgAnalyticsRepository } = require("../../../server/src/infrastructure/repositories/PgAnalyticsRepository");
const { PgAuthSessionRepository } = require("../../../server/src/infrastructure/repositories/PgAuthSessionRepository");
const { PgBlacklistRepository } = require("../../../server/src/infrastructure/repositories/PgBlacklistRepository");
const { PgCartRepository } = require("../../../server/src/infrastructure/repositories/PgCartRepository");
const { PgCategoryRepository } = require("../../../server/src/infrastructure/repositories/PgCategoryRepository");
const { PgCustomerRepository } = require("../../../server/src/infrastructure/repositories/PgCustomerRepository");
const { PgOrderRepository } = require("../../../server/src/infrastructure/repositories/PgOrderRepository");
const { PgPageRepository } = require("../../../server/src/infrastructure/repositories/PgPageRepository");
const { PgProductRepository } = require("../../../server/src/infrastructure/repositories/PgProductRepository");
const { PgSettingsRepository } = require("../../../server/src/infrastructure/repositories/PgSettingsRepository");
const { PgUserRepository } = require("../../../server/src/infrastructure/repositories/PgUserRepository");

describe("repository contracts", () => {
  it("keeps postgres repositories behind explicit domain contracts", () => {
    const pool = {} as any;

    expect(new PgAnalyticsRepository(pool)).toBeInstanceOf(IAnalyticsRepository);
    expect(new PgAuthSessionRepository(pool)).toBeInstanceOf(IAuthSessionRepository);
    expect(new PgBlacklistRepository(pool)).toBeInstanceOf(IBlacklistRepository);
    expect(new PgCartRepository(pool)).toBeInstanceOf(ICartRepository);
    expect(new PgCategoryRepository(pool)).toBeInstanceOf(ICategoryRepository);
    expect(new PgCustomerRepository(pool)).toBeInstanceOf(ICustomerRepository);
    expect(new PgOrderRepository(pool)).toBeInstanceOf(IOrderRepository);
    expect(new PgPageRepository(pool)).toBeInstanceOf(IPageRepository);
    expect(new PgProductRepository(pool)).toBeInstanceOf(IProductRepository);
    expect(new PgSettingsRepository(pool)).toBeInstanceOf(ISettingsRepository);
    expect(new PgUserRepository(pool)).toBeInstanceOf(IUserRepository);
  });
});
