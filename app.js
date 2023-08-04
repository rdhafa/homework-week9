const app = require("express")();
const port = 3000;
const router = require("./routes/index.js");
const bodyParser = require("body-parser");

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.get("/", (req, res) => {
  res.send("<h1><marquee>INDEX HOMEWORK WEEK 9</marquee></h1>");
});

app.use(router);

app.listen(port, () => {
  console.log(`listening on port ${port}`);
});
