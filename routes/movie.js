const router = require("express").Router();
const pool = require("../config/config.js");
const { authorization } = require("../middlewares/auth.js");

// List Movies with Pagination
router.get("/", (req, res) => {
  const page = parseInt(req.query.page);
  const size = parseInt(req.query.size);

  if (!page || !size) {
    if (!page && !size) {
      pool.query(`SELECT * FROM movies ORDER BY id`, (err, result) => {
        res.status(200).send(result.rows);
      });
    } else {
      res.status(400).send({ message: "Bad request!" });
    }
  } else {
    const query = `
      SELECT
        *
      FROM movies ORDER BY id
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

// List Movie by id
router.get("/:id", (req, res) => {
  const { id } = req.params;
  const query = `SELECT * FROM movies WHERE id = $1`;
  pool.query(query, [id], (err, result) => {
    if (err) {
      console.log(err);
    } else {
      if (result.rowCount === 0) {
        res.status(404).send({ message: "Movie not found!" });
      } else {
        res.status(200).send(result.rows[0]);
      }
    }
  });
});

// Add Movie
router.post("/", (req, res) => {
  const { title, genres } = req.body;
  const id = parseInt(req.body.id);
  const year = parseInt(req.body.year);
  if (!title || !genres || !year) {
    res.status(400).send({ message: "Bad request!" });
  } else {
    if (id) {
      pool.query(`SELECT id FROM movies WHERE id = $1`, [id], (err, result) => {
        if (err) {
          console.log(err);
        } else {
          if (result.rowCount === 0) {
            const query = `INSERT INTO movies(id, title, genres, year) VALUES ($1, $2, $3, $4);`;
            pool.query(query, [id, title, genres, year], (err, result) => {
              if (err) {
                console.error(err);
              } else {
                res.status(201).send({ message: "Movie added successfully!" });
              }
            });
          } else {
            res.status(400).send({ message: "Id already exist!" });
          }
        }
      });
    } else {
      const query = `INSERT INTO movies(title, genres, year) VALUES ($1, $2, $3);`;
      pool.query(query, [title, genres, year], (err, result) => {
        if (err) {
          console.error(err);
        } else {
          res.status(201).send({ message: "Movie added successfully!" });
        }
      });
    }
  }
});

// Update Movie
router.patch("/:id", authorization, (req, res) => {
  const { id } = req.params;
  const query = `SELECT * FROM movies WHERE id = $1`;
  pool.query(query, [id], (err, result) => {
    if (err) {
      console.log(err);
    } else {
      if (result.rowCount === 0) {
        res.status(404).send({ message: "Movie does not exist!" });
      } else {
        const reqBody = Object.entries(req.body);
        const reqBodyId = req.body.id;
        if (reqBodyId) {
          return res.status(400).send({ message: "Bad request!" });
        }

        let isKeyValid = true;

        for (const [key, value] of reqBody) {
          if (key === "title" || key === "genres" || key === "year") {
            const query = `UPDATE movies SET ${key} = $1 WHERE id = $2`;
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
          res.status(200).send({ message: "Movie updated successfully!" });
        } else {
          res.status(400).send({ message: "Bad request!" });
        }
      }
    }
  });
});

// Delete Movie
router.delete("/:id", authorization, (req, res) => {
  const { id } = req.params;
  const query = `DELETE FROM movies WHERE id = $1`;
  pool.query(query, [id], (err, result) => {
    if (err) {
      console.log(err);
    } else {
      if (result.rowCount === 0) {
        res.status(404).send({ message: "Movie not found!" });
      } else {
        res.status(200).send({ message: "Movie deleted successfully!" });
      }
    }
  });
});

module.exports = router;
