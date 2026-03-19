import { beforeEach, describe, expect, it, vi } from "vitest";
import { createRequire } from "node:module";
import registerUseCaseModule from "../../../server/src/application/use-cases/auth/Register";

const { RegisterUseCase } = registerUseCaseModule as any;
const require = createRequire(import.meta.url);
const bcrypt = require("../../../server/node_modules/bcryptjs");

describe("RegisterUseCase", () => {
  let userRepository: any;
  let authTokenService: any;
  let authSessionService: any;
  let useCase: any;

  beforeEach(() => {
    userRepository = {
      countAll: vi.fn(),
      createAdmin: vi.fn(),
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

    useCase = new RegisterUseCase({
      userRepository,
      authTokenService,
      authSessionService,
    });
  });

  it("creates the first admin account and session", async () => {
    userRepository.countAll.mockResolvedValue(0);
    userRepository.createAdmin.mockResolvedValue({
      id: "u1",
      name: "Admin",
      phone: "0555000000",
      role: "admin",
    });

    const result = await useCase.execute({
      name: " Admin ",
      phone: "0555 00 00 00",
      password: "secret123",
      requestMeta: { userAgent: "ua", ipAddress: "127.0.0.1" },
    });

    expect(userRepository.createAdmin).toHaveBeenCalledTimes(1);
    expect(userRepository.createAdmin.mock.calls[0][0]).toMatchObject({
      id: null,
      name: "Admin",
      phone: "0555000000",
      email: "admin-0555000000@internal.etk",
      role: "admin",
    });
    expect(await bcrypt.compare("secret123", userRepository.createAdmin.mock.calls[0][0].passwordHash)).toBe(true);
    expect(authSessionService.create).toHaveBeenCalled();
    expect(result.user.id).toBe("u1");
  });

  it("rejects registration when an admin already exists", async () => {
    userRepository.countAll.mockResolvedValue(1);

    await expect(
      useCase.execute({
        name: "Admin",
        phone: "0555000000",
        password: "secret123",
        requestMeta: { userAgent: "ua", ipAddress: "127.0.0.1" },
      })
    ).rejects.toMatchObject({
      status: 403,
      message: "Registration is closed. An admin already exists.",
    });
  });
});
