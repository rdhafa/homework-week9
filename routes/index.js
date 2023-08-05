const router = require("express").Router();
const movieRouter = require("./movie.js");
const userRouter = require("./user.js");
const { authentication } = require("../middlewares/auth.js");

router.use("/movies", authentication, movieRouter);
router.use("/users", userRouter);

module.exports = router;
