import { afterEach, describe, expect, it, vi } from "vitest";
import updateGreenApiCredentialsUseCaseModule from "../../../server/src/application/use-cases/integrations/UpdateGreenApiCredentials";

const { UpdateGreenApiCredentialsUseCase } = updateGreenApiCredentialsUseCaseModule as any;

describe("UpdateGreenApiCredentialsUseCase", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("verifies credentials and persists the merged WhatsApp settings", async () => {
    const settingsRepository = {
      findValueByKey: vi.fn().mockResolvedValue({
        enabled_notifications: { order_confirmed: true },
      }),
      saveValue: vi.fn().mockResolvedValue({}),
    };

    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ stateInstance: "authorized" }),
      })
    );

    const useCase = new UpdateGreenApiCredentialsUseCase({ settingsRepository });
    const result = await useCase.execute({
      instanceId: "12345",
      apiToken: "token-123",
    });

    expect(result).toEqual({
      success: true,
      state: "authorized",
      message: "تم التحقق من بيانات Green API بنجاح",
    });
    expect(settingsRepository.saveValue).toHaveBeenCalledWith(
      "whatsapp_notifications",
      {
        enabled_notifications: { order_confirmed: true },
        api_configured: true,
        instance_id: "12345",
        api_token: "token-123",
      }
    );
  });
});
