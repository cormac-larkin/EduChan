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
 * Test cases for the quiz creation endpoint (POST /quizzes)
 */
describe("POST /quizzes", () => {
  it("should return a '200 OK' response code if the request body contains a valid quiz name and the user has the required permissions", async () => {
    // Create a new quiz using a valid quiz name (has not already been used by this user)
    const response = await request(app)
      .post("/quizzes")
      .set("Cookie", [sessionCookie])
      .send({
        quizName: "Test Quiz 1",
      });
    expect(response.status).toBe(200);

    // Test Cleanup: Delete the quiz that was inserted for this test
    try {
      await pool.query("DELETE FROM quiz WHERE title = 'Test Quiz 1'");
    } catch (error) {
      console.error(error);
      console.log("*** TEST CLEANUP FAILED ***");
    }
  });

  it("should return a '409 Conflict' status code if a duplicate quiz name is supplied", async () => {
    const response = await request(app)
      .post("/quizzes")
      .set("Cookie", [sessionCookie])
      .send({
        quizName: "testQuiz", // The current user already has a quiz with this name
      });
    expect(response.status).toBe(409);
  });

  it("should return a '400 Bad Request' status code if the request body does not contain the quizName property", async () => {
    const response = await request(app)
      .post("/quizzes")
      .set("Cookie", [sessionCookie])
      .send({}); // Request body does not contain the required 'quizName' property
    expect(response.status).toBe(400);
  });
});

/**
 * Test cases for the quiz retrieval endpoint (GET /quizzes/:quizID)
 */
describe("GET /quizzes/:quizID", () => {
  it("should return a '200 OK' status code if the request is valid and the quiz ID exists", async () => {
    const response = await request(app)
      .get("/quizzes/1")
      .set("Cookie", [sessionCookie])
      .send();
    expect(response.status).toBe(200);
  });

  it("should return a '400 Bad Request' status code if the quizID URL paramater is not a number", async () => {
    const response = await request(app)
      .get("/quizzes/invalidParameter")
      .set("Cookie", [sessionCookie])
      .send();
    expect(response.status).toBe(400);
  });

  it("should return a '404 Not Found' status code if the specified quiz ID does not exist", async () => {
    const response = await request(app)
      .get("/quizzes/99999") // Quiz with ID 99999 does not exist in the test database
      .set("Cookie", [sessionCookie])
      .send();
    expect(response.status).toBe(404);
  });
});

/**
 * Test cases for the 'Add Question' endpoint (POST /quizzes/:quizID)
 */
describe("POST /quizzes/:quizID", () => {
  it("should return a '200 OK' status code if the request is valid and the user owns the quiz", async () => {
    const response = await request(app)
      .post("/quizzes/1")
      .set("Cookie", [sessionCookie])
      .send({
        questionText: "Test Question 1",
        answers: [
          { answerText: "Test Answer 1", isCorrect: true },
          { answerText: "Test Answer 2", isCorrect: false },
          { answerText: "Test Answer 3", isCorrect: true },
        ],
      });
    expect(response.status).toBe(200);

    // Test Cleanup: Delete the question that was created for this test (answers will be automatically deleted due to 'ON_DELETE_CASCADE' in DB)
    try {
      await pool.query(
        "DELETE FROM question WHERE content = 'Test Question 1'"
      );
    } catch (error) {
      console.error(error);
      console.log("*** TEST CLEANUP FAILED ***");
    }
  });

  it("should return a '400 Bad Request' status code if the request body does not contain the 'questionText' property", async () => {
    const response = await request(app)
      .post("/quizzes/1")
      .set("Cookie", [sessionCookie])
      .send({
        answers: [
          { answerText: "Test Answer 1", isCorrect: true },
          { answerText: "Test Answer 2", isCorrect: false },
          { answerText: "Test Answer 3", isCorrect: true },
        ],
      });
    expect(response.status).toBe(400);
  });

  it("should return a '400 Bad Request' status code if the request body does not contain the 'answers' property", async () => {
    const response = await request(app)
      .post("/quizzes/1")
      .set("Cookie", [sessionCookie])
      .send({
        questionText: "Test",
      });
    expect(response.status).toBe(400);
  });

  it("should return a '403 Forbidden' status code if the user does not own the quiz", async () => {
    const response = await request(app)
      .post("/quizzes/14")
      .set("Cookie", [sessionCookie])
      .send({
        questionText: "Test",
        answers: [
          { answerText: "Test Answer 1", isCorrect: true },
          { answerText: "Test Answer 2", isCorrect: false },
          { answerText: "Test Answer 3", isCorrect: true },
        ],
      });
    expect(response.status).toBe(403);
  });
});

/**
 * Test cases for the 'Edit Question' endpoint (PUT /quizzes/:quizID/questions/:questionID)
 */
