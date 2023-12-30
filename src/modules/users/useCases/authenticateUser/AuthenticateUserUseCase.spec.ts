import { InMemoryUsersRepository } from "@modules/users/repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "../createUser/CreateUserUseCase";
import { AuthenticateUserUseCase } from "./AuthenticateUserUseCase";
import { IncorrectEmailOrPasswordError } from "./IncorrectEmailOrPasswordError";


let createUserUseCase: CreateUserUseCase;
let authenticateUserUseCase: AuthenticateUserUseCase;
let inMemoryUsersRepository: InMemoryUsersRepository;

describe("Authenticate User", () => {

  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository);
    authenticateUserUseCase = new AuthenticateUserUseCase(inMemoryUsersRepository);
  });

  it("should be able to authenticate the user", async () => {
    await createUserUseCase.execute({
      name: "Name Test",
      email: "email@test.com",
      password: "123"
    });

    const authenticatedUser = await authenticateUserUseCase.execute({
      email: "email@test.com",
      password: "123"
    });

    expect(authenticatedUser).toHaveProperty("token");
    expect(authenticatedUser.user).toHaveProperty("id");
    expect(authenticatedUser.user.name).toEqual("Name Test");

  });

  it("should not be able to authenticate a nonexistent user", () => {
    expect(async () => {
      await authenticateUserUseCase.execute({
        email: "email@test.com",
        password: "123"
      });
    }).rejects.toBeInstanceOf(IncorrectEmailOrPasswordError);
  });

  it("should not be able to authenticate with incorrect password", () => {
    expect(async () => {
      await createUserUseCase.execute({
        name: "Name Test",
        email: "email@test.com",
        password: "123"
      });

      await authenticateUserUseCase.execute({
        email: "email@test.com",
        password: "incorrect"
      });
    }).rejects.toBeInstanceOf(IncorrectEmailOrPasswordError);
  });


});