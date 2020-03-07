const fetch = require("node-fetch");
const fs = require("fs");
const LATEST_API = "https://www.ecb.europa.eu/stats/eurofxref/eurofxref-daily.xml";
const HISTORICAL_API = "https://www.ecb.europa.eu/stats/eurofxref/eurofxref-hist-90d.xml";
const LATEST_PATH = __dirname + "/latestData.xml";
const HISTORICAL_PATH = __dirname + "/historicalData.xml";

fetch(LATEST_API)
  .then(data => data.text())
  .then(final => {
    fs.writeFile(LATEST_PATH, final, err => {
      if (err !== null) console.log(err);
    });
  });

fetch(HISTORICAL_API)
  .then(data => data.text())
  .then(final => {
    fs.writeFile(HISTORICAL_PATH, final, err => {
      if (err !== null) console.log(err);
    });
  });
