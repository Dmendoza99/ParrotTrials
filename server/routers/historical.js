const express = require("express");
const xml2js = require("xml2js");
const fs = require("fs");
const historical = express.Router();
const API_ROUTE = "https://www.ecb.europa.eu/stats/eurofxref/eurofxref-hist-90d.xml";
const historicalData = __dirname + "/../historicalData.xml";
const { codes } = require("../currencies.js");

const parser = new xml2js.Parser({
  trim: true,
  normalizeTags: true,
  mergeAttrs: true,
});

historical.get("/:base/:versus", (req, res) => {
  const { start, end, date } = req.query;
  let { base, versus } = req.params;
  if (date) {
    base = base.toUpperCase();
    versus = versus.toUpperCase();
    const realDate = new Date(date);
    if (codes.includes(base) && codes.includes(versus)) {
      fs.readFile(historicalData, function(err, data) {
        if (err === null) {
          parser.parseString(data, function(err, result) {
            if (err === null) {
              const realdata = result["gesmes:envelope"]["cube"][0]["cube"];
              const final = realdata.map(data => {
                return {
                  time: data["time"][0],
                  rates: data["cube"]
                    .map(currency => {
                      if (codes.includes(currency.currency[0]))
                        return { [currency.currency[0]]: currency.rate[0] };
                    })
                    .reduce(function(result, current) {
                      return Object.assign(result, current);
                    }, {}),
                };
              });
              const dates = final.filter(data => {
                const date = new Date(data.time);
                return date.toLocaleDateString() === realDate.toLocaleDateString();
              });
              if (base === "EUR") {
                res.status(200).json({ base, versus, date, rate: dates[0].rates[versus] });
              } else if (versus === "EUR") {
                res.status(200).json({ base, versus, date, rate: dates[0].rates[base] });
              } else {
                res.status(200).json({
                  base,
                  versus,
                  date,
                  rate: (1 / dates[0].rates[base]) * dates[0].rates[versus],
                });
              }
            } else {
              res.status(500).json({ success: false, message: "Error parsing our data" });
            }
          });
        } else {
          res.status(500).json({ success: false, message: "Error reading our data" });
        }
      });
    } else {
      res.status(400).json({ success: false, message: "There's atleast one invalid currency" });
    }
  } else if (start === undefined || end === undefined) {
    res
      .status(400)
      .json({ success: false, message: "You need to include query strings for start and end" });
  } else {
    const startDate = new Date(start);
    const endDate = new Date(end);
    base = base.toUpperCase();
    versus = versus.toUpperCase();
    if (codes.includes(base) && codes.includes(versus)) {
      fs.readFile(historicalData, function(err, data) {
        if (err === null) {
          parser.parseString(data, function(err, result) {
            if (err === null) {
              const realdata = result["gesmes:envelope"]["cube"][0]["cube"];
              const final = realdata.map(data => {
                return {
                  time: data["time"][0],
                  rates: data["cube"]
                    .map(currency => {
                      if (codes.includes(currency.currency[0]))
                        return { [currency.currency[0]]: currency.rate[0] };
                    })
                    .reduce(function(result, current) {
                      return Object.assign(result, current);
                    }, {}),
                };
              });
              const dates = final.filter(data => {
                const date = new Date(data.time);
                return date >= startDate && date <= endDate;
              });
              res.status(200).json({
                base,
                versus,
                start,
                end,
                rates: dates
                  .map(date => {
                    if (base === "EUR") {
                      return { [date.time]: date.rates[versus] };
                    } else if (versus === "EUR") {
                      return { [date.time]: String(1 / date.rates[base]) };
                    } else {
                      return { [date.time]: String((1 / date.rates[base]) * date.rates[versus]) };
                    }
                  })
                  .reduce(function(result, current) {
                    return Object.assign(result, current);
                  }, {}),
              });
            } else {
              res.status(500).json({ success: false, message: "Error parsing our data" });
            }
          });
        } else {
          res.status(500).json({ success: false, message: "Error reading our data" });
        }
      });
    } else {
      res.status(400).json({ success: false, message: "There's atleast one invalid currency" });
    }
  }
});

module.exports = historical;
