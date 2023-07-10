import request from "supertest";
import app from "../app";
import pool from "../database/config";

describe("GET /users/:userID", () => {
  it("should return 400 status code if the 'userID' parameter contains non-digits", async () => {
    const response = await request(app).get("/users/invalidParameter").send();

    expect(response.statusCode).toBe(400);
  });

  it("should return 404 status code if no user with the specified userID exists", async () => {
    const response = await request(app).get("/users/999999").send();

    expect(response.statusCode).toBe(404);
  });

  it("should return 200 status code and the user's data if a valid userID is supplied", async () => {
    const response = await request(app).get("/users/1").send();

    expect(response.statusCode).toBe(200);
    expect(response.body).toStrictEqual({
      email: "test@mail.com",
      first_name: "test",
      is_admin: true,
      join_date: "2023-07-08T23:00:00.000Z",
      last_login: "2023-07-08T23:00:00.000Z",
      last_name: "user",
      member_id: 1,
      student_number: null,
    });
  });
});

describe("GET /users/:userID/chats/owned", () => {
  let sessionCookie;

  // Log In to create a session before each test case
  beforeEach(async () => {
    const loginResponse = await request(app).post("/auth/login").send({
      email: "test@mail.com",
      password: "password",
    });

    // Set the sessionCookie
    sessionCookie = loginResponse.header["set-cookie"][0];

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

  it("should return 200 status code and a list of the user's owned chats if the request is authenticated", async () => {
    // Once the session is created, call the endpoint and attach the session cookie to the request
    const response = await request(app)
      .get("/users/1/chats/owned")
      .set("Cookie", [sessionCookie])
      .send();

    expect(response.statusCode).toBe(200);
    expect(response.body).toStrictEqual([
      {
        creation_date: "2023-07-08T23:00:00.000Z",
        member_id: 1,
        room_id: 2,
        title: "testRoom2",
      },
      {
        creation_date: "2023-07-08T23:00:00.000Z",
        member_id: 1,
        room_id: 1,
        title: "testRoom1",
      },
    ]);
  });

  it("should return 400 status code if the :userID parameter contains non-digits", async () => {
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

    expect(response.statusCode).toBe(401);
  });
});

describe("GET /users/:userID/chats/joined", () => {
  let sessionCookie;

  // Log In to create a session before each test case
  beforeEach(async () => {
    const loginResponse = await request(app).post("/auth/login").send({
      email: "test@mail.com",
      password: "password",
    });

    // Set the sessionCookie
    sessionCookie = loginResponse.header["set-cookie"][0];

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

  it("should return 400 status code if the 'userID' parameter contains non-digits", async () => {
    const response = await request(app)
      .get("/users/invalidParameter/chats/joined")
      .set("Cookie", [sessionCookie]);

    expect(response.statusCode).toBe(400);
  });

  it("should return 404 status code and an error message if no user with the specified userID exists", async () => {
    const response = await request(app)
      .get("/users/999/chats/joined")
      .set("Cookie", [sessionCookie]);

    expect(response.statusCode).toBe(404);
  });

  it("should return 200 status code and a list of the user's joined chats if a valid userID is specified", async () => {
    const response = await request(app)
      .get("/users/1/chats/joined")
      .set("Cookie", [sessionCookie]);

    expect(response.statusCode).toBe(200);
    expect(response.body).toStrictEqual([
      {
        creation_date: "2023-07-08T23:00:00.000Z",
        member_id: 1,
        room_id: 1,
        title: "testRoom1",
      },
      {
        creation_date: "2023-07-08T23:00:00.000Z",
        member_id: 1,
        room_id: 2,
        title: "testRoom2",
      },
    ]);
  });
});

describe("POST /users/teachers", () => {
  it("should return 200 status code and a success message for valid registration details", async () => {
    const response = await request(app).post("/users/teachers").send({
      firstName: "Test",
      lastName: "Teacher",
      email: "testTeacher@test.com",
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
      email: "testTeacher@test.com",
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
        "DELETE FROM member WHERE email = 'testTeacher@test.com'"
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
      email: "testStudent@test.com",
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
      email: "testStudent@test.com",
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
      email: "testStudent@test.com",
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
      email: "testStudent@test.com",
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
        "DELETE FROM member WHERE email = 'testStudent@test.com'"
      );
    } catch (error) {
      console.error("*** TEST CLEANUP FAILED ***");
      console.error(error);
    }
  });
});
