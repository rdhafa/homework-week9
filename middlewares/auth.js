const jwt = require("jsonwebtoken");

const authentication = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) return res.status(401).send({ message: "Token invalid!" });
  jwt.verify(token, process.env.JWT_ACCESS_CODE, (err, user) => {
    if (err) {
      console.log(err);
      res.status(403).send({ message: "Token invalid!" });
    } else {
      req.user = user;
      next();
    }
  });
};

// Authorize Engineer only
const authorization = (req, res, next) => {
  const { role } = req.user;
  if (role === "Engineer") {
    next();
  } else {
    res.status(403).send({ message: "Forbidden" });
  }
};
module.exports = { authentication, authorization };
