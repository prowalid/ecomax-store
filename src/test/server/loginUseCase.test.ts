import { beforeEach, describe, expect, it, vi } from "vitest";
import { createRequire } from "node:module";
import loginUseCaseModule from "../../../server/src/application/use-cases/auth/Login";

const { LoginUseCase } = loginUseCaseModule as any;
const require = createRequire(import.meta.url);
const bcrypt = require("../../../server/node_modules/bcryptjs");

describe("LoginUseCase", () => {
  let userRepository: any;
  let authTokenService: any;
  let authSessionService: any;
  let useCase: any;

  beforeEach(() => {
    userRepository = {
      findAuthByPhone: vi.fn(),
    };
    authTokenService = {
      issue: vi.fn().mockReturnValue({
        accessToken: "access-token",
        refreshToken: "refresh-token",
        ttl: { accessMs: 1000, refreshMs: 2000, refreshSeconds: 2 },
      }),
    };
    authSessionService = {
      create: vi.fn(),
    };

    useCase = new LoginUseCase({
      userRepository,
      authTokenService,
      authSessionService,
    });
  });

  it("logs in a valid user and creates a session", async () => {
    userRepository.findAuthByPhone.mockResolvedValue({
      id: "u1",
      name: "Admin",
      phone: "0555000000",
      email: "admin@test.local",
      password_hash: await bcrypt.hash("secret123", 4),
      role: "admin",
      two_factor_enabled: false,
    });

    const result = await useCase.execute({
      phone: "0555 00 00 00",
      password: "secret123",
      requestMeta: { userAgent: "test", ipAddress: "127.0.0.1" },
    });

    expect(userRepository.findAuthByPhone).toHaveBeenCalledWith("0555000000");
    expect(authSessionService.create).toHaveBeenCalled();
    expect(result.user.id).toBe("u1");
    expect(result.accessToken).toBe("access-token");
  });

  it("rejects invalid credentials", async () => {
    userRepository.findAuthByPhone.mockResolvedValue(null);

    await expect(
      useCase.execute({
        phone: "0555000000",
        password: "wrong",
        requestMeta: { userAgent: "test", ipAddress: "127.0.0.1" },
      })
    ).rejects.toMatchObject({
      status: 401,
      message: "Invalid phone or password.",
    });
  });
});
