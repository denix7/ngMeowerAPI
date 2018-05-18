'use strict'

var fs = require('fs');
var path = require('path');
var moment = require('moment');
var mongoosePaginate = require('mongoose-pagination');
var Publication = require('../models/publication');
var User = require('../models/user');
var Follow = require('../models/follow');

function probando(req, res){
    res.status(200).send({message: 'Accion publication works!'});
}

//Crear nueva publicacion
function savePublication(req, res){
    var params = req.body;

    if(!params.text)
        return res.status(200).send({message: 'Debes enviar un texto'});

    var publication = new Publication();    
    publication.user = req.user.sub;
    publication.text = params.text;
    publication.file = null;
    publication.created_at = moment().unix();

    publication.save((err, publicationStored)=>{
        if(err)
            return res.status(500).send({message: 'Error en la peticion'});
        else if(!publicationStored)
            return res.status(404).send({message: 'No se ha creado la publicacion'});
        else{    
            return res.status(200).send({publication: publicationStored});          
        }    
    });
}

module.exports = {
    probando,
    savePublication
}