describe("PUT /quizzes/:quizID/questions/:questionID", () => {
  it("should return a '200 OK' status code if the request is valid and the user has permission to edit the question", async () => {
    const response = await request(app)
      .put("/quizzes/1/questions/6")
      .set("Cookie", [sessionCookie])
      .send({
        questionText: "Test Question",
        answers: [{ answerText: "Test Answer 1", isCorrect: true, id: 16 }],
      });
    expect(response.status).toBe(200);
  });

  it("should return a '400 Bad Request' status code if the request body does not contain the 'questionText' property", async () => {
    const response = await request(app)
      .put("/quizzes/1/questions/6")
      .set("Cookie", [sessionCookie])
      .send({
        answers: [{ answerText: "Test Answer 1", isCorrect: true, id: 16 }], // Send request body without 'questionText' property
      });
    expect(response.status).toBe(400);
  });

  it("should return a '400 Bad Request' status code if the request body does not contain the 'answers' property", async () => {
    const response = await request(app)
      .put("/quizzes/1/questions/6")
      .set("Cookie", [sessionCookie])
      .send({
        questionText: "Test Question", // Send request body without the array of answers
      });
    expect(response.status).toBe(400);
  });

  it("should return a '403 Forbidden' response if the user does not own the quiz which the question belongs to", async () => {
    const response = await request(app)
      .put("/quizzes/16/questions/6")
      .set("Cookie", [sessionCookie])
      .send({
        questionText: "Test Question",
        answers: [{ answerText: "Test Answer 1", isCorrect: true, id: 16 }],
      });
    expect(response.status).toBe(403);
  });
});

/**
 * Test cases for the 'Add Quiz Attempt' endpoint (POST /quizzes/:quizID/attempts)
 */
describe("POST /quizzes/:quizID/attempts", () => {
  it("should return a '200 OK' status code if the request body contains the 'quizAttempt' property and the user has the required permissions", async () => {
    const response = await request(app)
      .post("/quizzes/1/attempts")
      .set("Cookie", [sessionCookie])
      .send({
        quizAttempt: [{ id: 6, answers: [{ answer_id: 16, isChosen: true }] }],
      });
    expect(response.status).toBe(200);

    // Test cleanup: Delete the attempt that was inserted during this test
    try {
      await pool.query("DELETE FROM attempt WHERE quiz_id = 1");
    } catch (error) {
      console.error(error);
      console.log("*** TEST CLEANUP FAILED ***");
    }
  });

  it("should return a '400 Bad Request' status code if the request body does not contain the required 'quizAttempt' property", async () => {
    const response = await request(app)
      .post("/quizzes/1/attempts")
      .set("Cookie", [sessionCookie])
      .send({}); // Send request body without the 'quizAttempt' property
    expect(response.status).toBe(400);
  });

  it("should return a '404 Not Found' status code if the specified quiz ID does not exist", async () => {
    const response = await request(app)
      .post("/quizzes/99999/attempts") // Quiz with ID 99999 does not exist in the test database
      .set("Cookie", [sessionCookie])
      .send({
        quizAttempt: [{ id: 6, answers: [{ answer_id: 16, isChosen: true }] }],
      });
    expect(response.status).toBe(404);
  });
});

/**
 * Test cases for the 'Quiz Attempt Retrieval' endpoint (GET /quizzes/attempts/:attemptID)
 */
describe("GET /quizzes/attempts/:attemptID", () => {
  it("should return a '200 OK' status code if the attempt ID exists and the user has permission to access it", async () => {
    const response = await request(app)
      .get("/quizzes/attempts/12")
      .set("Cookie", [sessionCookie])
      .send();
    expect(response.status).toBe(200);
  });

  it("should return a '404 Not Found' status code if the attempt ID does not exist", async () => {
    const response = await request(app)
      .get("/quizzes/attempts/99999") // Attempt ID 99999 does not exist in the test database
      .set("Cookie", [sessionCookie])
      .send();
    expect(response.status).toBe(404);
  });
});

/**
 * Test cases for the 'Quiz Report Retrieval' endpoint (GET /quizzes/:quizID/report)
 */
describe("GET /quizzes/:quizID/report", () => {
  it("should return a '200 OK' status code if the request is valid and the quiz ID exists", async () => {
    const response = await request(app)
      .get("/quizzes/1/report")
      .set("Cookie", [sessionCookie])
      .send();
    expect(response.status).toBe(200);
  });

  it("should return a '404 Not Found' status code if the quiz ID does not exist", async () => {
    const response = await request(app)
      .get("/quizzes/99999/report") // Quiz ID 99999 does not exist in the test database
      .set("Cookie", [sessionCookie])
      .send();
    expect(response.status).toBe(404);
  });
});
