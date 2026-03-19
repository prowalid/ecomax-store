import { describe, expect, it, vi } from "vitest";
import integrationsControllerModule from "../../../server/src/presentation/controllers/IntegrationsController";

const {
  facebookCapi,
  whatsappNotify,
  updateGreenApi,
  testOrderWebhook,
} = integrationsControllerModule as any;

function createResponseMock() {
  return {
    payload: undefined as unknown,
    json(payload: unknown) {
      this.payload = payload;
      return this;
    },
  };
}

describe("integrationsController", () => {
  it("delegates facebookCapi to its use case with normalized client ip", async () => {
    const sendFacebookCapiEventUseCase = {
      execute: vi.fn().mockResolvedValue({ success: true }),
    };
    const req = {
      body: { event_name: "PageView", event_id: "evt-1" },
      headers: {
        "x-forwarded-for": "1.2.3.4, 5.6.7.8",
      },
      socket: {
        remoteAddress: "127.0.0.1",
      },
      app: {
        locals: {
          container: {
            resolve: vi.fn().mockReturnValue(sendFacebookCapiEventUseCase),
          },
        },
      },
    };
    const res = createResponseMock();
    const next = vi.fn();

    await facebookCapi(req, res, next);

    expect(sendFacebookCapiEventUseCase.execute).toHaveBeenCalledWith({
      body: { event_name: "PageView", event_id: "evt-1" },
      clientIp: "1.2.3.4",
    });
    expect(res.payload).toEqual({ success: true });
    expect(next).not.toHaveBeenCalled();
  });

  it("delegates whatsappNotify to its use case", async () => {
    const sendWhatsAppNotificationUseCase = {
      execute: vi.fn().mockResolvedValue({ success: true, idMessage: "msg-1" }),
    };
    const req = {
      body: {
        template: "custom",
        phone: "0555000000",
        data: { message: "hello" },
      },
      app: {
        locals: {
          container: {
            resolve: vi.fn().mockReturnValue(sendWhatsAppNotificationUseCase),
          },
        },
      },
    };
    const res = createResponseMock();
    const next = vi.fn();

    await whatsappNotify(req, res, next);

    expect(sendWhatsAppNotificationUseCase.execute).toHaveBeenCalledWith({
      template: "custom",
      phone: "0555000000",
      data: { message: "hello" },
    });
    expect(res.payload).toEqual({ success: true, idMessage: "msg-1" });
    expect(next).not.toHaveBeenCalled();
  });

  it("delegates updateGreenApi to its use case", async () => {
    const updateGreenApiCredentialsUseCase = {
      execute: vi.fn().mockResolvedValue({ success: true, state: "authorized" }),
    };
    const req = {
      body: {
        instance_id: "123",
        api_token: "token",
      },
      app: {
        locals: {
          container: {
            resolve: vi.fn().mockReturnValue(updateGreenApiCredentialsUseCase),
          },
        },
      },
    };
    const res = createResponseMock();
    const next = vi.fn();

    await updateGreenApi(req, res, next);

    expect(updateGreenApiCredentialsUseCase.execute).toHaveBeenCalledWith({
      instanceId: "123",
      apiToken: "token",
    });
    expect(res.payload).toEqual({ success: true, state: "authorized" });
    expect(next).not.toHaveBeenCalled();
  });

  it("delegates testOrderWebhook to its use case", async () => {
    const testOrderWebhookUseCase = {
      execute: vi.fn().mockResolvedValue({ success: true, payload: { ok: true } }),
    };
    const req = {
      app: {
        locals: {
          container: {
            resolve: vi.fn().mockReturnValue(testOrderWebhookUseCase),
          },
        },
      },
    };
    const res = createResponseMock();
    const next = vi.fn();

    await testOrderWebhook(req, res, next);

    expect(testOrderWebhookUseCase.execute).toHaveBeenCalledTimes(1);
    expect(res.payload).toEqual({ success: true, payload: { ok: true } });
    expect(next).not.toHaveBeenCalled();
  });
});
