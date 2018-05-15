'use strict'

var mongoosePaginate = require('mongoose-pagination');

var User = require('../models/user');
var follow = require('../models/follow');

//Pruebas
function prueba (req, res){
    res.status(200).send({message: 'Accion follow works!'});
}

module.exports = {
    prueba
}