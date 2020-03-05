const express = require("express");
const fetch = require("node-fetch");
const historical = express.Router();
const API_ROUTE = "https://www.ecb.europa.eu/stats/eurofxref/eurofxref-hist-90d.xml";

historical.get("/:currency", (req, res) => {
  res.status(200).json({ message: "pong" });
});

module.exports = historical;
