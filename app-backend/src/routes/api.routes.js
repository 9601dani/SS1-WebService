const express = require('express');
const router = express.Router();

const apiController = require('../controllers/api.controller');

router.get('/auth/token', apiController.getToken);
router.get('/card', apiController.getCard);
router.post('/pay', apiController.pay);

module.exports = router;