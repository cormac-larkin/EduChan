import request from "supertest";
import app from "../app";

/**
 * Test cases for the login endpoint (/auth/login)
 */
describe("POST /auth/login", () => {
  test("should return 200 status code and a user object for valid login credentials", async () => {
    const response = await request(app).post("/auth/login").send({
      email: "test@mail.com",
      password: "password",
    });
    expect(response.statusCode).toBe(200);
    expect(response.body).toStrictEqual({
      email: "test@mail.com",
      isTeacher: true,
    });
  });

  test("should return 401 status code and error message for valid email address and invalid password", async () => {
    const response = await request(app).post("/auth/login").send({
      email: "test@mail.com",
      password: "invalid",
    });
    expect(response.statusCode).toBe(401);
    expect(response.body).toStrictEqual({
      error: "Login Failed: Invalid Credentials",
    });
  });

  test("should return 401 status code and error message for invalid email address and invalid password", async () => {
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

/**
 * Test cases for Teacher registration endpoint (auth/register/teacher)
 */
describe("POST auth/register/teacher", () => {
  test("should return 200 status code and a success message for valid registration details", async () => {
    const response = await request(app).post("/auth/register/teacher").send({
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

  test("should return 400 status code and an error message if password does not match password confirmation", async () => {
    const response = await request(app).post("/auth/register/teacher").send({
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

  test("should return 409 status code and an error message if email address is already registered", async () => {
    const response = await request(app).post("/auth/register/teacher").send({
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
  });
});

/**
 * Test cases for Student registration endpoint (auth/register/student)
 */
describe("POST auth/register/student", () => {
  test("should return 200 status code and a success message for valid registration details", async () => {
    const response = await request(app).post("/auth/register/student").send({
      firstName: "Test",
      lastName: "Student",
      email: "testStudent@test.com",
      password: "password",
      passwordConfirmation: "password",
    });
    expect(response.statusCode).toBe(200);
    expect(response.body).toStrictEqual({
      message: "User registered successfully",
    });
  });

  test("should return 400 status code and an error message if password does not match password confirmation", async () => {
    const response = await request(app).post("/auth/register/student").send({
      firstName: "Test",
      lastName: "Student",
      email: "testStudentEmail@test.com",
      password: "password",
      passwordConfirmation: "password123",
    });
    expect(response.statusCode).toBe(400);
    expect(response.body).toStrictEqual({
      error: "Password and password confirmation do not match",
    });
  });

  test("should return 409 status code and an error message if email address is already registered", async () => {
    const response = await request(app).post("/auth/register/student").send({
      firstName: "Test",
      lastName: "Student",
      email: "testStudent@test.com",
      password: "password",
      passwordConfirmation: "password",
    });
    expect(response.statusCode).toBe(409);
    expect(response.body).toStrictEqual({
      error:
        "Registration Failed. An account with that email address already exists",
    });
  });
});

/**
 * Test cases for the client authentication endpoint (/auth)
 */
describe("GET /auth", () => {
  test("should return 200 status code and a User Object if a session exists for the client", async () => {
    // Login as a User to create a session
    const loginRequest = await request(app).post("/auth/login").send({
      email: "test@mail.com",
      password: "password",
    });

    // Retrieve the session cookie from the response
    const sessionCookie = loginRequest.header["set-cookie"][0];

    // Once the session is created, call the /auth endpoint and attach the session cookie to the request
    const response = await request(app)
      .get("/auth")
      .set("Cookie", [sessionCookie])
      .send();
    expect(response.statusCode).toBe(200);
    expect(response.body).toStrictEqual({
      email: "test@mail.com",
      isTeacher: true,
    });
  });

  test("should return 401 status code if no session exists for the client", async () => {
    // Call the /auth endpoint with no session cookie
    const response = await request(app).get("/auth").send();
    expect(response.statusCode).toBe(401);
  });
});
