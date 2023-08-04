require("dotenv").config();
const router = require("express").Router();
const pool = require("../config/config.js");
const jwt = require("jsonwebtoken");

// List all users
router.get("/", (req, res) => {
  const query = `SELECT * FROM users ORDER BY id`;
  pool.query(query, (err, result) => {
    if (err) {
      console.log(err);
    } else {
      res.status(200).send(result.rows);
    }
  });
});

// Register
router.post("/register", (req, res) => {
  const { id, email, gender, password, role } = req.body;
  if (id || !email || !gender || !password || !role) {
    res.status(400).send({ message: "Bad request!" });
  } else {
    const query = `INSERT INTO users(email, gender, password, role) VALUES ($1, $2, $3, $4)`;
    pool.query(query, [email, gender, password, role], (err, result) => {
      if (err) {
        console.log(err);
      } else {
        res.status(201).send({ message: "Register successful!" });
      }
    });
  }
});

// Login user
router.post("/login", (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    res.status(400).send({ message: "Bad request!" });
  } else {
    const checkEmail = `SELECT * FROM users WHERE email = $1`;
    pool.query(checkEmail, [email], (err, result) => {
      if (err) {
        console.log(err);
      } else {
        if (result.rowCount === 0) {
          res.status(401).send({ message: "Email or password is not valid!" });
        } else {
          const checkPassword = `SELECT * FROM users WHERE email = $1 AND password = $2`;
          pool.query(checkPassword, [email, password], (err, result) => {
            if (err) {
              console.log(err);
            } else {
              if (result.rowCount === 0) {
                res.status(401).send({ message: "Email or password is not valid!" });
              } else {
                const user = {
                  id: result.rows[0].id,
                  email: result.rows[0].email,
                  role: result.rows[0].role,
                };
                const token = jwt.sign(user, process.env.JWT_ACCESS_CODE, { expiresIn: "1h" });
                res.status(201).send({ message: "Login successful!", token: token });
              }
            }
          });
        }
      }
    });
  }
});

// Verify jwt
router.get("/verify/:token", (req, res) => {
  const data = jwt.verify(req.params.token, process.env.JWT_ACCESS_CODE);
  res.send(data);
});

// Delete user
router.delete("/:id", (req, res) => {
  const { id } = req.params;
  const query = `DELETE FROM users WHERE id = $1`;
  pool.query(query, [id], (err, result) => {
    if (err) {
      console.log(err);
    } else {
      if (result.rowCount === 0) {
        res.status(404).send({ message: "User not found!" });
      } else {
        res.status(200).send({ message: "User deleted successfully!" });
      }
    }
  });
});

module.exports = router;
