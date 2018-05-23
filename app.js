'use strict'

var express = require('express');
var bodyParser = require('body-parser');
var app = express();

//cargar rutas
var user_routes = require('./routes/user');
var follow_routes = require('./routes/follow');
var publication_routes = require('./routes/publication');
var message_route = require('./routes/message');

//cargar middlewares
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

//configurar CORS y cabeceras

//rutas
app.use('/api', user_routes);
app.use('/api', follow_routes);
app.use('/api', publication_routes);
app.use('/api', message_route);

module.exports = app;