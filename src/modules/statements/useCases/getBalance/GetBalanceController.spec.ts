import { Connection } from "typeorm";
import request from "supertest";
import { v4 as uuidV4 } from "uuid";
import { hash } from "bcryptjs";

import createConnection from "@database/index";
import { app } from "../../../../app";


let connection: Connection;

describe("Get Balance Controller", () => {

  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();

    const id = uuidV4();
    const password = await hash("admin", 8);

    await connection.query(
      `INSERT INTO USERS (id, name, email, password, created_at, updated_at)
      values ('${id}', 'admin', 'admin@finapi.com.br', '${password}', 'now()', 'now()')`
    );

    const statement_id1 = uuidV4();
    const statement_id2 = uuidV4();

    await connection.query(
      `INSERT INTO STATEMENTS (id, user_id, description, amount, type, created_at, updated_at)
          values ('${statement_id1}', '${id}', 'deposit 1 description', 100.0, 'deposit', 'now()', 'now()' )`
    );

    await connection.query(
      `INSERT INTO STATEMENTS (id, user_id, description, amount, type, created_at, updated_at)
      values ('${statement_id2}', '${id}', 'deposit 2 description', 250.0, 'deposit', 'now()', 'now()' )`
    );

  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it("should be able to get user balance", async () => {
    const responseToken = await request(app).post("/api/v1/sessions")
      .send({
        email: "admin@finapi.com.br",
        password: "admin"
      });

    const { token } = responseToken.body;

    const response = await request(app).get("/api/v1/statements/balance")
      .set({
        Authorization: `Bearer ${token}`
      });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("statement");
    expect(response.body.statement.length).toBe(2);
    expect(response.body).toHaveProperty("balance");
    expect(response.body.balance).toBe(350);

  });

  it("should not be able to show user profile with incorrect token", async () => {
    const response = await request(app).get("/api/v1/statements/balance")
      .set({
        Authorization: `Bearer incorrect_token`
      });

    expect(response.status).toBe(401);
    expect(response.body).toHaveProperty("message");
  });

});