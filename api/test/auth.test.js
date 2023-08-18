import request from "supertest";
import app from "../app";

describe("GET /auth", () => {
  it("should return a '200 OK' status code if request contains a valid session cookie", async () => {
    // Log In to create a session
    const loginResponse = await request(app).post("/auth/login").send({
      email: "teststudent@mail.com",
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
  });

  it("should return a '401 Unauthorized' status code if request contains an invalid session cookie", async () => {
    // Send request with invalid session cookie
    const response = await request(app)
      .get("/auth")
      .set("Cookie", ["invalidSessionCookie"])
      .send();

    expect(response.statusCode).toBe(401);
  });

  it("should return a '401 Unauthorized' status code if request contains no session cookie", async () => {

    // Send request with no session cookie
    const response = await request(app).get("/auth").send();

    expect(response.statusCode).toBe(401);
  });
});

describe("POST /auth/login", () => {
  it("should return a '200 OK' status code for valid email and valid password", async () => {
    const response = await request(app).post("/auth/login").send({
      email: "teststudent@mail.com",
      password: "password",
    });

    expect(response.statusCode).toBe(200);
  });

  it("should return a '401 Unauthorized' status code for valid email and invalid password", async () => {
    const response = await request(app).post("/auth/login").send({
      email: "teststudent@mail.com",
      password: "invalid",
    });
    expect(response.statusCode).toBe(401);
  });

  it("should return a '401 Unauthorized' status code for invalid email and invalid password", async () => {
    const response = await request(app).post("/auth/login").send({
      email: "invalid@mail.com",
      password: "invalid",
    });
    expect(response.statusCode).toBe(401);
  });
});

describe("POST /auth/logout", () => {
  it("should return a '200 OK' status code for a successful logout", async () => {
    const response = await request(app).post("/auth/logout").send();

    expect(response.statusCode).toBe(200);
  })
})