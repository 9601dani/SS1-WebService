const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');

router.get('/users', adminController.getUsers);
router.post('/register-user', adminController.createUser);
router.post('/verify-card', adminController.verifyCard);
router.get('/get-all-cards', adminController.getAllCards);
router.put('/update-card-state', adminController.updateCardState);
router.put('/update-exchange', adminController.updateExchange);
router.get('/get-card/:card', adminController.getCard);
router.put('/reduce-balance', adminController.reduceBalance);

module.exports = router;