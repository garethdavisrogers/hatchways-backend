const express = require("express");
const app = express();
const port = process.env.PORT || 3000;
const axios = require("axios");

function fetchInit() {
  return axios
    .get("https://api.hatchways.io/assessment/blog/posts", {
      params: { tag: "tech" },
    })
    .then((res) => res.data.posts)
    .catch(() => console.log("fetch failed"));
}

const searchBy = async (t, sb, o) => {
  const data = await fetchInit();
  let result = [];
  t = t.split(",");
  console.log(t);
  data.forEach((item) => {
    let tags = item.tags;
    for (let i = 0; i < tags.length; i++) {
      if (tags[i].includes(t)) {
        result.push(item);
        break;
      }
    }
  });
  return result;
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
    if (tags) {
      const search = await searchBy(tags, sb, dir);
      console.log(search);
      res.status(200).send(search);
    } else {
      return res.status(400).json({ error: "Tags parameter is required" });
    }
  } catch (err) {
    console.error(err);
    return res.status(500).send("Server Error");
  }
});
app.listen(port, () => {
  console.log("node is listening");
});
