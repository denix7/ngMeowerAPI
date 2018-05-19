'use strict'

var express = require('express');
var PublicationControler = require('../controllers/publication');
var api = express.Router();
var md_auth = require('../middlewares/authenticated');

var multipart = require('connect-multiparty');
var md_upload = multipart({uploadDir: './uploads/publications'});

api.get('/prueba-pub', md_auth.ensureAuth, PublicationControler.probando);
api.post('/publication', md_auth.ensureAuth, PublicationControler.savePublication);
api.get('/publications/:page?', md_auth.ensureAuth, PublicationControler.getPublications);
api.get('/publication/:id', md_auth.ensureAuth, PublicationControler.getPublication);
api.delete('/publication-delete/:id', md_auth.ensureAuth, PublicationControler.deletePublication);

module.exports = api;