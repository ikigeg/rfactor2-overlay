/* eslint-disable */
const express = require("express");
const axios = require("axios");
const cors = require('cors');


const app = express();
const port = 8080;

app.use(cors());

app.get("/navigation/state", async (req, res) => {
  const { data } = await axios("http://127.0.0.1:5397/navigation/state");
  return res.json(data);
});

app.get("/rest/race/track", async (req, res) => {
  const { data } = await axios("http://localhost:5397/rest/race/track");
  return res.json(data);
});

app.get("/rest/race/track/:id/trackmap", async (req, res) => {
  const { data } = await axios(`http://localhost:5397/rest/race/track/${id}/trackmap`);
  return res.json(data);
});

// start the express server
app.listen(port, () => {
  // tslint:disable-next-line:no-console
  console.log(`server started at http://localhost:${port}`);
});
