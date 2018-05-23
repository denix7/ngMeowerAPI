'user strict'

var moment = require('moment');
var mongoosePaginate = require('mongoose-pagination');
var User = require('../models/user');
var Follow = require('../models/follow');
var Message = require('../models/message');

function probandoMessage(req, res){
    res.status(200).send({message: 'Controller message its works!'});
}

function saveMessage(req, res){
    var params = req.body;

    if(!params.text || !params.receiver)
        return res.status(200).send({message: 'Ingrese todos los campos requeridos'});
    
    var message = new Message(); 
    message.emmiter = req.user.sub;
    message.receiver = params.receiver;
    message.text = params.text;
    message.created_at = moment().unix();  
    
    message.save((err, messageStored)=>{
        if(err)
            return res.status(500).send({message: 'Error en la peticion'});
        else if(!messageStored)
            return res.status(404).send({message: 'No existe el mensaje'});
        else    
            return res.status(200).send({message: messageStored}); 
    })
}

module.exports = {
    probandoMessage,
    saveMessage
}