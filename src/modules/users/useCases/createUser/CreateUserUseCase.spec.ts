import { AppError } from "@shared/errors/AppError";
import { InMemoryUsersRepository } from "@modules/users/repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "./CreateUserUseCase";

let createUserUseCase: CreateUserUseCase;
let inMemoryUsersRepository: InMemoryUsersRepository;

describe("Create User", () => {

  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository);
  })

  it("should be able to create a new user", async () => {

    const user = await createUserUseCase.execute({
      name: "Name Test",
      email: "email@test.com",
      password: "123"
    });

    expect(user).toHaveProperty("id");
    expect(user.name).toEqual("Name Test");

  });

  it("should not be able to create a new user if email exists", () => {

    inMemoryUsersRepository.create({
      name: "Name Test",
      email: "email@test.com",
      password: "123"
    });

    expect(async () => {
      await createUserUseCase.execute({
        name: "Other Name Test",
        email: "email@test.com",
        password: "456"
      });
    }).rejects.toBeInstanceOf(AppError);

  });


});