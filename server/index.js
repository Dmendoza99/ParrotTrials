const express = require("express");
const app = express();
var bodyParser = require("body-parser");
var cors = require("cors");
const PORT = 3001;
const router = express.Router();

app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());
app.use(cors());

router.get("/ping", (req, res) => {
  console.log(req.body);
  res.status(200).json({ message: "pong" });
});

app.use("/api", router);

app.listen(PORT, () => {
  console.log(`app listening on ${PORT}`);
});
