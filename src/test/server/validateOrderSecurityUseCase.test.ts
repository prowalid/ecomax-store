import { describe, expect, it, vi } from "vitest";
import validateOrderSecurityUseCaseModule from "../../../server/src/application/use-cases/security/ValidateOrderSecurity";

const { ValidateOrderSecurityUseCase } = validateOrderSecurityUseCaseModule as any;

function createUseCase(overrides: Record<string, unknown> = {}) {
  return new ValidateOrderSecurityUseCase({
    settingsRepository: {
      findValueByKey: vi.fn().mockResolvedValue({
        honeypot_enabled: true,
        turnstile_enabled: false,
      }),
    },
    blacklistRepository: {
      findMatches: vi.fn().mockResolvedValue([]),
    },
    orderRepository: {
      hasRecentOrderAttempt: vi.fn().mockResolvedValue(false),
    },
    turnstileVerifier: {
      verify: vi.fn().mockResolvedValue({ success: true, errorCodes: [] }),
    },
    ...overrides,
  });
}

describe("ValidateOrderSecurityUseCase", () => {
  it("allows a valid order request", async () => {
    const useCase = createUseCase();

    await expect(
      useCase.execute({
        customerPhone: "0555000000",
        websiteUrl: "",
        turnstileToken: null,
        clientIp: "1.2.3.4",
      })
    ).resolves.toEqual({
      allowed: true,
      security: {
        honeypot_enabled: true,
        turnstile_enabled: false,
      },
    });
  });

  it("blocks blacklisted values", async () => {
    const useCase = createUseCase({
      blacklistRepository: {
        findMatches: vi.fn().mockResolvedValue([{ type: "phone", value: "0555000000" }]),
      },
    });

    await expect(
      useCase.execute({
        customerPhone: "0555000000",
        websiteUrl: "",
        turnstileToken: null,
        clientIp: "1.2.3.4",
      })
    ).rejects.toMatchObject({
      status: 403,
      code: "BLACKLISTED",
    });
  });

  it("blocks duplicate recent orders", async () => {
    const useCase = createUseCase({
      orderRepository: {
        hasRecentOrderAttempt: vi.fn().mockResolvedValue(true),
      },
    });

    await expect(
      useCase.execute({
        customerPhone: "0555000000",
        websiteUrl: "",
        turnstileToken: null,
        clientIp: "1.2.3.4",
      })
    ).rejects.toMatchObject({
      status: 429,
      code: "DUPLICATE_ORDER",
    });
  });

  it("requires turnstile token when enabled", async () => {
    const useCase = createUseCase({
      settingsRepository: {
        findValueByKey: vi.fn().mockResolvedValue({
          honeypot_enabled: true,
          turnstile_enabled: true,
          secret_key: "secret",
        }),
      },
    });

    await expect(
      useCase.execute({
        customerPhone: "0555000000",
        websiteUrl: "",
        turnstileToken: "",
        clientIp: "1.2.3.4",
      })
    ).rejects.toMatchObject({
      status: 400,
      code: "MISSING_TURNSTILE_TOKEN",
    });
  });
});
