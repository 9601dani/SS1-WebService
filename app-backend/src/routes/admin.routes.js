const express = require('express');
const router = express.Router();
const middleware = require("../../middleware/verifytoken.middleware");
const adminController = require('../controllers/admin.controller');

router.get('/users', adminController.getUsers);
router.post('user',[middleware.verifyToken], adminController.createUser);

module.exports = router;