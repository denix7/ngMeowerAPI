'use strict'

var User = require('../models/user');

function home (req, res){
    res.status(200).send({message: 'Accion user works!'});
}

function pruebas (req, res){
    res.status(200).send({message: 'Accion pruebas its works!'});
}

module.exports = {
    home,
    pruebas
}