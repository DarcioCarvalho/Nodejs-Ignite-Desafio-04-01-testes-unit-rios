import { InMemoryUsersRepository } from "@modules/users/repositories/in-memory/InMemoryUsersRepository";
import { ShowUserProfileError } from "./ShowUserProfileError";
import { ShowUserProfileUseCase } from "./ShowUserProfileUseCase";

let showUserProfileUseCase: ShowUserProfileUseCase;
let inMemoryUsersRepository: InMemoryUsersRepository;

describe("Show User Profile", () => {

  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    showUserProfileUseCase = new ShowUserProfileUseCase(inMemoryUsersRepository);
  });

  it("should be able to show user", async () => {
    const newUser = await inMemoryUsersRepository.create({
      name: "Name Test",
      email: "email@test.com",
      password: "123"
    });

    const user = await showUserProfileUseCase.execute(newUser.id as string);

    expect(user).toHaveProperty("id");
    expect(user.email).toEqual("email@test.com");
  });

  it("should not be able to show nonexistent user", () => {

    expect(async () => {
      await showUserProfileUseCase.execute("nonexistent_id");
    }).rejects.toBeInstanceOf(ShowUserProfileError);

  });



});