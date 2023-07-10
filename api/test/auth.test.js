import request from "supertest";
import pool from "../database/config";
import app from "../app";

describe("GET /auth", () => {
  it("should return 200 status code and a User object if request contains a valid session cookie", async () => {
    // Log In to create a session
    const loginResponse = await request(app).post("/auth/login").send({
      email: "test@mail.com",
      password: "password",
    });

    // Retrieve the session cookie from the response
    const sessionCookie = loginResponse.header["set-cookie"][0];

    // Once the session is created, call the /auth endpoint and attach the session cookie to the request
    const response = await request(app)
      .get("/auth")
      .set("Cookie", [sessionCookie])
      .send();

    expect(response.statusCode).toBe(200);
    expect(response.body).toStrictEqual({
      id: 1,
      email: "test@mail.com",
      isTeacher: true,
    });

    // Test Cleanup - Reset the 'last_login' field of this user to its original value
    try {
      await pool.query(
        "UPDATE member SET last_login = $1 WHERE email = 'test@mail.com'",
        [new Date(2023, 6, 9)]
      );
    } catch (error) {
      console.error("*** TEST CLEANUP FAILED ***");
      console.error(error);
    }
  });

  it("should return 401 status code if request contains an invalid session cookie", async () => {
    const response = await request(app)
      .get("/auth")
      .set("Cookie", ["invalidSessionCookie"])
      .send();

    expect(response.statusCode).toBe(401);
  });

  it("should return 401 status code if request contains no session cookie", async () => {
    const response = await request(app).get("/auth").send();

    expect(response.statusCode).toBe(401);
  });
});

describe("POST /auth/login", () => {
  it("should return 200 status code and a User object for valid email and valid password", async () => {
    const response = await request(app).post("/auth/login").send({
      email: "test@mail.com",
      password: "password",
    });

    expect(response.statusCode).toBe(200);
    expect(response.body).toStrictEqual({
      id: 1,
      email: "test@mail.com",
      isTeacher: true,
    });

    // Test Cleanup - Reset the 'last_login' field of this user to its original value
    try {
      await pool.query(
        "UPDATE member SET last_login = $1 WHERE email = 'test@mail.com'",
        [new Date(2023, 6, 9)]
      );
    } catch (error) {
      console.error("*** TEST CLEANUP FAILED ***");
      console.error(error);
    }
  });

  it("should return 401 status code and error message for valid email and invalid password", async () => {
    const response = await request(app).post("/auth/login").send({
      email: "test@mail.com",
      password: "invalid",
    });
    expect(response.statusCode).toBe(401);
    expect(response.body).toStrictEqual({
      error: "Login Failed: Invalid Credentials",
    });
  });

  it("should return 401 status code and error message for invalid email and invalid password", async () => {
    const response = await request(app).post("/auth/login").send({
      email: "invalid@mail.com",
      password: "invalid",
    });
    expect(response.statusCode).toBe(401);
    expect(response.body).toStrictEqual({
      error: "Login Failed: Invalid Credentials",
    });
  });
});
