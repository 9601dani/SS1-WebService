const express = require("express");
const router = express.Router();
const getConnection = require('../../db/db');

router.use(express.json());
router.use(express.urlencoded({ extended: true }));

router.get("", (req, res) => {
  res.send("Hello World!");
});

router.get("/test-db", async (req, res) => {
  try{
    const connection = await getConnection();
    connection.release();
    res.send("Connection to database was successful.");
  } catch (error) {
    res.status(500).send("Connection to database failed.");
  }
});

module.exports = router;