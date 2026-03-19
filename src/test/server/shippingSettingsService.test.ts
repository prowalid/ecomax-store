import { describe, expect, it, vi } from "vitest";
import shippingSettingsServiceModule from "../../../server/src/application/services/ShippingSettingsService";

const { ShippingSettingsService } = shippingSettingsServiceModule as any;

describe("ShippingSettingsService", () => {
  it("merges partial shipping settings over defaults", async () => {
    const settingsRepository = {
      findValueByKey: vi.fn().mockResolvedValue({
        provider: { active_provider: "yalidine" },
        yalidine: { enabled: true, api_token: "secret" },
      }),
    };

    const service = new ShippingSettingsService({ settingsRepository });
    const result = await service.getSettings();

    expect(settingsRepository.findValueByKey).toHaveBeenCalledWith("shipping");
    expect(result.provider.active_provider).toBe("yalidine");
    expect(result.yalidine.enabled).toBe(true);
    expect(result.yalidine.api_token).toBe("secret");
    expect(result.guepex.enabled).toBe(false);
    expect(Array.isArray(result.wilayas)).toBe(true);
  });
});
