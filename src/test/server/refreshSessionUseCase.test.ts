import { beforeEach, describe, expect, it, vi } from "vitest";
import refreshSessionUseCaseModule from "../../../server/src/application/use-cases/auth/RefreshSession";

const { RefreshSessionUseCase } = refreshSessionUseCaseModule as any;

describe("RefreshSessionUseCase", () => {
  let userRepository: any;
  let authTokenService: any;
  let authSessionService: any;
  let useCase: any;

  beforeEach(() => {
    userRepository = {
      findPublicById: vi.fn(),
    };
    authTokenService = {
      verify: vi.fn().mockReturnValue({ sessionId: "s1", id: "u1" }),
      issue: vi.fn().mockReturnValue({
        accessToken: "next-access",
        refreshToken: "next-refresh",
        ttl: { accessMs: 1000, refreshMs: 2000, refreshSeconds: 2 },
      }),
    };
    authSessionService = {
      validate: vi.fn().mockResolvedValue({ id: "s1" }),
      rotate: vi.fn().mockResolvedValue({ id: "s1" }),
    };

    useCase = new RefreshSessionUseCase({
      userRepository,
      authTokenService,
      authSessionService,
    });
  });

  it("rotates a valid refresh session", async () => {
    userRepository.findPublicById.mockResolvedValue({
      id: "u1",
      name: "Admin",
      phone: "0555000000",
      role: "admin",
    });

    const result = await useCase.execute({
      refreshToken: "refresh-token",
      requestMeta: { userAgent: "ua", ipAddress: "127.0.0.1" },
    });

    expect(authTokenService.verify).toHaveBeenCalledWith("refresh-token", "refresh");
    expect(authSessionService.rotate).toHaveBeenCalled();
    expect(result.user.id).toBe("u1");
  });

  it("rejects when refresh session is invalid", async () => {
    authSessionService.validate.mockResolvedValue(null);

    await expect(
      useCase.execute({
        refreshToken: "refresh-token",
        requestMeta: { userAgent: "ua", ipAddress: "127.0.0.1" },
      })
    ).rejects.toMatchObject({
      status: 401,
      message: "Refresh session is invalid or revoked.",
    });
  });
});
