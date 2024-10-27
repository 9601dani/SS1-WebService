const express = require('express');
const router = express.Router();
const middleware = require('../../middleware/verifytoken.middleware');
const apiController = require('../controllers/api.controller');

router.get('/auth/token', apiController.getToken);
router.get('/card',[middleware.verifyTokenApi], apiController.getCard);
router.post('/pay',[middleware.verifyTokenApi], apiController.pay);

module.exports = router;