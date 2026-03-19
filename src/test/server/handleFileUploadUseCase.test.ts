import { describe, expect, it } from "vitest";
import handleFileUploadUseCaseModule from "../../../server/src/application/use-cases/upload/HandleFileUpload";

const { HandleFileUploadUseCase } = handleFileUploadUseCaseModule as any;

describe("HandleFileUploadUseCase", () => {
  it("returns the uploaded file public URL", () => {
    const fileStorage = {
      toUploadedFileResponse: (file: { filename: string }) => ({
        url: `/uploads/${file.filename}`,
      }),
    };
    const useCase = new HandleFileUploadUseCase({ fileStorage });

    expect(
      useCase.execute({
        file: {
          filename: "abc123.png",
        },
      })
    ).toEqual({
      url: "/uploads/abc123.png",
    });
  });
});
