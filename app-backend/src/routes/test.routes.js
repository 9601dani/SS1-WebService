const express = require("express");
const router = express.Router();
const testController = require("../controllers/test.controller");

router.get("/testDB", testController.testDB); 
router.get("/", testController.helloWorld);  

module.exports = router;
