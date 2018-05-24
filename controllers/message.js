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
    message.viewed = 'false';  
    
    message.save((err, messageStored)=>{
        if(err)
            return res.status(500).send({message: 'Error en la peticion'});
        else if(!messageStored)
            return res.status(404).send({message: 'No existe el mensaje'});
        else    
            return res.status(200).send({message: messageStored}); 
    })
}

function getReceivedMessages(req, res){
    userId = req.user.sub;

    var page = 1;

    if(req.params.page)
        page = req.params.page;

    itemsPerPage = 4;
    
    Message.find({receiver: userId}).populate('emmiter', 'name surname nick image _id').paginate(page, itemsPerPage, (err, messages, total) => {
        if(err)
            return res.status(500).send({message: 'Error en la peticion'});
        else if(!messages)
            return res.status(404).send({message: 'No existen mensajes'});
        else    
            return res.status(200).send({
                total: total,
                pages: Math.ceil(total/itemsPerPage),
                messages
            });        
    })
}

function getEmittMessages(req, res){
    userId = req.user.sub;

    var page = 1;

    if(req.params.page)
        page = req.params.page;

    itemsPerPage = 4;
    
    Message.find({emmiter: userId}).populate('emmiter receiver', 'name surname nick image _id').paginate(page, itemsPerPage, (err, messages, total) => {
        if(err)
            return res.status(500).send({message: 'Error en la peticion'});
        else if(!messages)
            return res.status(404).send({message: 'No existen mensajes'});
        else    
            return res.status(200).send({
                total: total,
                pages: Math.ceil(total/itemsPerPage),
                messages
            });        
    })
}

function getUnviewedMessages(req, res){
    userId = req.user.sub;

    Message.count({receiver: userId, viewed: 'false'}).exec((err, count)=>{
        if(err)
            return res.status(500).send({message: 'Error en la peticion'});
        else    
            return res.status(200).send({'unviewed': count}); 
    });
}

function setViewedMessages(req, res){
    userId = req.user.sub;

    Message.update({receiver: userId, viewed:'false'}, {viewed: 'true'}, {"multi":true}, (err, messagesUpdated)=>{//cual actualizar, el valor a actualizar, multi actualiza todos los documentos, callback
        if(err)
            return res.status(500).send({message: 'Error en la peticion'});
        else    
            return res.status(200).send({messages: messagesUpdated});     
    });
}

module.exports = {
    probandoMessage,
    saveMessage,
    getReceivedMessages,
    getEmittMessages,
    getUnviewedMessages,
    setViewedMessages
}