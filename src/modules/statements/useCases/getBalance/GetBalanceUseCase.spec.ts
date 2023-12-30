import { InMemoryUsersRepository } from "@modules/users/repositories/in-memory/InMemoryUsersRepository";
import { InMemoryStatementsRepository } from "@modules/statements/repositories/in-memory/InMemoryStatementsRepository";
import { OperationType } from "../createStatement/CreateStatementUseCase.spec";
import { GetBalanceError } from "./GetBalanceError";
import { GetBalanceUseCase } from "./GetBalanceUseCase";

let inMemoryUsersRepository: InMemoryUsersRepository;
let inMemoryStatementsRepository: InMemoryStatementsRepository;
let getBalanceUseCase: GetBalanceUseCase;

describe("Get Balance", () => {

  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    inMemoryStatementsRepository = new InMemoryStatementsRepository();
    getBalanceUseCase = new GetBalanceUseCase(
      inMemoryStatementsRepository, inMemoryUsersRepository);
  });

  it("should be able to get balance of the user", async () => {
    const user = await inMemoryUsersRepository.create({
      name: "Name User",
      email: "email@test.com",
      password: "123"
    });

    const user_id = user.id as string;

    await inMemoryStatementsRepository.create({
      user_id,
      type: OperationType.DEPOSIT,
      description: "deposit test",
      amount: 100
    });

    await inMemoryStatementsRepository.create({
      user_id,
      type: OperationType.DEPOSIT,
      description: "deposit test",
      amount: 300
    });

    await inMemoryStatementsRepository.create({
      user_id,
      type: OperationType.WITHDRAW,
      description: "withdraw test",
      amount: 50
    });

    const balance = await getBalanceUseCase.execute({ user_id });

    expect(balance).toHaveProperty("balance");
    expect(balance.statement.length).toBe(3);
    expect(balance.statement[2].type).toEqual(OperationType.WITHDRAW);
    expect(balance.balance).toBe(350);
  });

  it("should not be able to get balance of the nonexistent user", () => {

    expect(async () => {
      const balance = await getBalanceUseCase.execute({ user_id: "12345" });
    }).rejects.toBeInstanceOf(GetBalanceError);

  });

});