import { Connection } from "typeorm";
import request from "supertest";
import { v4 as uuidV4 } from "uuid";
import { hash } from "bcryptjs";

import createConnection from "@database/index";
import { app } from "../../../../app";


let connection: Connection;

describe("Authenticate User Controller", () => {

  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();

    const id = uuidV4();
    const password = await hash("admin", 8);

    await connection.query(
      `INSERT INTO USERS (id, name, email, password, created_at, updated_at)
      values ('${id}', 'admin', 'admin@finapi.com.br', '${password}', 'now()', 'now()')`
    );
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it("should be able to authenticate existent user", async () => {
    const response = await request(app).post("/api/v1/sessions")
      .send({
        email: "admin@finapi.com.br",
        password: "admin"
      });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("token");
    expect(response.body.user).toHaveProperty("id");
    expect(response.body.user.email).toEqual("admin@finapi.com.br");

  });

  it("should not be able to authenticate with nonexistent email", async () => {
    const response = await request(app).post("/api/v1/sessions")
      .send({
        email: "nonexistent@email.com.br",
        password: "admin"
      });

    expect(response.status).toBe(401);
    expect(response.body).toHaveProperty("message");
  });

  it("should not be able to authenticate with incorrect password", async () => {
    const response = await request(app).post("/api/v1/sessions")
      .send({
        email: "admin@finapi.com.br",
        password: "incorrect"
      });

    expect(response.status).toBe(401);
    expect(response.body).toHaveProperty("message");
  });

});