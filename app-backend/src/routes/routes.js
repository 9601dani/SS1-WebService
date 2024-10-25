const express = require("express");
const router = express.Router();
const middleware = require("../../middleware/verifytoken.middleware");
const testRoutes = require("./test.routes");
const userRoutes = require("./user.routes");
const adminRoutes = require("./admin.routes");


router.use("/", testRoutes);
router.use("/user",userRoutes);
router.use("/admin", [middleware.verifyToken], adminRoutes);

module.exports = router;