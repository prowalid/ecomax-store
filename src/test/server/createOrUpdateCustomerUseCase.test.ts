import { beforeEach, describe, expect, it, vi } from "vitest";
import createOrUpdateCustomerUseCaseModule from "../../../server/src/application/use-cases/customers/CreateOrUpdateCustomer";

const { CreateOrUpdateCustomerUseCase } = createOrUpdateCustomerUseCaseModule as any;

describe("CreateOrUpdateCustomerUseCase", () => {
  let customerRepository: any;
  let useCase: any;

  beforeEach(() => {
    customerRepository = {
      findByPhone: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    };

    useCase = new CreateOrUpdateCustomerUseCase({ customerRepository });
  });

  it("creates a new customer when phone does not exist", async () => {
    customerRepository.findByPhone.mockResolvedValue(null);
    customerRepository.create.mockResolvedValue({
      id: "c1",
      name: "Ahmed",
      phone: "0555000000",
    });

    const result = await useCase.execute({
      name: "Ahmed",
      phone: "0555000000",
    });

    expect(customerRepository.create).toHaveBeenCalled();
    expect(result).toEqual({
      created: true,
      customer: {
        id: "c1",
        name: "Ahmed",
        phone: "0555000000",
      },
    });
  });

  it("updates an existing customer when phone already exists", async () => {
    customerRepository.findByPhone.mockResolvedValue({ id: "c1", phone: "0555000000" });
    customerRepository.update.mockResolvedValue({
      id: "c1",
      name: "Ahmed Updated",
      phone: "0555000000",
    });

    const result = await useCase.execute({
      name: "Ahmed Updated",
      phone: "0555000000",
      wilaya: "Algiers",
    });

    expect(customerRepository.update).toHaveBeenCalledTimes(1);
    expect(customerRepository.update.mock.calls[0][0]).toBe("c1");
    expect(customerRepository.update.mock.calls[0][1].toPersistence()).toEqual({
      id: null,
      name: "Ahmed Updated",
      phone: "0555000000",
      wilaya: "Algiers",
      commune: null,
      address: null,
      notes: null,
    });
    expect(result).toEqual({
      created: false,
      customer: {
        id: "c1",
        name: "Ahmed Updated",
        phone: "0555000000",
      },
    });
  });
});
