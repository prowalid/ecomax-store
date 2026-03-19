import { describe, expect, it, vi } from "vitest";
import authSessionServiceModule from "../../../server/src/infrastructure/services/AuthSessionService";

const { AuthSessionService } = authSessionServiceModule as any;

describe("AuthSessionService", () => {
  it("delegates create/rotate/revoke/validate to the repository", async () => {
    const authSessionRepository = {
      create: vi.fn().mockResolvedValue("session-1"),
      rotate: vi.fn().mockResolvedValue({ id: "session-1" }),
      revoke: vi.fn().mockResolvedValue({ id: "session-1" }),
      validateRefreshSession: vi.fn().mockResolvedValue({ id: "session-1" }),
    };

    const service = new AuthSessionService({ authSessionRepository });

    await expect(service.create({ userId: "u1" })).resolves.toBe("session-1");
    await expect(service.rotate({ sessionId: "s1" })).resolves.toEqual({ id: "session-1" });
    await expect(service.revoke("s1", "logout")).resolves.toEqual({ id: "session-1" });
    await expect(service.validate({ sessionId: "s1" })).resolves.toEqual({ id: "session-1" });

    expect(authSessionRepository.create).toHaveBeenCalledWith({ userId: "u1" });
    expect(authSessionRepository.rotate).toHaveBeenCalledWith({ sessionId: "s1" });
    expect(authSessionRepository.revoke).toHaveBeenCalledWith("s1", "logout");
    expect(authSessionRepository.validateRefreshSession).toHaveBeenCalledWith({ sessionId: "s1" });
  });
});
