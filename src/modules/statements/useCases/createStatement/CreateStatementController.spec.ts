import { Connection } from "typeorm";
import request from "supertest";
import { v4 as uuidV4 } from "uuid";
import { hash } from "bcryptjs";

import createConnection from "@database/index";
import { app } from "../../../../app";


let connection: Connection;

describe("Create Statement Controller", () => {

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

  it("should be able to create a new deposit statement", async () => {
    const responseToken = await request(app).post("/api/v1/sessions")
      .send({
        email: "admin@finapi.com.br",
        password: "admin"
      });

    const { token } = responseToken.body;

    const response = await request(app).post("/api/v1/statements/deposit")
      .send({
        amount: 200,
        description: "Deposit Statement Test"
      })
      .set({
        Authorization: `Bearer ${token}`
      });

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty("id");
    expect(response.body.type).toBe("deposit");
    expect(response.body.amount).toBe(200);

  });

  it("should be able to create a new withdraw statement", async () => {
    const responseToken = await request(app).post("/api/v1/sessions")
      .send({
        email: "admin@finapi.com.br",
        password: "admin"
      });

    const { token } = responseToken.body;

    const response = await request(app).post("/api/v1/statements/withdraw")
      .send({
        amount: 80,
        description: "Withdraw Statement Test"
      })
      .set({
        Authorization: `Bearer ${token}`
      });

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty("id");
    expect(response.body.type).toBe("withdraw");
    expect(response.body.amount).toBe(80);

  });

  it("should not be able to create a new withdraw statement if insufficient funds", async () => {
    const responseToken = await request(app).post("/api/v1/sessions")
      .send({
        email: "admin@finapi.com.br",
        password: "admin"
      });

    const { token } = responseToken.body;

    const response = await request(app).post("/api/v1/statements/withdraw")
      .send({
        amount: 200,
        description: "Withdraw Statement Test"
      })
      .set({
        Authorization: `Bearer ${token}`
      });

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty("message");

  });

  it("should not be able to create deposit statement with incorrect token", async () => {
    const response = await request(app).post("/api/v1/statements/deposit")
      .send({
        amount: 200,
        description: "Deposit Statement Test"
      })
      .set({
        Authorization: `Bearer incorrect_token`
      });

    expect(response.status).toBe(401);
    expect(response.body).toHaveProperty("message");
  });

});