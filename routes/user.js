require("dotenv").config();
const router = require("express").Router();
const pool = require("../config/config.js");
const jwt = require("jsonwebtoken");
const { authentication, authorization } = require("../middlewares/auth.js");

// List all users
router.get("/", authentication, authorization, (req, res) => {
  const page = parseInt(req.query.page);
  const size = parseInt(req.query.size);

  if (!page || !size) {
    if (!page && !size) {
      pool.query(`SELECT * FROM users ORDER BY id`, (err, result) => {
        res.status(200).send(result.rows);
      });
    } else {
      res.status(400).send({ message: "Bad request!" });
    }
  } else {
    const query = `
      SELECT
        *
      FROM users ORDER BY id
      LIMIT $2
      OFFSET (($1 - 1 ) * $2)`;
    pool.query(query, [page, size], (err, result) => {
      if (err) {
        console.error(err);
      } else {
        if (result.rowCount === 0) {
          res.status(404).send({ message: "Movie not found!" });
        } else {
          res.status(200).send(result.rows);
        }
      }
    });
  }
});

// List User by id
router.get("/:id", authentication, authorization, (req, res) => {
  const { id } = req.params;
  const query = `SELECT * FROM users WHERE id = $1`;
  pool.query(query, [id], (err, result) => {
    if (err) {
      console.log(err);
    } else {
      if (result.rowCount === 0) {
        res.status(404).send({ message: "User not found!" });
      } else {
        res.status(200).send(result.rows[0]);
      }
    }
  });
});

// Register
router.post("/register", (req, res) => {
  const { id, email, gender, password, role } = req.body;
  if (id || !email || !gender || !password || !role) {
    res.status(400).send({ message: "Bad request!" });
  } else {
    const checkAvailableEmail = `SELECT * FROM users WHERE email = $1`;
    pool.query(checkAvailableEmail, [email], (err, result) => {
      if (err) {
        console.log(err);
      } else {
        if (result.rowCount >= 1) {
          res.status(400).send({ message: "Email is not available!" });
        } else {
          const query = `INSERT INTO users(email, gender, password, role) VALUES ($1, $2, $3, $4)`;
          pool.query(query, [email, gender, password, role], (err, result) => {
            if (err) {
              console.log(err);
            } else {
              res.status(201).send({ message: "Register successful!", email: email, role: role });
            }
          });
        }
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
                res.status(200).send({ message: "Login successful!", token: token });
              }
            }
          });
        }
      }
    });
  }
});

// Update User
router.patch("/:id", authentication, authorization, (req, res) => {
  const { id } = req.params;
  const query = `SELECT * FROM users WHERE id = $1`;
  pool.query(query, [id], (err, result) => {
    if (err) {
      console.log(err);
    } else {
      if (result.rowCount === 0) {
        res.status(404).send({ message: "User does not exist!" });
      } else {
        const reqBody = Object.entries(req.body);
        const reqBodyId = req.body.id;
        if (reqBodyId) {
          return res.status(400).send({ message: "Bad request!" });
        }
        let isKeyValid = true;
        for (const [key, value] of reqBody) {
          if (key === "email" || key === "gender" || key === "password" || key === "role") {
            const query = `UPDATE users SET ${key} = $1 WHERE id = $2`;
            pool.query(query, [value, id], (err, result) => {
              if (err) {
                console.log(err);
              }
            });
          } else {
            isKeyValid = false;
          }
        }
        if (isKeyValid) {
          res.status(200).send({ message: "Update user successful!" });
        } else {
          res.status(400).send({ message: "Bad request!" });
        }
      }
    }
  });
});

// Delete user
router.delete("/:id", authentication, authorization, (req, res) => {
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
