import { beforeEach, describe, expect, it, vi } from "vitest";
import updateProfileUseCaseModule from "../../../server/src/application/use-cases/auth/UpdateProfile";

const { UpdateProfileUseCase } = updateProfileUseCaseModule as any;

describe("UpdateProfileUseCase", () => {
  let userRepository: any;
  let useCase: any;

  beforeEach(() => {
    userRepository = {
      updateProfile: vi.fn(),
    };

    useCase = new UpdateProfileUseCase({ userRepository });
  });

  it("normalizes phone and internal email before updating profile", async () => {
    userRepository.updateProfile.mockResolvedValue({
      id: "u1",
      name: "Admin",
      phone: "0555000000",
      role: "admin",
      two_factor_enabled: false,
    });

    const result = await useCase.execute({
      userId: "u1",
      name: "  Admin  ",
      phone: "0555 00 00 00",
    });

    expect(userRepository.updateProfile).toHaveBeenCalledTimes(1);
    expect(userRepository.updateProfile.mock.calls[0][0]).toBe("u1");
    expect(userRepository.updateProfile.mock.calls[0][1].toPersistence()).toEqual({
      id: null,
      name: "Admin",
      phone: "0555000000",
      email: "admin-0555000000@internal.etk",
      role: "admin",
      two_factor_enabled: false,
    });
    expect(result.id).toBe("u1");
  });
});
