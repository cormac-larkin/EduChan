import request from "supertest";
import app from "../app";
import pool from "../database/config";

let sessionCookie;

// Before each test case, log in as Test User to create a session and authenticate the requests
beforeAll(async () => {
  const loginResponse = await request(app).post("/auth/login").send({
    email: "testteacher@mail.com",
    password: "password",
  });

  // Retrieve the session cookie from the response (this cookie will be used to authenticate all test requests)
  sessionCookie = loginResponse.header["set-cookie"][0];
});

describe("GET /users/:userID", () => {
  it("should return 400 status code if the 'userID' parameter contains non-digits", async () => {
    const response = await request(app)
      .get("/users/invalidParameter")
      .set("Cookie", [sessionCookie])
      .send();

    expect(response.statusCode).toBe(400);
  });

  it("should return 404 status code if no user with the specified userID exists", async () => {
    const response = await request(app)
      .get("/users/999999") // User with this ID does not exist in the test database
      .set("Cookie", [sessionCookie])
      .send();

    expect(response.statusCode).toBe(404);
  });

  it("should return 200 status code and the user's data if a valid userID is supplied", async () => {
    const response = await request(app)
      .get("/users/3")
      .set("Cookie", [sessionCookie])
      .send();

    expect(response.statusCode).toBe(200);
  });
});

describe("GET /users/:userID/chats/owned", () => {
  it("should return 200 status code and a list of the user's owned chats if the request is authenticated", async () => {
    // Once the session is created, call the endpoint and attach the session cookie to the request
    const response = await request(app)
      .get("/users/4/chats/owned")
      .set("Cookie", [sessionCookie])
      .send();

    expect(response.statusCode).toBe(200);
  });

  it("should return 401 status code if the :userID parameter contains non-digits", async () => {
    const response = await request(app)
      .get("/users/invalidParameter/chats/owned")
      .set("Cookie", [sessionCookie])
      .send();

    expect(response.statusCode).toBe(400);
  });

  it("should return 401 status code if the :userID parameter does not match the userID attached to the session", async () => {
    const response = await request(app)
      .get("/users/999/chats/owned")
      .set("Cookie", [sessionCookie]);

    expect(response.statusCode).toBe(403);
  });
});

describe("GET /users/:userID/chats/joined", () => {
  it("should return 400 status code if the 'userID' parameter contains non-digits", async () => {
    const response = await request(app)
      .get("/users/invalidParameter/chats/joined")
      .set("Cookie", [sessionCookie]);

    expect(response.statusCode).toBe(400);
  });

  it("should return 404 status code if no user with the specified userID exists", async () => {
    const response = await request(app)
      .get("/users/999/chats/joined")
      .set("Cookie", [sessionCookie]);

    expect(response.statusCode).toBe(404);
  });

  it("should return 200 status code if a valid userID is specified", async () => {
    const response = await request(app)
      .get("/users/4/chats/joined")
      .set("Cookie", [sessionCookie]);

    expect(response.statusCode).toBe(200);
  });
});

describe("POST /users/teachers", () => {
  it("should return 200 status code for valid registration details", async () => {
    const response = await request(app).post("/users/teachers").send({
      firstName: "Test",
      lastName: "Teacher123",
      email: "testTeacher123@test.com",
      password: "password",
      passwordConfirmation: "password",
    });
    expect(response.statusCode).toBe(200);
    expect(response.body).toStrictEqual({
      message: "User registered successfully",
    });
  });

  it("should return 400 status code if the request body does not contain all required properties", async () => {
    // Send request without including the 'email' property in the body
    const response = await request(app).post("/users/teachers").send({
      firstName: "Test",
      lastName: "Teacher",
      password: "password",
      passwordConfirmation: "password123",
    });
    expect(response.statusCode).toBe(400);
    expect(response.body).toStrictEqual({
      error: "Request body is missing required properties",
    });
  });

  it("should return 400 status code and an error message if password does not match password confirmation", async () => {
    const response = await request(app).post("/users/teachers").send({
      firstName: "Test",
      lastName: "Teacher",
      email: "testTeacherEmail@test.com",
      password: "password",
      passwordConfirmation: "password123",
    });
    expect(response.statusCode).toBe(400);
    expect(response.body).toStrictEqual({
      error: "Password and password confirmation do not match",
    });
  });

  it("should return 409 status code and an error message if email address is already registered", async () => {
    const response = await request(app).post("/users/teachers").send({
      firstName: "Test",
      lastName: "Teacher",
      email: "testTeacher123@test.com",
      password: "password",
      passwordConfirmation: "password",
    });
    expect(response.statusCode).toBe(409);
    expect(response.body).toStrictEqual({
      error:
        "Registration Failed. An account with that email address already exists",
    });

    // Test cleanup - Delete the test user which was created
    try {
      await pool.query(
        "DELETE FROM member WHERE email = 'testTeacher123@test.com'"
      );
    } catch (error) {
      console.error("*** TEST CLEANUP FAILED ***");
      console.error(error);
    }
  });
});

describe("POST /users/students", () => {
  it("should return 200 status code and a success message for valid registration details", async () => {
    const response = await request(app).post("/users/students").send({
      firstName: "Test",
      lastName: "Student",
      email: "testStudent123@test.com",
      studentNumber: 123456,
      password: "password",
      passwordConfirmation: "password",
    });
    expect(response.statusCode).toBe(200);
    expect(response.body).toStrictEqual({
      message: "User registered successfully",
    });
  });

  it("should return 400 status code if the request body does not contain all required properties", async () => {
    // Send request body without the studentNumber property
    const response = await request(app).post("/users/students").send({
      firstName: "Test",
      lastName: "Student",
      email: "testStudent123@test.com",
      password: "password",
      passwordConfirmation: "password",
    });
    expect(response.statusCode).toBe(400);
    expect(response.body).toStrictEqual({
      error: "Request body is missing required properties",
    });
  });

  it("should return 400 status code and an error message if password does not match password confirmation", async () => {
    const response = await request(app).post("/users/students").send({
      firstName: "Test",
      lastName: "Student",
      email: "testStudent123@test.com",
      studentNumber: 123456,
      password: "password",
      passwordConfirmation: "password123",
    });
    expect(response.statusCode).toBe(400);
    expect(response.body).toStrictEqual({
      error: "Password and password confirmation do not match",
    });
  });

  it("should return 409 status code and an error message if email address is already registered", async () => {
    const response = await request(app).post("/users/students").send({
      firstName: "Test",
      lastName: "Student",
      email: "testStudent123@test.com",
      studentNumber: 123456,
      password: "password",
      passwordConfirmation: "password",
    });
    expect(response.statusCode).toBe(409);
    expect(response.body).toStrictEqual({
      error:
        "Registration Failed. An account with that email address already exists",
    });

    // Test cleanup - Delete the test user which was created
    try {
      await pool.query(
        "DELETE FROM member WHERE email = 'testStudent123@test.com'"
      );
    } catch (error) {
      console.error("*** TEST CLEANUP FAILED ***");
      console.error(error);
    }
  });
});
