const express = require("express");
const router = express.Router();
const middleware = require("../../middleware/verifytoken.middleware");

const userController = require("../controllers/user.controller");

router.get("/pages/:id", userController.getPages);
router.post("/login", userController.login);
router.get("/roles",[middleware.verifyToken], userController.getRoles);

module.exports = router;