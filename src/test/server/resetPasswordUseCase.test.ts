import { beforeEach, describe, expect, it, vi } from "vitest";
import { createRequire } from "node:module";
import resetPasswordUseCaseModule from "../../../server/src/application/use-cases/auth/ResetPassword";

const { ResetPasswordUseCase } = resetPasswordUseCaseModule as any;
const require = createRequire(import.meta.url);
const bcrypt = require("../../../server/node_modules/bcryptjs");

describe("ResetPasswordUseCase", () => {
  let userRepository: any;
  let useCase: any;

  beforeEach(() => {
    userRepository = {
      findRecoveryByPhone: vi.fn(),
      resetPasswordWithRecovery: vi.fn(),
    };

    useCase = new ResetPasswordUseCase({ userRepository });
  });

  it("resets password when code is valid and not expired", async () => {
    userRepository.findRecoveryByPhone.mockResolvedValue({
      id: "u1",
      recovery_code: "123456",
      recovery_code_expires_at: new Date(Date.now() + 60_000).toISOString(),
    });

    const result = await useCase.execute({
      phone: "0555000000",
      code: "123456",
      newPassword: "newpass123",
    });

    expect(userRepository.resetPasswordWithRecovery).toHaveBeenCalledWith("u1", expect.any(String));
    const hashed = userRepository.resetPasswordWithRecovery.mock.calls[0][1];
    expect(await bcrypt.compare("newpass123", hashed)).toBe(true);
    expect(result).toEqual({ message: "تم إعادة تعيين كلمة المرور بنجاح." });
  });
});
