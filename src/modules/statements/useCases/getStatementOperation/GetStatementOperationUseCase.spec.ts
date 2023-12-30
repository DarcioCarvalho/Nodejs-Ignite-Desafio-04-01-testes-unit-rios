import { InMemoryUsersRepository } from "@modules/users/repositories/in-memory/InMemoryUsersRepository";
import { InMemoryStatementsRepository } from "@modules/statements/repositories/in-memory/InMemoryStatementsRepository";
import { OperationType } from "../createStatement/CreateStatementUseCase.spec";
import { GetStatementOperationError } from "./GetStatementOperationError";
import { GetStatementOperationUseCase } from "./GetStatementOperationUseCase";

let inMemoryUsersRepository: InMemoryUsersRepository;
let inMemoryStatementsRepository: InMemoryStatementsRepository;
let getStatementOperationUseCase: GetStatementOperationUseCase;

describe("Get Statement Operation", () => {

  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    inMemoryStatementsRepository = new InMemoryStatementsRepository();
    getStatementOperationUseCase = new GetStatementOperationUseCase(
      inMemoryUsersRepository, inMemoryStatementsRepository);
  });

  it("should be able to get statement operation", async () => {
    const user = await inMemoryUsersRepository.create({
      name: "Name User",
      email: "email@test.com",
      password: "123"
    });

    const user_id = user.id as string;

    const deposit = await inMemoryStatementsRepository.create({
      user_id,
      type: OperationType.DEPOSIT,
      description: "deposit test",
      amount: 100
    });

    const statement_id = deposit.id as string;

    const statement = await getStatementOperationUseCase.execute({
      statement_id,
      user_id
    });

    expect(statement).toHaveProperty("id");
    expect(statement.description).toBe("deposit test");
    expect(statement.amount).toBe(100);

  });

  it("should not be able to get statement with nonexistent user", () => {
    expect(async () => {
      await getStatementOperationUseCase.execute({
        statement_id: "statementId",
        user_id: "userId"
      });
    }).rejects.toBeInstanceOf(GetStatementOperationError.UserNotFound);
  });

  it("should not be able to get statement with nonexistent statement", () => {
    expect(async () => {
      const user = await inMemoryUsersRepository.create({
        name: "Name User",
        email: "email@test.com",
        password: "123"
      });

      const user_id = user.id as string;

      await getStatementOperationUseCase.execute({
        statement_id: "statementId",
        user_id
      });
    }).rejects.toBeInstanceOf(GetStatementOperationError.StatementNotFound);
  });

});