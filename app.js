'use strict'

var express = require('express');
var bodyParser = require('body-parser');
var app = express();

//cargar rutas

//cargar middlewares
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

//configurar CORS y cabeceras

//configurar rutas base
app.get('/pruebas', (req, res)=>{
    res.status(200).send({message: 'Pruebas servidor'});
});

app.get('/', (req, res)=>{
    res.status(200).send({message: 'Pruebas servidor Home'});
});

module.exports = app;