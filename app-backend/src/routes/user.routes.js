const express = require("express");
const router = express.Router();
const middleware = require("../../middleware/verifytoken.middleware");

const userController = require("../controllers/user.controller");

router.get("/pages/:id", userController.getPages);
router.post("/login", userController.login);
router.get("/comment", userController.getComments);
router.post("/comment",[middleware.verifyToken], userController.createComment);
router.get("/content/:keyName", userController.getContent);
router.get("/roles",[middleware.verifyToken], userController.getRoles);
router.post("/contact", userController.saveMessages);
router.get("/transactions/:id",[middleware.verifyToken], userController.getMovements);
router.get("/profile/:id",[middleware.verifyToken], userController.getMyProfile);
router.post("/profile",[middleware.verifyToken], userController.updateProfile);
router.put("/notifications",[middleware.verifyToken], userController.updateNotifyme);
router.put("/password", userController.forgotPassword);
router.get("/forgot-pin/:card", userController.forgotPin);
module.exports = router;