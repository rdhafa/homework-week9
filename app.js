const app = require("express")();
const port = 3000;
const router = require("./routes/index.js");
const bodyParser = require("body-parser");
const swaggerUi = require("swagger-ui-express");
const swaggerDocument = require("./swagger.json");
const cors = require("cors");
const morgan = require("morgan");

app.use(morgan("dev"));

app.use(cors());

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.get("/", (req, res) => {
  res.send("<h1><marquee>INDEX HOMEWORK WEEK 9</marquee></h1>");
});

app.use(router);

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.listen(port, () => {
  console.log(`listening on port ${port}`);
});
