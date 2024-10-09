const express = require("express");
const router = express.Router();


router.use(express.json());
router.use(express.urlencoded({ extended: true }));

router.get("", (req, res) => {
  res.send("Hello World!");
});

module.exports = router;