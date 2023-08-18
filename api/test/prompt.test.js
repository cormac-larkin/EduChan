import request from "supertest";
import pool from "../database/config";
import app from "../app";

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

/**
 * Test cases for the 'Create Prompt' endpoint (POST /prompts)
 */
describe("POST /prompts", () => {
  it("should return a '200 OK' status code if the prompt was successfully created", async () => {
    const response = await request(app)
      .post("/prompts")
      .set("Cookie", [sessionCookie])
      .send({
        content: "Test Prompt 1",
      });
    expect(response.status).toBe(200);

    // Test Cleanup: Delete the prompt that was created during this test
    try {
      await pool.query("DELETE FROM prompt WHERE content = 'Test Prompt 1'");
    } catch (error) {
      console.error(error);
      console.log("*** TEST CLEANUP FAILED ***");
    }
  });

  it("should return a '400 Bad Request' status code if the request body does not contain the 'content' property", async () => {
    const response = await request(app)
      .post("/prompts")
      .set("Cookie", [sessionCookie])
      .send({}); // Send request body without the 'content' property
    expect(response.status).toBe(400);
  });
});

/**
 * Test cases for the 'Prompt Retrieval' endpoint (GET /prompts/:promptID)
 */
describe("GET /prompts/:promptID", () => {
  it("should return a '200 OK' status code if the request is valid and the prompt ID exists", async () => {
    const response = await request(app)
      .get("/prompts/3")
      .set("Cookie", [sessionCookie])
      .send();
    expect(response.status).toBe(200);
  });

  it("should return a '404 Not Found' status code if the prompt ID does not exist", async () => {
    const response = await request(app)
      .get("/prompts/99999") // Prompt ID 99999 does not exist in the test database
      .set("Cookie", [sessionCookie])
      .send();
    expect(response.status).toBe(404);
  });
});

/**
 * Test cases for the 'Response Creation' endpoint (POST /prompts/:promptID/responses)
 */
describe("POST /prompts/:promptID/responses", () => {
  it("should return a '200 OK' status code if the response is created successfully", async () => {
    const response = await request(app)
      .post("/prompts/3/responses")
      .set("Cookie", [sessionCookie])
      .send({ content: "Test Response 1" });
    expect(response.status).toBe(200);

    // Test Cleanup: Delete the response that was created during this test
    try {
      await pool.query(
        "DELETE FROM response WHERE content = 'Test Response 1'"
      );
    } catch (error) {
      console.error(error);
      console.log("*** TEST CLEANUP FAILED ***");
    }
  });

  it("should return a '400 Bad Request' status code if the request body does not contain the 'content' property", async () => {
    const response = await request(app)
      .post("/prompts/3/responses")
      .set("Cookie", [sessionCookie])
      .send(); // Send request body without the 'content' property
    expect(response.status).toBe(400);
  });

  it("should return a '404 Not Found' status code if the prompt ID does not exist", async () => {
    const response = await request(app)
      .post("/prompts/99999/responses") // Prompt ID 99999 does not exist in the database
      .set("Cookie", [sessionCookie])
      .send({ content: "Test Response 1" });
    expect(response.status).toBe(404);
  });
});

/**
 * Test cases for the 'Response Retrieval' endpoint (GET /prompts/:promptID/responses)
 */
describe("GET /prompts/:promptID/responses", () => {
  it("should return a '200 OK' status code if the request is valid and the prompt ID exists", async () => {
    const response = await request(app)
      .get("/prompts/3/responses")
      .set("Cookie", [sessionCookie])
      .send();
    expect(response.status).toBe(200);
  });

  it("should return a '404 Not Found' status code if the prompt ID does not exist", async () => {
    const response = await request(app)
      .get("/prompts/99999/responses") // Prompt ID 99999 does not exist in the database
      .set("Cookie", [sessionCookie])
      .send();
    expect(response.status).toBe(404);
  });
});
