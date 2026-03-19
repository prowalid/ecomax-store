import { beforeEach, describe, expect, it, vi } from "vitest";
import { createRequire } from "node:module";
import changePasswordUseCaseModule from "../../../server/src/application/use-cases/auth/ChangePassword";

const { ChangePasswordUseCase } = changePasswordUseCaseModule as any;
const require = createRequire(import.meta.url);
const bcrypt = require("../../../server/node_modules/bcryptjs");

describe("ChangePasswordUseCase", () => {
  let userRepository: any;
  let useCase: any;

  beforeEach(() => {
    userRepository = {
      findPasswordHashById: vi.fn(),
      updatePassword: vi.fn(),
    };

    useCase = new ChangePasswordUseCase({ userRepository });
  });

  it("updates password when current password is valid", async () => {
    userRepository.findPasswordHashById.mockResolvedValue({
      password_hash: await bcrypt.hash("oldpass", 4),
    });

    const result = await useCase.execute({
      userId: "u1",
      currentPassword: "oldpass",
      newPassword: "newpass123",
    });

    expect(userRepository.updatePassword).toHaveBeenCalledWith("u1", expect.any(String));
    const hashed = userRepository.updatePassword.mock.calls[0][1];
    expect(await bcrypt.compare("newpass123", hashed)).toBe(true);
    expect(result).toEqual({ message: "تم تغيير كلمة المرور بنجاح." });
  });

  it("rejects invalid current password", async () => {
    userRepository.findPasswordHashById.mockResolvedValue({
      password_hash: await bcrypt.hash("oldpass", 4),
    });

    await expect(
      useCase.execute({
        userId: "u1",
        currentPassword: "wrong",
        newPassword: "newpass123",
      })
    ).rejects.toMatchObject({
      status: 400,
      message: "كلمة المرور الحالية غير صحيحة.",
    });
  });
});
