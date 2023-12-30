import { InMemoryUsersRepository } from "@modules/users/repositories/in-memory/InMemoryUsersRepository";
import { InMemoryStatementsRepository } from "@modules/statements/repositories/in-memory/InMemoryStatementsRepository";
import { CreateStatementError } from "./CreateStatementError";
import { CreateStatementUseCase } from "./CreateStatementUseCase";

let inMemoryUsersRepository: InMemoryUsersRepository;
let inMemoryStatementsRepository: InMemoryStatementsRepository;
let createStatementUseCase: CreateStatementUseCase;

export enum OperationType {
  DEPOSIT = 'deposit',
  WITHDRAW = 'withdraw',
}

describe("Create Statement", () => {

  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    inMemoryStatementsRepository = new InMemoryStatementsRepository();
    createStatementUseCase = new CreateStatementUseCase(
      inMemoryUsersRepository, inMemoryStatementsRepository);
  });

  it("should be able to create deposit statement", async () => {
    const user = await inMemoryUsersRepository.create({
      name: "Name User",
      email: "email@test.com",
      password: "123"
    });

    const user_id = user.id as string;

    const deposit = await createStatementUseCase.execute({
      user_id,
      type: OperationType.DEPOSIT,
      description: "deposit test",
      amount: 100
    });

    expect(deposit).toHaveProperty("id");
    expect(deposit.description).toBe("deposit test");
    expect(deposit.amount).toBe(100);

  });

  it("should be able to create withdraw statement", async () => {
    const user = await inMemoryUsersRepository.create({
      name: "Name User",
      email: "email@test.com",
      password: "123"
    });

    const user_id = user.id as string;

    await createStatementUseCase.execute({
      user_id,
      type: OperationType.DEPOSIT,
      description: "deposit test",
      amount: 100
    });

    const withdraw = await createStatementUseCase.execute({
      user_id,
      type: OperationType.WITHDRAW,
      description: "withdraw test",
      amount: 50
    });

    expect(withdraw).toHaveProperty("id");
    expect(withdraw.description).toBe("withdraw test");
    expect(withdraw.amount).toBe(50);

  });

  it("should not be able to create statement if nonexistent user", () => {

    expect(async () => {
      await createStatementUseCase.execute({
        user_id: "12345",
        type: OperationType.DEPOSIT,
        description: "deposit test",
        amount: 100
      });
    }).rejects.toBeInstanceOf(CreateStatementError.UserNotFound);

  });

  it("should not be able to create withdraw statement if insufficient funds", () => {
    expect(async () => {
      const user = await inMemoryUsersRepository.create({
        name: "Name User",
        email: "email@test.com",
        password: "123"
      });

      const user_id = user.id as string;

      await createStatementUseCase.execute({
        user_id,
        type: OperationType.DEPOSIT,
        description: "deposit test",
        amount: 100
      });

      await createStatementUseCase.execute({
        user_id,
        type: OperationType.WITHDRAW,
        description: "withdraw test",
        amount: 250
      });
    }).rejects.toBeInstanceOf(CreateStatementError.InsufficientFunds);

  });

});