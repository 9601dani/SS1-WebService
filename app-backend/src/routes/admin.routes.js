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

router.get('/report1', adminController.getReport1);
router.get('/report2', adminController.getReport2);
router.get('/report3/:card', adminController.getReport3);
router.get('/report4', adminController.getReport4);
router.get('/report5', adminController.getReport5);

module.exports = router;