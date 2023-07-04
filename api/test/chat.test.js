import request from "supertest";
import app from "../app";

let sessionCookie;

beforeAll(async () => {
  // First, login as the 'Test Teacher' User to create a session
  const loginResponse = await request(app).post("/auth/login").send({
    email: "teach@mail.com",
    password: "password",
  });

  // Retrieve the session cookie from the response (this cookie will be used to authenticate all test requests)
  sessionCookie = loginResponse.header["set-cookie"][0];
});

// Test cases for the chat retrieval endpoint (returns all chats created by a specific Teacher)
describe("GET /chat", () => {
  test("should return a 200 response code and JSON payload containing details of all chats created by the Teacher user", async () => {
    // Call the /chat route and attach the session cookie
    const response = await request(app)
      .get("/chat")
      .set("Cookie", [sessionCookie])
      .send();
    expect(response.statusCode).toBe(200);
    expect(response.body).toStrictEqual([
      {
        room_id: 45,
        title: "Java 101",
        creation_date: "2023-06-30T23:00:00.000Z",
        member_id: 18,
      },
      {
        room_id: 47,
        title: "Python",
        creation_date: "2023-07-02T23:00:00.000Z",
        member_id: 18,
      },
    ]);
  });
});

// Test cases for the chat creation endpoint
describe("POST /chat/create", () => {
  test("should return 200 code when a valid room is created", async () => {
    // POST the new chatroom details to /chat/create endpoint and attach session cookie
    const response = await request(app)
      .post("/chat/create")
      .set("Cookie", [sessionCookie])
      .send({
        roomName: "Test Room",
      });
    expect(response.status).toBe(200);
  });

  test("should return 409 status code when a duplicate room name is supplied", async () => {
    // POST the new chatroom details to /chat/create endpoint and attach session cookie
    const response = await request(app)
      .post("/chat/create")
      .set("Cookie", [sessionCookie])
      .send({
        roomName: "Test Room",
      });
    expect(response.status).toBe(409);
  });
});

describe("DELETE /chat/delete/:roomID", () => {
  test("should return 401 status code when an invalid room ID is supplied", async () => {
    // Post to the /chat/delete/:roomID endpoint and attach session cookie
    const response = await request(app)
      .delete("/chat/delete/9999999")
      .set("Cookie", [sessionCookie])
      .send({
        roomName: "Test Room",
      });
    expect(response.status).toBe(401);
  });
});
