import { describe, expect, it, vi } from "vitest";
import uploadControllerModule from "../../../server/src/presentation/controllers/UploadController";

const { uploadController } = uploadControllerModule as any;

function createResponseMock() {
  return {
    payload: undefined as unknown,
    json(payload: unknown) {
      this.payload = payload;
      return this;
    },
  };
}

describe("uploadController", () => {
  it("delegates uploaded file handling to the use case", () => {
    const handleFileUploadUseCase = {
      execute: vi.fn().mockReturnValue({ url: "/uploads/file.png" }),
    };
    const req = {
      file: { filename: "file.png" },
      app: {
        locals: {
          container: {
            resolve: vi.fn().mockReturnValue(handleFileUploadUseCase),
          },
        },
      },
    };
    const res = createResponseMock();
    const next = vi.fn();

    uploadController(req, res, next);

    expect(handleFileUploadUseCase.execute).toHaveBeenCalledWith({
      file: { filename: "file.png" },
    });
    expect(res.payload).toEqual({ url: "/uploads/file.png" });
    expect(next).not.toHaveBeenCalled();
  });
});
