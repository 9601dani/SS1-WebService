const express = require('express');
const router = express.Router();

const apiController = require('../controllers/api.controller');

router.get('/auth/token', apiController.getToken);
//ruta para obtener la info de la tarjeta

//ruta para hacer un pago

module.exports = router;