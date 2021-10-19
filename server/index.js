const express = require("express");
const axios = require("axios");
const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));

const PORT = process.env.PORT || 3001;

const app = express();

app.get("/api", (req, res) => {
  res.json({ message: "Hello from server!" });
});

app.get("/image", async (req, res) => {
  const query = req.query.query.trim();
  // Construct the flickr URL and key
  const APIKEY = "ffd6e3622d2137fe60a38874ba4a2464";
  const searchUrl = `https://api.flickr.com/services/rest/?&method=flickr.photos.search&api_key=ffd6e3622d2137fe60a38874ba4a2464&tags=${query}&per-page=1&format=json&media=photos&nojsoncallback=1`;

  //image is returned in https://live.staticflickr.com/{server-id}/{id}_{secret}_{size-suffix}.jpg format
  // axios.get(searchUrl).then((response) => {
  //   const responseJSON = response.data;
  //   res.status(200).json({ responseJSON });
  // });

  const fetch_res = await fetch(searchUrl);
  const json = await fetch_res.json();
  console.log(req);
  res.json(json.photos.photo);
});

app.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});
