'use strict'

var mongoosePaginate = require('mongoose-pagination');

var User = require('../models/user');
var Follow = require('../models/follow');

//Pruebas
function prueba (req, res){
    res.status(200).send({message: 'Accion follow works!'});
}

//Seguir usuario
function saveFollow(req, res){
    var params = req.body;
    var follow = new Follow();
    
    follow.user = req.user.sub;//id del usuario identificado
    follow.followed = params.followed;//le paso por parametro el valor followed, id al que quiero seguir

    follow.save((err, followStored)=>{
        if(err)
            return res.status(500).send({message: 'Error al guardar el seguimiento'});
        else if(!followStored)
            return res.status(404).send({message: 'El seguimiento no se ha guardado'});
        else    
            return res.status(200).send({follow: followStored});        
    })
}

module.exports = {
    prueba,
    saveFollow
}