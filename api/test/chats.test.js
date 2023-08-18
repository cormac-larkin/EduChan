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
 * Test cases for the chat creation endpoint (POST /chats)
 */
describe("POST /chats", () => {
  it("should return a '200 OK' status code when a valid room name is provided", async () => {
    // Create a new room using a valid roomName (has not already been used)
    const response = await request(app)
      .post("/chats")
      .set("Cookie", [sessionCookie])
      .send({
        roomName: "Test Room",
      });
    expect(response.status).toBe(200);

    // Test cleanup - Delete the test room that was created
    try {
      await pool.query("DELETE from room WHERE title = 'Test Room'");
    } catch (error) {
      console.error("*** TEST CLEANUP FAILED ***");
      console.error(error);
    }
  });

  it("should return a '409 Conflict' status code when a duplicate room name is supplied", async () => {
    // Try to create a room using a duplicated room name (this user already has a room by this name)
    const response = await request(app)
      .post("/chats")
      .set("Cookie", [sessionCookie])
      .send({
        roomName: "testRoom1",
      });
    expect(response.status).toBe(409);
  });

  it("should return a '400 Bad Request' status code when the request body does not contain all required properties", async () => {
    // Send request body without the 'roomName' property
    const response = await request(app)
      .post("/chats")
      .set("Cookie", [sessionCookie])
      .send({});
    expect(response.status).toBe(400);
  });
});

/**
 * Test cases for the chat deletion endpoint (DELETE /chats/:roomID)
 */
