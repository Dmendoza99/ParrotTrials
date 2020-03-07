const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const cors = require("cors");
const morgan = require("morgan");
const path = require("path");
const fs = require("fs");
const latest = require("./routers/latest");
const historical = require("./routers/historical");
const PORT = 3001;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors());
var accessLogStream = fs.createWriteStream(path.join(__dirname, "access.log"), { flags: "a" });
app.use(morgan("tiny", { stream: accessLogStream }));

app.use("/latest", latest);
app.use("/historical", historical);

app.listen(PORT, () => {
  console.log(`app listening on ${PORT}`);
});
