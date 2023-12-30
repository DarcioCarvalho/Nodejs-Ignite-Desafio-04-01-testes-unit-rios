import { Connection } from "typeorm";
import request from "supertest";
import { v4 as uuidV4 } from "uuid";
import { hash } from "bcryptjs";

import createConnection from "@database/index";
import { app } from "../../../../app";


let connection: Connection;

describe("Get Statement Operation Controller", () => {

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

  it("should be able to get a statement operation by id", async () => {
    const responseToken = await request(app).post("/api/v1/sessions")
      .send({
        email: "admin@finapi.com.br",
        password: "admin"
      });

    const { token } = responseToken.body;

    const responseDeposit = await request(app).post("/api/v1/statements/deposit")
      .send({
        amount: 200,
        description: "Deposit Statement Test"
      })
      .set({
        Authorization: `Bearer ${token}`
      });

    const { id: statement_id } = responseDeposit.body;

    const response = await request(app).get(`/api/v1/statements/${statement_id}`)
      .set({
        Authorization: `Bearer ${token}`
      });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("type");
    expect(response.body.type).toBe("deposit");
    expect(response.body.amount).toBe(200);

  });

  it("should not be able to get a statement operation with incorrect id", async () => {
    const responseToken = await request(app).post("/api/v1/sessions")
      .send({
        email: "admin@finapi.com.br",
        password: "admin"
      });

    const { token } = responseToken.body;
    const incorrect_id = uuidV4();

    const response = await request(app).get(`/api/v1/statements/${incorrect_id}`)
      .set({
        Authorization: `Bearer ${token}`
      });

    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty("message");

  });


  it("should not be able to get a statement operation with incorrect token", async () => {
    const responseToken = await request(app).post("/api/v1/sessions")
      .send({
        email: "admin@finapi.com.br",
        password: "admin"
      });

    const { token } = responseToken.body;

    const responseDeposit = await request(app).post("/api/v1/statements/deposit")
      .send({
        amount: 140,
        description: "Deposit Statement Test"
      })
      .set({
        Authorization: `Bearer ${token}`
      });

    const { id: statement_id } = responseDeposit.body;

    const response = await request(app).get(`/api/v1/statements/${statement_id}`)
      .set({
        Authorization: `Bearer incorrect_token`
      });

    expect(response.status).toBe(401);
    expect(response.body).toHaveProperty("message");
  });

});