import express from "express";
const app = express();
const port = process.env.PORT || 3000;
import axios from "axios";
const requestCache = {};

async function fetchInit(tags) {
  tags = tags.split(",");
  let userCache = [];
  let searchPerTag = tags.map((tag) =>
    axios
      .get("https://api.hatchways.io/assessment/blog/posts", {
        params: { tag: tag },
      })
      .then((response) => response.data.posts)
      .catch((err) => {
        console.error(err);
      })
  );
  return searchPerTag;
}

const searchBy = async (t, sb, o) => {
  let postCache = [];
  let result = [];
  const data = await fetchInit(t);
  return await Promise.all(data)
    .then((res) => {
      const merged = [].concat.apply([], res);
      merged.forEach((post) => {
        const tags = post.tags;
        tags.forEach((tag) => {
          if (t.includes(tag)) {
            if (!postCache.includes(post.id)) {
              postCache.push(post.id);
              result.push(post);
            }
          }
        });
      });
      return result;
    })
    .then((res) =>
      res.sort((a, b) => {
        a[sb] - b[sb];
      })
    )
    .then((res) => {
      if (o !== "asc") {
        res.reverse();
      }
      return res;
    })
    .catch((err) => {
      console.error(err);
    });
};
app.get("/api/ping", (req, res) => {
  try {
    res.status(200).json({ success: true });
  } catch (err) {
    console.error(err);
    return res.status(500).send("Server Error");
  }
});

app.get("/api/posts", async (req, res) => {
  try {
    const { tags, sortBy, direction } = req.query;
    let sb = sortBy ? sortBy : "id";
    let dir = direction ? direction : "asc";
    let lookup = tags + sb + dir;
    if (requestCache[lookup]) {
      return res.status(200).json(requestCache[lookup]);
    }
    let sbOptions = [
      "id",
      "tags",
      "author",
      "authorId",
      "reads",
      "likes",
      "popularity",
    ];

    if (!sbOptions.includes(sb)) {
      return res.status(400).json({ error: "sortBy parameter is invalid" });
    }
    if (tags) {
      return await searchBy(tags, sb, dir).then((response) => {
        let index = tags + sb + dir;
        requestCache[index] = response;
        return res.status(200).json({ posts: response });
      });
    } else {
      return res.status(400).json({ error: "Tags parameter is required" });
    }
  } catch (err) {
    console.error(err);
    return res.status(500).send("Server Error");
  }
});
const server = app.listen(port, () => {});
export default server;