describe("DELETE /chats/:roomID", () => {
  it("should return a '204 No Content' status code if the room is successfully deleted", async () => {
    // Test setup - Insert room into DB for deletion
    try {
      await pool.query(
        "INSERT INTO room (room_id, title, creation_date, member_id) VALUES ($1, $2, $3, $4)",
        [10001, "roomToDelete", new Date(2023, 7, 9), 4]
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

  it("should return a '400 Bad Request' status code if an invalid roomID parameter is supplied", async () => {
    const response = await request(app)
      .delete("/chats/invalidParameter") // roomID is invalid, it should be a number
      .set("Cookie", [sessionCookie])
      .send();
    expect(response.status).toBe(400);
  });

  it("should return a '404 Not Found' status code if the supplied roomID does not exist", async () => {
    const response = await request(app)
      .delete("/chats/9999999") // This roomID does not exist in the database
      .set("Cookie", [sessionCookie])
      .send();
    expect(response.status).toBe(404);
  });

  it("should return a '403 Forbidden' status code if the user does not have permission to delete the room", async () => {
    // Try to delete chatID 6 - which belongs to a different user than the one we are currently logged in as
    const response = await request(app)
      .delete("/chats/6")
      .set("Cookie", [sessionCookie])
      .send();
    expect(response.status).toBe(403);
  });
});

/**
 * Test cases for the manual student enrolment endpoint (POST chats/:roomID/students)
 */
describe("POST chats/:roomID/students", () => {
  it("should return a '200 OK' status code if the roomID exists and the request body contains an array of valid student numbers", async () => {
    const response = await request(app)
      .post("/chats/3/students")
      .set("Cookie", [sessionCookie])
      .send([11111111, 22222222, 33333333]); // These student numbers are valid and exist in the test database
    expect(response.status).toBe(200);

    // Test Cleanup, delete the enrolled Students from the room_member table
    try {
      await pool.query("DELETE FROM room_member WHERE room_id = 3");
    } catch (error) {
      console.error(error);
      console.log("*** TEST CLEANUP FAILED ***");
    }
  });

  it("should return a '207 Multi-status' status code if the roomID exists and the request body contains an array with both valid and invalid student numbers", async () => {
    const response = await request(app)
      .post("/chats/3/students")
      .set("Cookie", [sessionCookie])
      .send([11111111, 22222222, 55555555]); // The last student number does not exist in the database
    expect(response.status).toBe(207);

    // Test Cleanup, delete the enrolled Students from the room_member table
    try {
      await pool.query("DELETE FROM room_member WHERE room_id = 3");
    } catch (error) {
      console.error(error);
      console.log("*** TEST CLEANUP FAILED ***");
    }
  });

  it("should return a '403 Forbidden' status code if the user does not own the chat room", async () => {
    const response = await request(app)
      .post("/chats/6/students") // The chat with id 6 does not belong to the currently logged in user
      .set("Cookie", [sessionCookie])
      .send([11111111, 22222222, 33333333]);
    expect(response.status).toBe(403);
  });

  it("should return a '404 Not Found' status code if the specified roomID does not exist", async () => {
    const response = await request(app)
      .post("/chats/99999/students") // The chat with id 99999 does not exist in the test database
      .set("Cookie", [sessionCookie])
      .send([11111111, 22222222, 33333333]);
    expect(response.status).toBe(404);
  });
});

/**
 * Test cases for the batch/CSV student enrolment endpoint (POST /chats/:roomID/students/batch)
 */
describe("POST /chats/:roomID/students/batch", () => {
  it("should return a '200 OK' status code when a valid CSV file containing valid student numbers is uploaded", async () => {
    try {
      const response = await request(app)
        .post("/chats/3/students/batch")
        .set("Cookie", [sessionCookie])
        .attach("csvFile", "./csvTestFiles/validStudents.csv"); // Attach the valid CSV test file
      expect(response.status).toBe(200);

      // Test Cleanup - Delete the enrolled Students from the room_member table
      try {
        await pool.query("DELETE FROM room_member WHERE room_id = 3");
      } catch (error) {
        console.error(error);
        console.log("*** TEST CLEANUP FAILED *** ");
      }
    } catch (error) {}
  });

  it("should return a '400 Bad Request' status code if no CSV File was uploaded", async () => {
    // Send a request with no CSV file attached
    const response = await request(app)
      .post("/chats/3/students/batch")
      .set("Cookie", [sessionCookie]);
    expect(response.status).toBe(400);
  });
});

/**
 * Test cases for the Teacher enrolment endpoint (POST /chats/:roomID/teachers)
 */
describe("POST /chats/:roomID/teachers", () => {
  it("should return a '200 OK' status code if the roomID exists and the request body contains an array of valid teacher email addresses", async () => {
    const response = await request(app)
      .post("/chats/3/teachers")
      .set("Cookie", [sessionCookie])
      .send(["testadmin@mail.com"]); // Request body contains array with email address of valid teacher user
    expect(response.status).toBe(200);

    // Test Cleanup - Delete the enrolled teacher from the room_member table
    try {
      await pool.query("DELETE FROM room_member WHERE room_id = 3");
    } catch (error) {
      console.error(error);
      console.log("*** TEST CLEANUP FAILED *** ");
    }
  });

  it("should return a '400 Bad Request' status code if the request body is empty", async () => {
    const response = await request(app)
      .post("/chats/3/teachers")
      .set("Cookie", [sessionCookie])
      .send(); // Request body is empty
    expect(response.status).toBe(400);
  });

  it("should return a '403 Forbidden' Status Code if the user does not own the chat room", async () => {
    const response = await request(app)
      .post("/chats/6/teachers")
      .set("Cookie", [sessionCookie])
      .send(["testadmin@mail.com"]);
    expect(response.status).toBe(403);
  });

  it("should return a '404 Not Found' Status Code if the roomID does not exist", async () => {
    const response = await request(app)
      .post("/chats/99999/teachers") // The room with id 99999 does not exist in the test database
      .set("Cookie", [sessionCookie])
      .send(["testadmin@mail.com"]);
    expect(response.status).toBe(404);
  });
});

/**
 * Test cases for the chat-info retrieval endpoint (GET /chats/:roomID)
 */
describe("GET /chats/:roomID", () => {
  it("should return a '200 OK' status code if the roomID exists", async () => {
    const response = await request(app)
      .get("/chats/3")
      .set("Cookie", [sessionCookie])
      .send();
    expect(response.status).toBe(200);
  });

  it("should return a '404 Not found' status code if the roomID does not exist", async () => {
    const response = await request(app)
      .get("/chats/99999") // Chat with ID 99999 does not exist in the test database
      .set("Cookie", [sessionCookie])
      .send();
    expect(response.status).toBe(404);
  });
});

/**
 * Test cases for the message retrieval endpoint (/chats/:roomID/messages)
 */
describe("GET /chats/:roomID/messages", () => {
  it("should return a '200 OK' status code if the roomID exists", async () => {
    const response = await request(app)
      .get("/chats/3/messages")
      .set("Cookie", [sessionCookie])
      .send();
    expect(response.status).toBe(200);
  });

  it("should return a '404 Not Found' status code if the roomID does not exist", async () => {
    const response = await request(app)
      .get("/chats/99999/messages") // Chat room with id 99999 does not exist in the test database
      .set("Cookie", [sessionCookie])
      .send();
    expect(response.status).toBe(404);
  });
});

/**
 * Test cases for the message posting endpoint (/chats/:roomID/messages)
 */
describe("POST /chats/:roomID/messages", () => {
  it("should return a '204 No Content' status code if the roomID exists and the request body contains 'content' and 'authorID' properties", async () => {
    const response = await request(app)
      .post("/chats/3/messages")
      .set("Cookie", [sessionCookie])
      .send({ content: "test", authorID: 4 });
    expect(response.status).toBe(204);

    // Test cleanup - Delete the newly inserted test message from the message table
    try {
      await pool.query(
        "DELETE FROM message WHERE member_id = 4 AND room_id = 3"
      );
    } catch (error) {
      console.error(error);
      console.log("*** TEST CLEANUP FAILED ***");
    }
  });

  it("should return a '400 Bad Request' status code if the request body does not have the required properties", async () => {
    const response = await request(app)
      .post("/chats/3/messages")
      .set("Cookie", [sessionCookie])
      .send(); // The request body does not contain the required 'content' and 'authorID' properties
    expect(response.status).toBe(400);
  });

  it("should return a '403 Forbidden' status code if the specified roomID is set as 'read-only'", async () => {
    const response = await request(app)
      .post("/chats/34/messages") // Chat room with ID 34 is set as 'read-only'. Messages cannot be posted to this room.
      .set("Cookie", [sessionCookie])
      .send({ content: "test", authorID: 4 });
    expect(response.status).toBe(403);
  });

  it("should return a '404 Not Found' status code if the specified roomID does not exist", async () => {
    const response = await request(app)
      .post("/chats/99999/messages") // Chat room with ID 99999 is does not exist in the test database
      .set("Cookie", [sessionCookie])
      .send({ content: "test", authorID: 4 });
    expect(response.status).toBe(404);
  });
});

/**
 * Test cases for the endpoint which sets the 'read-only' status of a chat room (PUT /chats/:roomID/read-only)
 */
describe("PUT /chats:roomID/read-only", () => {
  it("should return a '200 OK' status code if the request is valid and the user has the required permissions", async () => {
    const response = await request(app)
      .put("/chats/3/read-only")
      .set("Cookie", [sessionCookie])
      .send({ readOnly: false });
    expect(response.status).toBe(200);
  });

  it("should return a '403 Forbidden' status code if the user does not own the chat room", async () => {
    const response = await request(app)
      .put("/chats/6/read-only") // Chat room with ID 6 is not owned by the currently logged in user
      .set("Cookie", [sessionCookie])
      .send({ readOnly: false });
    expect(response.status).toBe(403);
  });

  it("should return a '404 Not Found' status code if the specified chat room does not exist", async () => {
    const response = await request(app)
      .put("/chats/99999/read-only") // Chat room with ID 99999 does not exist in the test database
      .set("Cookie", [sessionCookie])
      .send({ readOnly: false });
    expect(response.status).toBe(404);
  });
});

/**
 * Test cases for the endpoint to archive/hide chat rooms (PUT /chats/:roomID/hide)
 */
describe("PUT /chats/:roomID/hide", () => {
  it("should return a '204 No Content' status code if the request is valid and the user has the required permissions", async () => {
    const response = await request(app)
      .put("/chats/3/hide")
      .set("Cookie", [sessionCookie])
      .send();
    expect(response.status).toBe(204);

    // Test cleanup: Mark the test room as not hidden/archived
    try {
      await pool.query("UPDATE room SET hidden = false WHERE room_id = 3");
    } catch (error) {
      console.error(error);
      console.log("*** TEST CLEANUP FAILED ***");
    }
  });

  it("should return a '403 Forbidden' status code if the user does not own the chat room", async () => {
    const response = await request(app)
      .put("/chats/6/hide") // Chat room with ID 6 is not owned by the currently logged in user
      .set("Cookie", [sessionCookie])
      .send({ readOnly: false });
    expect(response.status).toBe(403);
  });

  it("should return a '404 Not Found' status code if the specified roomID does not exist", async () => {
    const response = await request(app)
      .put("/chats/99999/hide") // Chat room with ID 99999 does not exist in the test database
      .set("Cookie", [sessionCookie])
      .send({ readOnly: false });
    expect(response.status).toBe(404);
  });
});

/**
 * Test cases for the endpoint to unhide/re-activate chat rooms (PUT /chats/:roomID/show)
 */
describe("PUT /chats/:roomID/show", () => {
  it("should return a '204 No Content' status code if the request is valid and the user has the required permissions", async () => {
    const response = await request(app)
      .put("/chats/3/show")
      .set("Cookie", [sessionCookie])
      .send();
    expect(response.status).toBe(204);
  });

  it("should return a '403 Forbidden' status code if the user does not own the chat room", async () => {
    const response = await request(app)
      .put("/chats/6/show") // Chat room with ID 6 is not owned by the currently logged in user
      .set("Cookie", [sessionCookie])
      .send();
    expect(response.status).toBe(403);
  });

  it("should return a '404 Not Found' status code if the specified roomID does not exist", async () => {
    const response = await request(app)
      .put("/chats/99999/show") // Chat room with ID 99999 does not exist in the test database
      .set("Cookie", [sessionCookie])
      .send();
    expect(response.status).toBe(404);
  });
});

/**
 * Test cases for the endpoint to hide messages (PUT /:roomID/messages/:messageID/hide)
 */
describe("PUT chats/:roomID/messages/:messageID/hide", () => {
  it("should return a '204 No Content' status code when the request is valid and the user has the required permissions", async () => {
    const response = await request(app)
      .put("/chats/50/messages/20/hide")
      .set("Cookie", [sessionCookie])
      .send();
    expect(response.status).toBe(204);

    // Test Cleanup: Mark the test message as not hidden
    try {
      await pool.query(
        "UPDATE message SET hidden = false WHERE message_id = 20"
      );
    } catch (error) {
      console.error(error);
      console.log("*** TEST CLEANUP FAILED ***");
    }
  });

  it("should return a '404 Not Found' status code if the specified messageID does not exist", async () => {
    const response = await request(app)
      .put("/chats/50/messages/999999/hide") // Message with ID 999999 does not exist in the test database
      .set("Cookie", [sessionCookie])
      .send();
    expect(response.status).toBe(404);
  });
});

/**
 * Test cases for the endpoint to un-hide messages (PUT /:roomID/messages/:messageID/show)
 */
describe("PUT /chats/:roomID/messages/:messageID/show", () => {
  it("should return a '204 No Content' status code if the request is valid and the user has the required permissions", async () => {
    const response = await request(app)
      .put("/chats/50/messages/20/show")
      .set("Cookie", [sessionCookie])
      .send();
    expect(response.status).toBe(204);
  });

  it("should return a '404 Not Found' status code if the specified messageID does not exist", async () => {
    const response = await request(app)
      .put("/chats/50/messages/999999/show") // Message with ID 999999 does not exist in the test database
      .set("Cookie", [sessionCookie])
      .send();
    expect(response.status).toBe(404);
  });
});

/**
 * Test cases for the end-quiz endpoint (PUT chats/messages/:messageID/end-quiz)
 */
describe("PUT chats/messages/:messageID/end-quiz", () => {
  it("should return a '200 OK' status code if the request is valid and the user has the required permissions", async () => {
    const response = await request(app)
      .put("/chats/messages/26/end-quiz")
      .set("Cookie", [sessionCookie])
      .send();
    expect(response.status).toBe(200);
  });

  it("should return a '404 Not Found' status code if the specified messageID does not exist", async () => {
    const response = await request(app)
      .put("/chats/messages/99999/end-quiz") // A message with the ID 99999 does not exist in the test database
      .set("Cookie", [sessionCookie])
      .send();
    expect(response.status).toBe(404);
  });
});

/**
 * Test cases for the 'like message' endpoint (POST /chats/:roomID/messages/:messageID/like)
 */
describe("POST /chats/:roomID/messages/:messageID/like", () => {
  it("should return a '204 No Content' status code if the request is valid and the user has not already liked the message", async () => {
    const response = await request(app)
      .post("/chats/50/messages/20/like")
      .set("Cookie", [sessionCookie])
      .send();
    expect(response.status).toBe(204);

    // Test Cleanup: Delete the like that was created during this test
    try {
      await pool.query(
        "DELETE FROM likes WHERE message_id = 20 AND member_id = 4"
      );
    } catch (error) {
      console.error(error);
      console.log("*** TEST CLEANUP FAILED ***");
    }
  });

  it("should return a '409 Conflict' status code if the user has already liked the specified message", async () => {
    const response = await request(app)
      .post("/chats/50/messages/34/like")
      .set("Cookie", [sessionCookie])
      .send();
    expect(response.status).toBe(409);
  });

  it("should return a '404 Not Found' status code if the specified messageID does not exist", async () => {
    const response = await request(app)
      .post("/chats/50/messages/99999/like") // Message with ID 99999 does not exist in the test database
      .set("Cookie", [sessionCookie])
      .send();
    expect(response.status).toBe(404);
  });
});

/**
 * Test cases for the 'un-like message' endpoint (DELETE /chats/:roomID/messages/:messageID/like)
 */
describe("DELETE /chats/:roomID/messages/:messageID/like", () => {
  it("should return a '204 No Content' status code if the request was valid and the user had already liked the message", async () => {
    const response = await request(app)
      .delete("/chats/50/messages/34/like")
      .set("Cookie", [sessionCookie])
      .send();
    expect(response.status).toBe(204);

    // Test cleanup - replace the like that was deleted during this test
    try {
      await pool.query(
        "INSERT INTO likes (member_id, message_id) VALUES (4, 34)"
      );
    } catch (error) {
      console.error(error);
      console.log("*** TEST CLEANUP FAILED ***");
    }
  });

  it("should return a '403 Forbidden' status code if the user has not already liked the message", async () => {
    const response = await request(app)
      .delete("/chats/50/messages/20/like")
      .set("Cookie", [sessionCookie])
      .send();
    expect(response.status).toBe(403);
  });

  it("should return a '404 Not Found' status code if the specified message ID does not exist", async () => {
    const response = await request(app)
      .delete("/chats/50/messages/99999/like") // Message with ID 99999 does not exist in the database
      .set("Cookie", [sessionCookie])
      .send();
    expect(response.status).toBe(404);
  });
});

/**
 * Test cases for the message deletion endpoint (DELETE /chats/:roomID/messages/:messageID)
 */
describe("DELETE /chats/:roomID/messages/:messageID", () => {
  it("should return a '204' status code if the messageID exists and the user has the required permissions", async () => {
    // Test Setup: Insert a message to be deleted in this test
    try {
      await pool.query(
        "INSERT INTO message (message_id, content, timestamp, room_id, member_id) VALUES ($1, $2, $3, $4, $5)",
        [88888, "test", new Date(), 50, 4]
      );
    } catch (error) {
      console.error(error);
      console.log("*** TEST SETUP FAILED ****");
    }

    // Delete the message
    const response = await request(app)
      .delete("/chats/50/messages/88888")
      .set("Cookie", [sessionCookie])
      .send();
    expect(response.status).toBe(204);
  });

  it("should return a '404 Not Found' status code if the specified messageID does not exist", async () => {
    const response = await request(app)
      .delete("/chats/50/messages/99999") // Message with ID 99999 does not exist in the test database
      .set("Cookie", [sessionCookie])
      .send();
    expect(response.status).toBe(404);
  });
});

/**
 * Test cases for the analytics retrieval endpoint (GET /chats/:roomID/analytics)
 */
describe("GET /chats/:roomID/analytics", () => {
  it("should return a '200 OK' response code if the request is valid and the user has the required permissions", async () => {
    const response = await request(app)
      .get("/chats/50/analytics")
      .set("Cookie", [sessionCookie])
      .send();
    expect(response.status).toBe(200);
  });

  it("should return a '404 Not Found' response code if the specified room ID does not exist", async () => {
    const response = await request(app)
      .get("/chats/99999/analytics") // Chatroom with ID 9999 does not exist in the test database
      .set("Cookie", [sessionCookie])
      .send();
    expect(response.status).toBe(404);
  });

  it("should return a '403 Forbidden' status code if the user does not own the specified chat room", async () => {
    const response = await request(app)
      .get("/chats/6/analytics") // Chatroom with ID 6 is not owned by the currently logged in user
      .set("Cookie", [sessionCookie])
      .send();
    expect(response.status).toBe(403);
  });
});

/**
 * Test cases for the sentiment analysis retrieval endpoint (GET /chats/:roomID/sentiment)
 */
describe("GET /chats/:roomID/sentiment", () => {
//   it("should return a '200 OK' status code if the request is valid and the user owns the specified chat room", async () => {
//     const response = await request(app)
//       .get("/chats/3/sentiment")
//       .set("Cookie", [sessionCookie])
//       .send();
//     expect(response.status).toBe(200);
//   });

  it("should return a '403 Forbidden' status code if user does not own the specified chat room", async () => {
    const response = await request(app)
      .get("/chats/6/sentiment")
      .set("Cookie", [sessionCookie])
      .send();
    expect(response.status).toBe(403);
  })

  it("should return a '404 Not Found' status code if the specified chatroom does not exist", async () => {
    const response = await request(app)
      .get("/chats/99999/sentiment") // Chatroom with ID 99999 does not exist in the test database
      .set("Cookie", [sessionCookie])
      .send();
    expect(response.status).toBe(404);
  })
});
