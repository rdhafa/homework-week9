const router = require("express").Router();
const movieRouter = require("./movie.js");
const userRouter = require("./user.js");
const jwt = require("jsonwebtoken");

// Middleware authentication
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) return res.status(401).send({ message: "Hayooooooo" });
  jwt.verify(token, process.env.JWT_ACCESS_CODE, (err, user) => {
    if (err) {
      console.log(err);
      res.status(403).send({ message: "Hayooooooo" });
    } else {
      req.user = user;
      next();
    }
  });
};

router.use("/movies", authenticateToken, movieRouter);
router.use("/users", userRouter);

module.exports = router;
