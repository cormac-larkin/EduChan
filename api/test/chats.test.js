import request from "supertest";
import pool from "../database/config";
import app from "../app";

let sessionCookie;

// Before each test case, log in as Test User to create a session and authenticate requests
beforeAll(async () => {
  const loginResponse = await request(app).post("/auth/login").send({
    email: "test@mail.com",
    password: "password",
  });

  // Retrieve the session cookie from the response (this cookie will be used to authenticate all test requests)
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

// Test cases for the chat creation endpoint
describe("POST /chats", () => {
  it("should return 200 status code and success message when a valid roomName is provided", async () => {
    const response = await request(app)
      .post("/chats")
      .set("Cookie", [sessionCookie])
      .send({
        roomName: "Test Room",
      });
    expect(response.status).toBe(200);
    expect(response.body).toStrictEqual({
      message: `Room 'Test Room' created successfully`,
    });

    // Test cleanup - Delete the test room that was created
    try {
      await pool.query(
        "DELETE from room WHERE title = 'Test Room' AND member_id = 1"
      );
    } catch (error) {
      console.error("*** TEST CLEANUP FAILED ***");
      console.error(error);
    }
  });

  it("should return 409 status code and error message when a duplicate room name is supplied", async () => {
    const response = await request(app)
      .post("/chats")
      .set("Cookie", [sessionCookie])
      .send({
        roomName: "testRoom1",
      });
    expect(response.status).toBe(409);
    expect(response.body).toStrictEqual({
      error: `A room named 'testRoom1' already exists for this user. Please choose another name.`,
    });
  });

  it("should return 400 status code and error message when the request body does not contain all required properties", async () => {
    // Send request body without the 'roomName' property
    const response = await request(app)
      .post("/chats")
      .set("Cookie", [sessionCookie])
      .send({});
    expect(response.status).toBe(400);
    expect(response.body).toStrictEqual({
      error: "Request body is missing required properties",
    });
  });
});

describe("DELETE /chats/:roomID", () => {
  it("should return 204 if the room is successfully deleted", async () => {
    // Test setup - Insert room into DB for deletion
    try {
      await pool.query(
        "INSERT INTO room (room_id, title, creation_date, member_id) VALUES ($1, $2, $3, $4)",
        [10001, "roomToDelete", new Date(2023, 7, 9), 1]
      );
    } catch (error) {
      console.error(error);
    }

    // Delete the newly inserted room
    const response = await request(app)
      .delete("/chats/10001")
      .set("Cookie", [sessionCookie])
      .send();
    expect(response.status).toBe(204);
  });

  it("should return 400 status code when an invalid roomID parameter is supplied", async () => {
    const response = await request(app)
      .delete("/chats/invalidParameter")
      .set("Cookie", [sessionCookie])
      .send();
    expect(response.status).toBe(400);
  });

  it("should return 404 status code when the supplied roomID does not exist", async () => {
    const response = await request(app)
      .delete("/chats/999999")
      .set("Cookie", [sessionCookie])
      .send();
    expect(response.status).toBe(404);
  });

  it("should return 403 status code if the user does not have permission to delete the room", async () => {
    // Try to delete chatID 3 - which belongs to a different user than the one we are currently logged in as
    const response = await request(app)
      .delete("/chats/3")
      .set("Cookie", [sessionCookie])
      .send();
    expect(response.status).toBe(403);
  });
});

describe("POST /chats/:roomID/members", () => {
  it("should return 200 status code if the request was valid", async () => {
    const response = await request(app)
      .post("/chats/1/members")
      .set("Cookie", [sessionCookie])
      .send(["test@mail.com"]);

    expect(response.status).toBe(200);

    // Test Cleanup - Remove test data from room_member table
    try {
      await pool.query(
        "DELETE FROM room_member WHERE room_member_id = (SELECT room_member_id FROM room_member ORDER BY room_member_id DESC LIMIT 1)"
      );
    } catch (error) {
      console.error("*** TEST CLEANUP FAILED ***");
      console.error(error);
    }
  });

  it("should return 400 status code if an invalid roomID parameter is supplied", async () => {
    const response = await request(app)
      .post("/chats/invalidParameter/members")
      .set("Cookie", [sessionCookie])
      .send(["test@mail.com"]);

    expect(response.status).toBe(400);
  });

  it("should return 400 status code if an empty request body is supplied", async () => {
    const response = await request(app)
      .post("/chats/1/members")
      .set("Cookie", [sessionCookie])
      .send();

    expect(response.status).toBe(400);
  });

  it("should return 404 status code and an error message if the supplied roomID does not exist", async () => {
    const response = await request(app)
      .post("/chats/99999/members")
      .set("Cookie", [sessionCookie])
      .send(["test@mail.com"]);

    expect(response.status).toBe(404);
    expect(response.body).toStrictEqual({
      error: "Chatroom with ID '99999' not found",
    });
  });

  it("should return 403 status code and an error message if the user does not have permission to add users to the chat", async () => {
    // Attempt to add users to chat ID 3, which belongs to a different user
    const response = await request(app)
      .post("/chats/3/members")
      .set("Cookie", [sessionCookie])
      .send(["test@mail.com"]);

    expect(response.status).toBe(403);
    expect(response.body).toStrictEqual({
      error: "You do not have permission to add users to this chatroom",
    });
  });
});

describe("GET /chats/:roomID", () => {
  it("should return 200 status code and the chatroom details if the request is valid", async () => {
    const response = await request(app)
      .get("/chats/1")
      .set("Cookie", [sessionCookie])
      .send();

    expect(response.status).toBe(200);
    expect(response.body).toStrictEqual({
      creation_date: "2023-07-08T23:00:00.000Z",
      member_id: 1,
      room_id: 1,
      title: "testRoom1",
    });
  });

  it("should return 400 status code if the roomID parameter is invalid", async () => {
    const response = await request(app)
      .get("/chats/invalidParameter")
      .set("Cookie", [sessionCookie])
      .send();

    expect(response.status).toBe(400);
  });

  it("should return 404 status code and error message if the roomID does not exist", async () => {
    const response = await request(app)
      .get("/chats/999999")
      .set("Cookie", [sessionCookie])
      .send();

    expect(response.status).toBe(404);
    expect(response.body).toStrictEqual({
      error: "Chatroom with ID '999999' not found",
    });
  });
});

describe("GET /chats/:roomID/messages", () => {
  it("should return 200 status code and an array of messages if the request is valid", async () => {
    const response = await request(app)
      .get("/chats/1/messages")
      .set("Cookie", [sessionCookie])
      .send();

    expect(response.status).toBe(200);
    expect(response.body).toStrictEqual([
      {
        content: "test",
        member_id: 1,
        message_id: 76,
        parent_id: null,
        room_id: 1,
        timestamp: "2023-07-10T19:05:39.543Z",
      },
      {
        content: "message",
        member_id: 1,
        message_id: 77,
        parent_id: null,
        room_id: 1,
        timestamp: "2023-07-10T19:06:17.337Z",
      },
    ]);
  });

  it("should return 404 status code if no room with the specified roomID exists", async () => {
    const response = await request(app)
      .get("/chats/999999/messages")
      .set("Cookie", [sessionCookie])
      .send();

    expect(response.status).toBe(404);
  });

  it("should return 400 status code if the roomID parameter is invalid", async () => {
    const response = await request(app)
      .get("/chats/invalidParameter/messages")
      .set("Cookie", [sessionCookie])
      .send();

    expect(response.status).toBe(400);
  });
});

describe("POST /chats/:roomID/messages", () => {
  it("should return 204 status code if the request is valid", async () => {
    const response = await request(app)
      .post("/chats/1/messages")
      .set("Cookie", [sessionCookie])
      .send({
        content: "test",
        authorID: 1,
      });

    expect(response.status).toBe(204);

    // Test Cleanup - Remove inserted test data from message table
    try {
      await pool.query(
        "DELETE FROM message WHERE message_id = (SELECT message_id FROM message ORDER BY message_id DESC LIMIT 1)"
      );
    } catch (error) {
      console.error("*** TEST CLEANUP FAILED ***");
      console.error(error);
    }
  });

  it("should return 400 status code if the roomID parameter is invalid", async () => {
    const response = await request(app)
      .post("/chats/invalidParameter/messages")
      .set("Cookie", [sessionCookie])
      .send({
        content: "test",
        authorID: 1,
      });

    expect(response.status).toBe(400);
  });

  it("should return 400 status code if the request body does not contain all required properties", async () => {
    // Send request without the 'content' property in the body
    const response = await request(app)
      .post("/chats/invalidParameter/messages")
      .set("Cookie", [sessionCookie])
      .send({
        authorID: 1,
      });

    expect(response.status).toBe(400);
  });

  it("should return 404 status code if no room with the specified roomID exists", async () => {
    const response = await request(app)
    .post("/chats/999999/messages")
    .set("Cookie", [sessionCookie])
    .send({
      content: "test",
      authorID: 1,
    });

  expect(response.status).toBe(404);
  })
});

// describe("DELETE /chats/:roomID/messages/:messageID", () => {
//     it("should return 204 status code")
// });
