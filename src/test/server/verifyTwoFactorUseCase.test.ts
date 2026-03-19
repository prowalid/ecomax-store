import { beforeEach, describe, expect, it, vi } from "vitest";
import { createRequire } from "node:module";
import verifyTwoFactorUseCaseModule from "../../../server/src/application/use-cases/auth/VerifyTwoFactor";

const { VerifyTwoFactorUseCase } = verifyTwoFactorUseCaseModule as any;
const require = createRequire(import.meta.url);
const otplib = require("../../../server/node_modules/otplib");

describe("VerifyTwoFactorUseCase", () => {
  let userRepository: any;
  let useCase: any;

  beforeEach(() => {
    userRepository = {
      findTwoFactorSecretById: vi.fn(),
      enableTwoFactor: vi.fn(),
    };

    useCase = new VerifyTwoFactorUseCase({ userRepository });
  });

  it("enables 2FA when the provided code is valid", async () => {
    const secret = "KVKFKRCPNZQUYMLXOVYDSQKJKZDTSRLD";
    const code = otplib.authenticator.generate(secret);
    userRepository.findTwoFactorSecretById.mockResolvedValue(secret);

    const result = await useCase.execute({
      userId: "u1",
      code,
    });

    expect(userRepository.enableTwoFactor).toHaveBeenCalledWith("u1");
    expect(result).toEqual({ message: "تم تفعيل المصادقة الثنائية بنجاح." });
  });
});
