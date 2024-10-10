const express = require("express");
const router = express.Router();
const getConnection = require('../../db/db');

router.use(express.json());
router.use(express.urlencoded({ extended: true }));

router.get("", (req, res) => {
  res.send("Hello World! This is a Module Credit CARD API. 201930699 #3");
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