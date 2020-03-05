const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const cors = require("cors");
const latest = require("./routers/latest");
const historical = require("./routers/historical");
const PORT = 3001;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors());

app.use("/latest", latest);
app.use("/historical", historical);

app.listen(PORT, () => {
  console.log(`app listening on ${PORT}`);
});
