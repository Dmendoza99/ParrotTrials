const express = require("express");
const xml2js = require("xml2js");
const fs = require("fs");
const historical = express.Router();
const historicalData = __dirname + "/../historicalData.xml";
const { codes } = require("../currencies.js");

const parser = new xml2js.Parser({
  trim: true,
  normalizeTags: true,
  mergeAttrs: true,
});

const parseData = result => {
  return result["gesmes:envelope"]["cube"][0]["cube"];
};

historical.get("/:base/:versus", (req, res) => {
  const { start, end, date } = req.query;
  let { base, versus } = req.params;
  base = base.toUpperCase();
  versus = versus.toUpperCase();
  if (codes.includes(base) && codes.includes(versus)) {
    fs.readFile(historicalData, function(err, data) {
      if (err === null) {
        parser.parseString(data, function(err, result) {
          if (err === null) {
            const realdata = parseData(result);
            if (date) {
              const realDate = new Date(date);
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
              if (base === "EUR" && versus === "EUR") {
                return { [date.time]: 1 };
              } else if (base === "EUR") {
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
            } else if (start && end) {
              const startDate = new Date(start);
              const endDate = new Date(end);
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
                const date = new Date(data.time.replace(/-/g, "/"));
                return date >= startDate && date <= endDate;
              });
              res.status(200).json({
                base,
                versus,
                start,
                end,
                rates: dates
                  .map(date => {
                    if (base === "EUR" && versus === "EUR") {
                      return { [date.time]: 1 };
                    } else if (base === "EUR") {
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
              res.status(500).json({
                success: false,
                message: "You need to include query strings for start and end or just date",
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
});

module.exports = historical;
