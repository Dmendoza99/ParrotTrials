const express = require("express");
const xml2js = require("xml2js");
const fs = require("fs");
const latest = express.Router();
const { codes } = require("../currencies.js");
// const API_ROUTE = "https://www.ecb.europa.eu/stats/eurofxref/eurofxref-daily.xml";
const latestData = __dirname + "/../latestData.xml";

const parser = new xml2js.Parser({
  trim: true,
  normalizeTags: true,
  mergeAttrs: true,
});

const parseData = result => {
  return result["gesmes:envelope"]["cube"][0]["cube"][0]["cube"].filter(curr =>
    codes.includes(curr.currency[0])
  );
};

latest.get("/:currency$", async (req, res) => {
  let { currency } = req.params;
  currency = currency.toUpperCase();
  if (codes.includes(currency)) {
    fs.readFile(latestData, function(err, data) {
      if (err === null) {
        parser.parseString(data, function(err, result) {
          if (err === null) {
            let retVal;
            const realdata = parseData(result);
            if (currency !== "EUR") {
              const trans = realdata.filter(cur => cur.currency[0] === currency)[0].rate[0];
              retVal = realdata.map(curr => {
                if (currency === curr.currency[0]) {
                  return { EUR: String((1 / curr.rate[0]).toFixed(4)) };
                } else {
                  return { [curr.currency[0]]: String((1 / trans) * curr.rate[0]) };
                }
              });
            } else {
              retVal = realdata.map(curr => {
                return { [curr.currency[0]]: curr.rate[0] };
              });
            }
            retVal = retVal.reduce(function(result, current) {
              return Object.assign(result, current);
            }, {});
            res.status(200).json({
              base: currency,
              date: `${new Date().toLocaleDateString().replace(/\//g, "-")}`,
              rates: { ...retVal },
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
    res.status(400).json({ success: false, message: "Invalid currency" });
  }
});

latest.get("/:base/:versus", async (req, res) => {
  let { base, versus } = req.params;
  base = base.toUpperCase();
  versus = versus.toUpperCase();
  if (codes.includes(base) && codes.includes(versus)) {
    fs.readFile(latestData, function(err, data) {
      if (err === null) {
        parser.parseString(data, function(err, result) {
          if (err === null) {
            const realdata = parseData(result);
            if (base === "EUR" && versus === "EUR") {
              res.status(200).json({ base, versus, rate: 1 });
            } else if (base === "EUR") {
              let finalRate = realdata.filter(curr => curr.currency[0] === versus)[0];
              finalRate = Object.values(finalRate).reduce(function(result, current) {
                return Object.assign(result, current);
              }, {});
              res.status(200).json({ base, versus, rate: finalRate[0] });
            } else if (versus === "EUR") {
              let finalRate = realdata.filter(curr => curr.currency[0] === base)[0];
              finalRate = Object.values(finalRate).reduce(function(result, current) {
                return Object.assign(result, current);
              }, {});
              res.status(200).json({ base, versus, rate: 1 / finalRate[0] });
            } else {
              const transBase = realdata.filter(cur => cur.currency[0] === base)[0].rate[0];
              const transVersus = realdata.filter(cur => cur.currency[0] === versus)[0].rate[0];
              res.status(200).json({ base, versus, rate: String((1 / transBase) * transVersus) });
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

module.exports = latest;
