import request from "supertest";
import server from "./index";

describe("endpoint: api/ping", () => {
  afterAll(() => {
    server.close();
  });

  describe("on get req", () => {
    test("should respond with status 200 code", async () => {
      const res = await request(server).get("/api/ping");
      expect(res.statusCode).toBe(200);
    });
  });
});

describe("endpoint: api/posts", () => {
  describe("on req with no tag param", () => {
    test("should respond with status 400 code", async () => {
      const res = await request(server).get("/api/posts");
      expect(res.statusCode).toBe(400);
    });
  });
  describe("on req with a tag param not included in any entries", () => {
    test("should respond with an empty array", async () => {
      const res = await request(server)
        .get("/api/posts?tags=zeppo")
        .then((response) => response.body);
      expect(res.posts.length).toBe(0);
    });
  });
  describe("on req with sortBy set to likes", () => {
    test("should sort posts by number of likes ascending", async () => {
      const res = await request(server)
        .get("/api/posts?tags=tech&sortBy=likes")
        .then((response) => response.body);
      const inOrder = (posts) => {
        posts.forEach((post) => {
          let counter = -Infinity;
          if (post.likes < counter) {
            return false;
          } else {
            counter = post.likes;
          }
        });
        return true;
      };
      expect(inOrder(res.posts)).toBe(true);
    });
  });
  describe("on req with order param set to desc", () => {
    test("should return posts in descending sortby", async () => {
      const res = await request(server)
        .get("/api/posts?tags=tech&sortBy=id&order=desc")
        .then((response) => response.body);
      const inOrder = (posts) => {
        posts.forEach((post) => {
          let counter = Infinity;
          if (post.id > counter) {
            return false;
          } else {
            counter = post.id;
          }
        });
        return true;
      };
      expect(inOrder(res.posts)).toBe(true);
    });
  });
});
