'use strict'

var express = require('express');
var MessageController = require('../controllers/message');
var api = express.Router();
var md_auth = require('../middlewares/authenticated');

api.get('/prueba-message', MessageController.probandoMessage);

module.exports = api